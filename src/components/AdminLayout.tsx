import { Navigate, Outlet } from "react-router-dom";
import AdminMenuPanel from "./AdminMenuPanel";
import { useAuth } from "../context/authContext";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  // 1. Loading නම් මුකුත් පෙන්නන්න එපා (හෝ Loading Spinner එකක් දෙන්න)
  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-green-500">Loading Admin Core...</div>;

  // 2. User කෙනෙක් නැත්නම් Login එකට යවන්න
  if (!user) return <Navigate to="/login" replace />;

  // 🟢 3. User හිටියත් Admin කෙනෙක් නෙමෙයි නම්, සාමාන්‍ය Home එකට යවන්න (නිවැරදි කළ ස්ථානය)
  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // 4. Admin නම් Layout එක පෙන්නන්න
  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-green-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      
      {/* Sidebar */}
      <AdminMenuPanel />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
        <Outlet /> {/* මෙතනින් තමයි Dashboard, PlayerManage වගේ pages Load වෙන්නේ */}
      </div>
    </div>
  );
}