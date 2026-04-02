import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Gamepad2, 
  ListTree, 
  Settings, 
  LogOut,
  ShieldAlert,
  Hash
} from "lucide-react";
import { useAuth } from "../context/authContext";

export default function AdminMenuPanel() {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Auth context එකෙන්

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} />, exact: true },
    { name: "Player Manage", path: "/admin/players", icon: <Users size={20} /> },
    { name: "Game Manage", path: "/admin/games", icon: <Gamepad2 size={20} /> },
    { name: "Category Manage", path: "/admin/categories", icon: <ListTree size={20} /> },
    { name: "Tag Manage", path: "/admin/tags", icon: <Hash size={20} /> },
    { name: "System Settings", path: "/admin/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-[#050505]/80 backdrop-blur-xl border-r border-green-500/20 flex flex-col relative z-20">
      
      {/* 🛡️ Admin Logo Area */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3 text-green-500 mb-2">
          <ShieldAlert size={28} className="drop-shadow-[0_0_8px_#22c55e]" />
          <h2 className="text-xl font-black tracking-widest uppercase text-white">
            Admin<span className="text-green-500">-X</span>
          </h2>
        </div>
        <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">Command Center</p>
      </div>

      {/* 📋 Navigation Links */}
      <div className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-mono uppercase text-sm tracking-wider ${
                isActive
                  ? "bg-green-500/10 text-green-400 border border-green-500/30 shadow-[inset_0_0_15px_rgba(34,197,94,0.1)]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* 🚪 Logout Area */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-300 font-mono uppercase text-sm tracking-wider border border-transparent hover:border-red-500/30"
        >
          <LogOut size={20} />
          System Logout
        </button>
      </div>
    </div>
  );
}