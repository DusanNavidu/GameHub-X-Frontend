import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/authContext";
import AdminLayout from "../components/AdminLayout";
import PlayerLayout from "../components/PlayerLayout";

const Index = lazy(() => import("../pages"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const CategoryManage = lazy(() => import("../pages/admin/CategoryManage"));
const AdminGameManage = lazy(() => import("../pages/admin/AdminGameManage"));
const PlayGame = lazy(() => import("../pages/PlayGame"));
const PlayerDashboard = lazy(() => import("../pages/player/PlayerDashboard"));

type RequireAuthTypes = { children: ReactNode; roles?: string[] };

const GamingLoader = ({ text = "LOADING CORE" }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black overflow-hidden relative font-sans">
      <div className="absolute w-[600px] h-[600px] bg-green-900/20 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="relative flex items-center justify-center w-40 h-40">
        <div className="absolute inset-0 border-2 border-green-500 rounded-full animate-spin [animation-duration:3s] opacity-20"></div>
        <div className="absolute -inset-2 border-l-4 border-r-4 border-green-500 rounded-full animate-spin [animation-duration:2s]"></div>
        <div className="absolute -inset-4 border-t-2 border-b-2 border-white rounded-full animate-spin-reverse [animation-duration:4s] opacity-50"></div>
        <div className="relative flex items-center justify-center">
          <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_15px_#22c55e] animate-pulse"></div>
          <div className="absolute w-10 h-[2px] bg-white opacity-80"></div>
          <div className="absolute h-10 w-[2px] bg-white opacity-80"></div>
          <div className="absolute -top-6 -left-6 w-4 h-4 border-t-2 border-l-2 border-green-500"></div>
          <div className="absolute -top-6 -right-6 w-4 h-4 border-t-2 border-r-2 border-green-500"></div>
          <div className="absolute -bottom-6 -left-6 w-4 h-4 border-b-2 border-l-2 border-green-500"></div>
          <div className="absolute -bottom-6 -right-6 w-4 h-4 border-b-2 border-r-2 border-green-500"></div>
        </div>
      </div>
      <div className="mt-16 text-center z-10">
        <h2 className="text-white text-3xl font-black italic tracking-[0.3em] uppercase relative animate-pulse">
          GameHub-<span className="text-green-500 drop-shadow-[0_0_8px_#22c55e]">X</span>
          <span className="absolute inset-0 text-white opacity-10 animate-glitch">GameHub-<span className="text-green-500">X</span></span>
        </h2>
        <div className="flex items-center justify-center gap-3 mt-4 border-t border-green-900/50 pt-3">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-[0.5em] ml-2">{text}</span>
          <div className="flex gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-loader-dot [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-loader-dot [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-loader-dot"></span>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes loader-dot { 0%, 80%, 100% { transform: scale(0); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }
        @keyframes glitch { 0%, 100% { text-shadow: 1px 0 0 #fff, -1px 0 0 #22c55e; transform: translate(0); } 20% { text-shadow: 1px 0 0 #fff, -1px 0 0 #22c55e; transform: translate(-2px, 2px); } 40% { text-shadow: -1px 0 0 #fff, 1px 0 0 #22c55e; transform: translate(-2px, -2px); } 60% { text-shadow: 1px 0 0 #fff, -1px 0 0 #22c55e; transform: translate(2px, 2px); } 80% { text-shadow: -1px 0 0 #fff, 1px 0 0 #22c55e; transform: translate(2px, -2px); } }
        .animate-spin-reverse { animation: spin-reverse linear infinite; }
        .animate-loader-dot { animation: loader-dot 1.4s infinite ease-in-out both; }
        .animate-glitch { animation: glitch 2s infinite; animation-timing-function: steps(2, end); }
      `}</style>
    </div>
  );
};

// =========================================================
// Main Router & Auth Logic
// =========================================================

const RequireAuth = ({ children, roles }: RequireAuthTypes) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <GamingLoader text="Authenticating User" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🟢 user.role එක (තනි String) roles Array එකේ තියෙනවද බලනවා
  const userRole = user.role || user.roles; // fallback එකක් විදිහට roles තිබ්බොත් ඒක ගන්නවා

  // userRole එක තියෙනවා නම් සහ roles array එකක් දීලා තියෙනවා නම් ඒක check කරනවා
  const hasAccess = roles ? roles.some(r => r.toUpperCase() === (typeof userRole === 'string' ? userRole.toUpperCase() : '')) : true;

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white font-mono">
        <div className="text-center p-10 border-2 border-red-600 bg-red-950/20 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.3)]">
          <h2 className="text-3xl font-bold mb-4 text-red-500 uppercase tracking-widest">ACCESS DENIED</h2>
          <p className="text-gray-300">Clearance level insufficient to view this sector.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<GamingLoader text="Initializing Arena" />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/play/:id" element={<PlayGame />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route 
            path="/admin" 
            element={
              <RequireAuth roles={["ADMIN"]}>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="games" element={<AdminGameManage />} />
            <Route path="categories" element={<CategoryManage />} />
          </Route>

          <Route
            path="/player"
            element={
              <RequireAuth>
                <PlayerLayout />
                </RequireAuth>
            }
          >
            <Route index element={<PlayerDashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}