import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User as UserIcon, LogOut, ShieldAlert, Activity } from "lucide-react";
import { useAuth } from "../context/authContext";
import UserProfileModal from "./UserProfileModal";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export default function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <>
      {/* 🟢 Responsive Container: Flex-wrap සහ Order පාවිච්චි කරලා තියෙනවා */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-black/40 backdrop-blur-xl border border-green-500/20 p-4 rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.05)]">
        
        {/* 1. Logo Area (Order 1) */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group order-1" onClick={() => navigate("/")}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <span className="w-1.5 h-4 sm:w-2 sm:h-5 bg-green-500 inline-block rounded-sm animate-pulse"></span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-widest text-white drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] uppercase">
            {/* Phone එකේදී "GH-X" කියලත්, ලොකු Screen වල "GameHub-X" කියලත් පෙනේවි */}
            <span className="hidden sm:inline">Game</span>GH<span className="hidden sm:inline">ub-</span><span className="text-green-500">X</span>
          </h2>
        </div>

        {/* 2. Player Special Profile Area (Mobile: Order 2, Desktop: Order 3) */}
        <div className="flex items-center order-2 md:order-3">
          {user && (
            <div className="flex items-center gap-2 sm:gap-4 bg-white/5 p-1 sm:pl-4 sm:pr-2 sm:py-1.5 rounded-full border border-white/5">
              
              {/* Online Status Badge (Mobile එකේදී ඉඩ ඉතුරු කරන්න හංගලා තියෙන්නේ) */}
              <div className="hidden lg:flex items-center gap-1.5 px-2">
                <Activity size={14} className="text-green-500 animate-pulse" />
                <span className="text-[10px] text-green-500 font-mono tracking-widest uppercase">Online</span>
              </div>

              {/* Admin Button */}
              {user.role === "ADMIN" && (
                <button onClick={() => navigate("/admin/dashboard")} className="text-[10px] font-black text-green-400 flex items-center gap-1 uppercase tracking-widest border border-green-500/30 px-2 sm:px-3 py-1.5 rounded-full bg-green-500/10 hover:bg-green-500/20 transition-colors">
                  <ShieldAlert size={14} /> <span className="hidden sm:inline">CMD</span>
                </button>
              )}
              
              {/* Profile Area */}
              <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group px-1 sm:px-2 sm:border-l border-white/10" onClick={() => setShowProfileModal(true)}>
                
                {/* Name & Role (Mobile එකේදී හංගලා තියෙන්නේ) */}
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-green-400 transition-colors">{user.fullname}</p>
                  <p className="text-[9px] text-gray-400 font-mono tracking-[0.2em] uppercase">{user.role} <span className="text-green-500">◆</span></p>
                </div>

                {/* Avatar (හැමවෙලේම පේනවා) */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-green-500/50 overflow-hidden bg-black/80 group-hover:border-green-400 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-full h-full p-1.5 sm:p-2 text-green-500" />
                  )}
                </div>
              </div>
              
              {/* Logout Button */}
              <button onClick={() => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                setUser(null);
                window.location.reload();
              }} className="p-2 sm:p-2 text-gray-500 hover:text-red-500 transition-colors rounded-full hover:bg-red-500/10" title="Disconnect">
                <LogOut size={16} />
              </button>

            </div>
          )}
        </div>

        {/* 3. Search Bar (Mobile: Order 3 සහ Full Width, Desktop: Order 2) */}
        <div className="relative w-full md:flex-1 md:max-w-md group order-3 md:order-2 mt-2 md:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search arsenal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/60 transition-all font-mono shadow-inner"
          />
        </div>

      </header>

      {/* Profile Modal */}
      {showProfileModal && user && (
        <UserProfileModal 
          user={user} 
          onClose={() => setShowProfileModal(false)}
          onUpdateSuccess={(newPicUrl) => setUser({ ...user, profilePic: newPicUrl })}
        />
      )}
    </>
  );
}