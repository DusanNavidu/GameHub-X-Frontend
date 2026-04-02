// src/service/tag.ts
import api from "./api";

export interface TagData {
  _id: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

// 1. Get All Tags (with pagination, search, and status filter)
export const getTags = async (search?: string, status?: string, page: number = 1, limit: number = 10) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status && status !== "ALL") params.append("status", status);
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  
  const res = await api.get(`/tags?${params.toString()}`);
  return res.data;
};

// 2. Create a new Tag
export const createTag = async (data: { name: string }) => {
  const res = await api.post("/tags", data);
  return res.data;
};

// 3. Update an existing Tag
export const updateTag = async (id: string, data: { name: string }) => {
  const res = await api.put(`/tags/${id}`, data);
  return res.data;
};

// 4. Toggle Tag Status (Active/Inactive)
export const toggleTagStatus = async (id: string) => {
  const res = await api.patch(`/tags/${id}/status`);
  return res.data;
};

// 5. Get All Active Tags WITHOUT Pagination (For Game Add Dropdown)
export const getTagsForAdminGameAdd = async () => {
  const res = await api.get(`/tags/all-active`);
  return res.data;
};