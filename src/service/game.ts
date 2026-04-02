import api from "./api";

export interface GameData {
  _id: string;
  title: string;
  description: string;
  categoryId: { _id: string; name: string };
  gameTypeId: { _id: string; name: string };
  tags: { _id: string; name: string }[]; // 🟢 Tags Array එක එකතු කළා
  thumbnailUrl: string;
  gameUrl: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

// 🟢 Pagination සමග දත්ත ලබාගැනීම
export const getGames = async (search?: string, category?: string, status?: string, page: number = 1, limit: number = 10) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category && category !== "ALL") params.append("category", category);
  if (status && status !== "ALL") params.append("status", status);
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  
  // ඔයාගේ අලුත් Admin Route එක
  const res = await api.get(`/games/admin/getall?${params.toString()}`);
  return res.data;
};

export const getPublicGames = async (search?: string, category?: string, page: number = 1) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category && category !== "ALL") params.append("category", category);
  params.append("page", page.toString());
  // Limit එක Backend එකෙන් 30ක් කියලා දාලා තියෙන නිසා මෙතනින් යවන්න ඕනේ නෑ
  
  const res = await api.get(`/games/public/getall?${params.toString()}`);
  return res.data;
};

export const createGame = async (formData: FormData) => {
  const res = await api.post("/games", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateGame = async (id: string, formData: FormData) => {
  const res = await api.put(`/games/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const toggleGameStatus = async (id: string) => {
  const res = await api.patch(`/games/${id}/status`);
  return res.data;
};