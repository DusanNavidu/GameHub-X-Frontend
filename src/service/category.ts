import api from "./api";

export interface CategoryData {
  _id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export const getCategories = async (search?: string, status?: string, page: number = 1, limit: number = 10) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status && status !== "ALL") params.append("status", status);
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  
  const res = await api.get(`/categories?${params.toString()}`);
  return res.data; 
};

export const getPublicCategories = async () => {
  const res = await api.get("/categories/public/getall");
  return res.data;
};

export const createCategory = async (data: { name: string; description: string }) => {
  const res = await api.post("/categories", data);
  return res.data;
};

export const updateCategory = async (id: string, data: { name: string; description: string }) => {
  const res = await api.put(`/categories/${id}`, data);
  return res.data;
};

export const toggleCategoryStatus = async (id: string) => {
  const res = await api.patch(`/categories/${id}/status`);
  return res.data;
};