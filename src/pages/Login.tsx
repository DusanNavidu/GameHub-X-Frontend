import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, KeyRound, ArrowRight, ShieldCheck, Gamepad2 } from "lucide-react";
import Button from "../components/Button";
import { sendLoginOTP, verifyLoginOTP } from "../service/auth";
import { useAuth } from "../context/authContext";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Context එකෙන් user update කරන්න ගත්තා
  
  const [step, setStep] = useState<1 | 2>(1); // 1 = Email, 2 = OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      await sendLoginOTP(email);
      setMessage("OTP sent to your email! Please check.");
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const data = await verifyLoginOTP({ email, otp });
      
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      setUser(data.data); // Auth Context එක update කරනවා

      // 🟢 'roles' (Array) වෙනුවට 'role' (String) පරීක්ෂා කිරීම
      // ඔයාගේ Backend එකෙන් එන්නේ 'role' නිසා data.data.role === "ADMIN" කියලා check කරන්න ඕනේ.
      if (data.data.role === "ADMIN" || (data.data.roles && data.data.roles.includes("ADMIN"))) {
        navigate("/admin/dashboard");
      } else {
        navigate("/player");
      }
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans flex items-center justify-center p-4 relative overflow-hidden text-white">
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-green-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <Gamepad2 className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]">
            System <span className="text-green-500">Login</span>
          </h2>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">{error}</div>}
        {message && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm text-center">{message}</div>}

        <form onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP} className="space-y-5">
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" />
            <input
              type="email"
              required
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={step === 2}
              className="w-full bg-black/40 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-all font-mono disabled:opacity-50"
            />
          </div>

          {step === 2 && (
            <div className="relative group animate-in slide-in-from-bottom-4 duration-300">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" />
              <input
                type="text"
                required
                placeholder="ENTER OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="w-full bg-black/40 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-center text-2xl tracking-[0.5em] text-green-400 focus:outline-none focus:border-green-500 font-black shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
              />
            </div>
          )}

          <Button variant="green" size="lg" className="w-full mt-6" disabled={loading}>
            {loading ? "Processing..." : step === 1 ? <><ShieldCheck size={18} /> Send OTP</> : <><ArrowRight size={18} /> Verify & Enter</>}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 font-mono border-t border-gray-800 pt-6">
          NEW TO GAMEHUB-X? <Link to="/register" className="text-green-500 hover:text-green-400 font-bold hover:underline">REGISTER NOW</Link>
        </div>
      </div>
    </div>
  );
}