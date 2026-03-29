import api from "./api";

export const registerUser = async (data: { fullname: string; email: string }) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const sendLoginOTP = async (email: string) => {
  const res = await api.post("/auth/send-otp", { email });
  return res.data;
};

export const verifyLoginOTP = async (data: { email: string; otp: string }) => {
  const res = await api.post("/auth/verify-otp", data);
  return res.data;
};

export const getMyDetails = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const refreshTokens = async (refreshToken: string) => {
  const res = await api.post("/auth/refresh", { token: refreshToken });
  return res.data;
};

export const getRole = async () => {
  const res = await api.get("/auth/role")
  return res.data
}

export const updateProfilePic = async (formData: FormData) => {
  const res = await api.put("/auth/profile-pic", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};