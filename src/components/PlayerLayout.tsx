import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProgressiveImage from "../components/ProgressiveImage";

export default function PlayerLayout() {
  const [showIntro, setShowIntro] = useState(true);
  const [zoomLogo, setZoomLogo] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // 🟢 Search State එක මෙතන තියාගන්නවා

  useEffect(() => {
    // Intro එක ඉක්මනින් ඉවර වෙන්න කාලය අඩු කළා (1.5s)
    const zoomTimer = setTimeout(() => setZoomLogo(true), 50);
    const introTimer = setTimeout(() => setShowIntro(false), 1500);
    return () => { clearTimeout(zoomTimer); clearTimeout(introTimer); };
  }, []);

  if (showIntro) {
    return (
      <div className="h-screen w-full bg-[#050505] flex items-center justify-center overflow-hidden px-4 relative">
        <div className="absolute w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[150px]"></div>
        <div className={`relative z-10 flex flex-col items-center transition-all duration-700 ease-out transform ${zoomLogo ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}>
          <ProgressiveImage lowResSrc="https://i.ibb.co/low-quality-link-here.jpg" highResSrc="https://i.ibb.co/VWmrz715/Game-Hub-X-lago.png" alt="Logo" className="w-48 sm:w-64 h-auto mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]" />
          <p className="text-green-500 font-mono tracking-[0.4em] text-xs animate-pulse uppercase">Verifying Operator Credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-green-500/30 overflow-x-hidden relative">
      {/* Background Ambient Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-green-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-10 relative z-10 flex flex-col min-h-screen">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        {/* 🟢 Main Content Area (Outlet හරහා search state යවනවා) */}
        <main className="flex-1">
          <Outlet context={{ searchQuery }} />
        </main>
        
        <Footer />
      </div>
    </div>
  );
}