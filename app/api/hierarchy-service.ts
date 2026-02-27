import {
  GetHierarchyUsersParams,
  AddHierarchyMemberPayload,
  EditHierarchyMemberPayload,
  DeleteHierarchyMemberPayload,
} from "../types/hierarchy";
import api from "./axios-instance";

export const hierarchyService = {
  getHierarchyChart: async () => {
    const { data } = await api.get("/hierarchy/chart");
    return data;
  },

  addHierarchyMember: async (payload: AddHierarchyMemberPayload) => {
    const { data } = await api.post("/hierarchy/", payload);
    return data;
  },

  editHierarchyMember: async (payload: EditHierarchyMemberPayload) => {
    // We extract ID for the URL and send the rest as the body
    const { id, ...body } = payload;
    const { data } = await api.put(`/hierarchy/${id}`, body);
    return data;
  },

  getHierarchyUsers: async (params: GetHierarchyUsersParams) => {
    const { data } = await api.get("/hierarchy/user-list", {
      params: {
        start: params.page,
        limit: params.limit,
        search: params.search,
      },
    });
    return data;
  },

  deleteHierarchyMember: async (payload: DeleteHierarchyMemberPayload) => {
    const { data } = await api.delete(`/hierarchy/${payload.id}`);

    return data;
  },
};
