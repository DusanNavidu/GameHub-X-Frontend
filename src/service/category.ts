import api from "./api";

export interface CategoryData {
  _id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

// 1. සියලුම Categories ගැනීම (Search & Status filter සමග)
export const getCategories = async (search?: string, status?: string) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status && status !== "ALL") params.append("status", status);
  
  const res = await api.get(`/categories?${params.toString()}`);
  return res.data;
};

// 2. අලුත් Category එකක් හැදීම
export const createCategory = async (data: { name: string; description: string }) => {
  const res = await api.post("/categories", data);
  return res.data;
};

// 3. Category එකක් Edit කිරීම
export const updateCategory = async (id: string, data: { name: string; description: string }) => {
  const res = await api.put(`/categories/${id}`, data);
  return res.data;
};

// 4. Status එක මාරු කිරීම (Active/Inactive)
export const toggleCategoryStatus = async (id: string) => {
  const res = await api.patch(`/categories/${id}/status`);
  return res.data;
};