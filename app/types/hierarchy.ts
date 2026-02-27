
export interface Employee {
  id: string;
  userId: string;
  name: string;
  title: string;
  managerId: string | null;
  avatarUrl?: string;
  children: Employee[];
}

export interface ExternalUser {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  title?: string;
  avatarUrl?: string;
}


export type TreeLayout = "vertical" | "horizontal";


export interface TreeNodeProps {
  node: Employee;
  layout: TreeLayout;
  expandedIds: Set<string>;
  onEdit: (node: Employee) => void;
  onAdd: (managerId: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}
export interface GetHierarchyUsersParams {
  page: number;
  limit: number;
  search: string;
}

export interface AddHierarchyMemberPayload {
  userId: string;
  managerId: string;
}

export interface EditHierarchyMemberPayload {
  id: string;
  managerId: string;
  userId: string;
}

export interface DeleteHierarchyMemberPayload {
  id: string;
}