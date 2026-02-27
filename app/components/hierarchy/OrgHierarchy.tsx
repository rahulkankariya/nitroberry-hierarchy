"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network,  Columns, Rows } from "lucide-react";
import { notify } from "@/app/utils/toast";
import { Loader } from "../../components/common/loader";
// Types & Services
import { Employee, ExternalUser } from "@/app/types/hierarchy";
import { hierarchyService } from "../../api/hierarchy-service";

// Components
import { TreeNode } from "./TreeNode";
import { EditModal } from "./EditModal";
import { ConfirmDialog } from "./ConfirmDialog";

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
  // --- State ---
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

  // --- Actions ---
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
    if (!deleteConfirmId) return; // TS Guard
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        // min-h-[calc(100vh-200px)] ensures it fills the dashboard space without squishing
        className="relative flex flex-col bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm min-h-[calc(100vh)] w-full"
      >
        <header className="p-4 bg-white border-b flex flex-wrap items-center justify-between gap-4 shrink-0 z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded text-white shadow-sm">
                <Network size={18} />
              </div>
              <h1 className="font-bold text-slate-800 tracking-tight">Organization</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Expand/Collapse Group */}
              <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200 shadow-sm">
                <button
                  onClick={() => setExpandedIds(new Set(getAllNodeIds(roots)))}
                  className="px-3 py-1 hover:bg-white text-slate-600 hover:text-indigo-600 rounded text-[10px] font-extrabold transition-all uppercase"
                >
                  Expand All
                </button>
                <div className="w-px bg-slate-200 mx-1" />
                <button
                  onClick={() => setExpandedIds(new Set())}
                  className="px-3 py-1 hover:bg-white text-slate-600 hover:text-indigo-600 rounded text-[10px] font-extrabold transition-all uppercase"
                >
                  Collapse
                </button>
              </div>

              {/* Layout Switcher */}
              <div className="flex bg-indigo-50 p-1 rounded-md border border-indigo-100 gap-1 shadow-sm">
                <button
                  onClick={() => setLayout("vertical")}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-[10px] font-extrabold transition-all ${
                    layout === "vertical" ? "bg-indigo-600 text-white" : "text-indigo-600 hover:bg-white"
                  }`}
                >
                  <Rows size={14} /> VERTICAL
                </button>
                <button
                  onClick={() => setLayout("horizontal")}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-[10px] font-extrabold transition-all ${
                    layout === "horizontal" ? "bg-indigo-600 text-white" : "text-indigo-600 hover:bg-white"
                  }`}
                >
                  <Columns size={14} /> HORIZONTAL
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Chart Area: flex-1 allows it to take all remaining height */}
        <main className="flex-1 overflow-auto p-12 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[32px_32px]">
          {isInitialLoading ? (
            // <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            //   <Loader2 className="animate-spin" />
            //   <p className="text-sm font-medium">Building hierarchy view...</p>
            // </div>
            <Loader/>
          ) : (
            /* inline-flex + min-w-full ensurescentering but allows scroll if content is wider */
            <div className={`inline-flex min-w-full justify-center ${layout === "vertical" ? "flex-col items-center" : "flex-row items-start"}`}>
              {roots.map((root) => (
                <TreeNode
                  key={`root-${root.id}`}
                  node={root}
                  layout={layout}
                  expandedIds={expandedIds}
                  onEdit={(node: Employee) => { handleCancel(); setEditingNode(node); }}
                  onAdd={(mgrId: string) => {
                    handleCancel();
                    setIsAddingNew(true);
                    setEditingNode({ id: "", userId: "", name: "", title: "", managerId: mgrId, children: [] });
                  }}
                  onDelete={(id: string) => setDeleteConfirmId(id)}
                  onToggle={(id: string) => setExpandedIds((prev) => {
                    const next = new Set(prev);
                    next.has(id) ? next.delete(id) : next.add(id);
                    return next;
                  })}
                />
              ))}
            </div>
          )}
        </main>

        {/* Modals & Dialogs */}
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
                // Safeguard managerId and ID for TS
                const payload = { 
                  userId: updated.userId, 
                  managerId: updated.managerId ?? "" 
                };
                
                if (isAddingNew) {
                  await hierarchyService.addHierarchyMember(payload);
                } else {
                  await hierarchyService.editHierarchyMember({ ...payload, id: updated.id || "" });
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