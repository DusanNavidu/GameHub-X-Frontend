import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, User, ArrowRight, Gamepad2 } from "lucide-react";
import Button from "../components/Button";
import { registerUser } from "../service/auth";
import { useAuth } from "../context/authContext";

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const data = await registerUser({ fullname, email });
      
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.data);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans flex items-center justify-center p-4 relative overflow-hidden text-white">
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Gamepad2 className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
            Create <span className="text-blue-500">ID</span>
          </h2>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              required
              placeholder="PLAYER NAME"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full bg-black/40 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
            />
          </div>

          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="email"
              required
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
            />
          </div>

          <Button variant="info" size="lg" className="w-full mt-6" disabled={loading}>
            {loading ? "Processing..." : <><ArrowRight size={18} /> Join Arena</>}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 font-mono border-t border-gray-800 pt-6">
          ALREADY A PLAYER? <Link to="/login" className="text-blue-500 hover:text-blue-400 font-bold hover:underline">LOGIN HERE</Link>
        </div>
      </div>
    </div>
  );
}