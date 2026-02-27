"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notify } from "@/app/utils/toast";
import { Loader } from "../../components/common/loader";

// Types & Services
import { Employee, ExternalUser } from "@/app/types/hierarchy";
import { hierarchyService } from "../../api/hierarchy-service";

// Components
import { TreeNode } from "./TreeNode";
import { EditModal } from "./EditModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { HierarchyHeader } from "./HierarchyHeader";

const getAllNodeIds = (nodes: Employee[]): string[] => {
  let ids: string[] = [];
  nodes.forEach((node) => {
    ids.push(node.id);
    if (node.children && node.children.length > 0) {
      ids = [...ids, ...getAllNodeIds(node.children)];
    }
  });
  return ids;
};

export default function OrgHierarchyContainer() {
  const [roots, setRoots] = useState<Employee[]>([]);
  const [availableUsers, setAvailableUsers] = useState<ExternalUser[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [layout, setLayout] = useState<"vertical" | "horizontal">("vertical");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [editingNode, setEditingNode] = useState<Employee | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isFetchingRef = useRef(false);

  const loadChart = async () => {
    setIsInitialLoading(true);
    try {
      const response = await hierarchyService.getHierarchyChart();
      const data = response || [];
      setRoots(data);
      if (data.length > 0) {
        setExpandedIds(new Set(getAllNodeIds(data)));
      }
    } catch (e) {
      notify.error("Failed to load hierarchy");
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadChart();
  }, []);

  const handleCancel = () => {
    setEditingNode(null);
    setIsAddingNew(false);
    setSearch("");
    setAvailableUsers([]);
    setPage(1);
    setIsSaving(false);
    isFetchingRef.current = false;
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await hierarchyService.deleteHierarchyMember({ id: deleteConfirmId });
      notify.success("Member removed");
      await loadChart();
    } catch (e) {
      notify.error("Could not remove member");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Search Logic (Debounced)
  useEffect(() => {
    if (!editingNode) return;

    const timer = setTimeout(async () => {
      setIsSearchLoading(true);
      try {
        const limit = 10;
        const response = await hierarchyService.getHierarchyUsers({
          search,
          page,
          limit,
        });

        const newUsers = response.users || [];
        const pagination = response.pagination;

        setAvailableUsers((prev) => {
          if (page === 1) return newUsers;
          const existingIds = new Set(prev.map((u) => u.id));
          return [
            ...prev,
            ...newUsers.filter((u: ExternalUser) => !existingIds.has(u.id)),
          ];
        });

        setHasMore(pagination.next !== null && page < pagination.totalPages);
      } catch (e) {
        console.error("Search failed", e);
        setHasMore(false);
      } finally {
        setIsSearchLoading(false);
        isFetchingRef.current = false;
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, page, editingNode]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm min-h-screen w-full"
      >
        <HierarchyHeader
          layout={layout}
          setLayout={setLayout}
          onExpandAll={() => setExpandedIds(new Set(getAllNodeIds(roots)))}
          onCollapseAll={() => setExpandedIds(new Set())}
        />

        <main className="flex-1 overflow-auto p-12 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[32px_32px]">
          {isInitialLoading ? (
            <Loader />
          ) : (
            <div
              className={`inline-flex min-w-full justify-center ${
                layout === "vertical" ? "flex-col items-center" : "flex-row items-start"
              }`}
            >
              {roots.map((root) => (
                <TreeNode
                  key={`root-${root.id}`}
                  node={root}
                  layout={layout}
                  expandedIds={expandedIds}
                  isRoot={true} // Marked as Root
                  onEdit={(node: Employee) => {
                    handleCancel();
                    setEditingNode(node);
                  }}
                  onAdd={(mgrId: string) => {
                    handleCancel();
                    setIsAddingNew(true);
                    setEditingNode({
                      id: "",
                      userId: "",
                      name: "",
                      title: "",
                      managerId: mgrId,
                      children: [],
                    });
                  }}
                  onDelete={(id: string) => setDeleteConfirmId(id)}
                  onToggle={(id: string) =>
                    setExpandedIds((prev) => {
                      const next = new Set(prev);
                      next.has(id) ? next.delete(id) : next.add(id);
                      return next;
                    })
                  }
                />
              ))}
            </div>
          )}
        </main>

        {editingNode && (
          <EditModal
            node={editingNode}
            availableUsers={availableUsers}
            isLoading={isSearchLoading}
            isSaving={isSaving}
            hasMore={hasMore}
            searchTerm={search}
            onLoadMore={() => {
              if (!isFetchingRef.current && !isSearchLoading && hasMore) {
                isFetchingRef.current = true;
                setPage((p) => p + 1);
              }
            }}
            onSearch={(val) => {
              setSearch(val);
              setPage(1);
              setAvailableUsers([]);
            }}
            onUpdateField={(updated: Employee) => setEditingNode(updated)}
            onSave={async (updated: Employee) => {
              setIsSaving(true);
              try {
                const payload = {
                  userId: updated.userId,
                  managerId: updated.managerId ?? "",
                };
                if (isAddingNew) {
                  await hierarchyService.addHierarchyMember(payload);
                } else {
                  await hierarchyService.editHierarchyMember({
                    ...payload,
                    id: updated.id || "",
                  });
                }
                notify.success("Changes saved successfully");
                await loadChart();
                handleCancel();
              } catch (e) {
                notify.error("Action failed");
              } finally {
                setIsSaving(false);
              }
            }}
            onCancel={handleCancel}
          />
        )}

        <ConfirmDialog
          isOpen={!!deleteConfirmId}
          title="Remove Member?"
          description="Confirming will remove this member from the hierarchy. Their reports will move to the manager above."
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirmId(null)}
          variant="danger"
        />
      </motion.div>
    </AnimatePresence>
  );
}