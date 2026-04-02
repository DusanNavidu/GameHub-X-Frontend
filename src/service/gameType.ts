import api from "./api";

export interface GameTypeData {
  _id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export const getActiveGameTypes = async () => {
  // 🟢 මෙතන `/game-types/active` කියලා හරියටම තියෙන්න ඕනේ
  const res = await api.get(`/game-types/active`); 
  return res.data;
};

export const getPublicGameTypes = async () => {
  const res = await api.get(`/game-types/public/getall`);
  return res.data;
};