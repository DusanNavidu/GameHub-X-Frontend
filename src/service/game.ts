import api from "./api";

export interface GameData {
  _id: string;
  title: string;
  description: string;
  categoryId: { _id: string; name: string };
  thumbnailUrl: string;
  gameUrl: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export const getGames = async (search?: string, category?: string, status?: string) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category && category !== "ALL") params.append("category", category);
  if (status && status !== "ALL") params.append("status", status);
  
  const res = await api.get(`/games?${params.toString()}`);
  return res.data;
};

// 🟢 මෙතනදී data විදිහට එන්නේ FormData object එකක්
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