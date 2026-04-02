import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Maximize2, RotateCcw, AlertTriangle, Gamepad2, Cpu, Wifi } from "lucide-react";
import { getGames, type GameData } from "../service/game";

export default function PlayGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameData | null>(null);
  
  // Loading States
  const [dbLoading, setDbLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showLoader, setShowLoader] = useState(true);
  const [loadingText, setLoadingText] = useState("INITIALIZING SECURE CONNECTION...");

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await getGames();
        const found = res.data.find((g: GameData) => g._id === id);
        setGame(found);
      } catch (err) {
        console.error(err);
      } finally {
        setDbLoading(false);
      }
    };
    fetchGame();
  }, [id]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (showLoader) {
      interval = setInterval(() => {
        setProgress((prev) => {
          // Progress එක අහඹු විදිහට වැඩි වෙනවා
          let next = prev + Math.floor(Math.random() * 8) + 1;
          
          // API එක Load වෙනකම් 40% න් නවතිනවා
          if (dbLoading && next > 40) next = 40;
          // Game Iframe එක Load වෙනකම් 90% න් නවතිනවා
          if (!dbLoading && !iframeLoaded && next > 90) next = 90;
          
          return next;
        });
      }, 150);

      // Loading Texts
      if (progress < 25) setLoadingText("ESTABLISHING UPLINK TO GAMEHUB-X CORE...");
      else if (progress < 50) setLoadingText("DECRYPTING ASSETS & SYNCING DATA...");
      else if (progress < 85) setLoadingText("MOUNTING VIRTUAL ENVIRONMENT...");
      else setLoadingText("FINALIZING RENDERING PROTOCOLS...");

      // ඔක්කොම Load වුණාම 100% කරලා Loader එක අයින් කරනවා
      if (!dbLoading && iframeLoaded) {
        setProgress(100);
        setLoadingText("ASSET READY. ENGAGE.");
        setTimeout(() => setShowLoader(false), 800); // 100% වෙලා තත්පරයක් ඉඳලා අයින් වෙනවා
      }
    }

    return () => clearInterval(interval);
  }, [dbLoading, iframeLoaded, progress, showLoader]);

  // Error State
  if (!dbLoading && !game) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-red-500 font-mono">
      <AlertTriangle size={64} className="mb-4 animate-pulse" />
      <h2 className="text-2xl font-black tracking-widest">ASSET NOT FOUND</h2>
      <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 border border-red-500/50 hover:bg-red-500/10 transition-colors rounded-lg">Return to Base</button>
    </div>
  );

  return (
    <div className="h-screen bg-[#050505] flex flex-col overflow-hidden text-white font-sans relative">
      
      {/* 🚀 1. The Next-Level Loading Overlay */}
      {showLoader && (
        <div className={`absolute inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${progress === 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {/* Background Ambient */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="absolute w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] animate-pulse"></div>

          {/* Central Core Animation */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-12">
            <div className="absolute inset-0 border-4 border-dashed border-green-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute inset-4 border-4 border-t-green-500 border-b-green-500 border-l-transparent border-r-transparent rounded-full animate-[spin_3s_linear_infinite_reverse]"></div>
            <div className="absolute inset-12 border border-green-400/30 rounded-full animate-ping"></div>
            
            <div className="flex flex-col items-center justify-center z-10 bg-black/50 w-full h-full rounded-full backdrop-blur-sm">
              <Gamepad2 size={48} className="text-green-400 mb-2 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-pulse" />
              <span className="text-white font-black text-xl tracking-widest uppercase drop-shadow-lg">GameHub-<span className="text-green-500">X</span></span>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full max-w-lg px-8 z-10">
            <div className="flex justify-between items-end text-green-400 font-mono text-xs tracking-widest mb-3 uppercase">
              <div className="flex items-center gap-2"><Wifi size={14} className="animate-pulse" /> System Link</div>
              <div className="text-xl font-black">{progress}%</div>
            </div>
            
            {/* The Bar */}
            <div className="h-2 bg-black rounded-full overflow-hidden border border-white/10 shadow-[inset_0_0_10px_rgba(0,0,0,1)] p-[1px]">
              <div
                className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.6)] transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/50 blur-[2px]"></div>
              </div>
            </div>

            {/* Dynamic Status Text */}
            <div className="mt-6 flex items-center justify-center gap-2 text-center text-[10px] text-gray-500 font-mono uppercase tracking-[0.3em] h-4">
              <Cpu size={12} /> {loadingText}
            </div>
          </div>
        </div>
      )}

      {/* 🎮 2. Game Header */}
      <div className="bg-[#050505] border-b border-white/5 p-4 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white border border-white/5">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm md:text-lg font-black uppercase tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{game?.title}</h1>
            <p className="text-[10px] text-green-500 font-mono uppercase tracking-[0.2em] flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> 
              Operational Sector: {game?.categoryId?.name}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
            <button onClick={() => window.location.reload()} className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-green-500 hover:border-green-500/30 transition-colors" title="Reload Asset"><RotateCcw size={18} /></button>
            <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-green-500 hover:border-green-500/30 transition-colors hidden md:block" title="Full Screen"><Maximize2 size={18} /></button>
        </div>
      </div>

      {/* 🕹️ 3. Game Iframe Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {game && (
          <iframe 
            src={game.gameUrl} 
            className={`w-full h-full border-none transition-opacity duration-1000 ${showLoader ? 'opacity-0' : 'opacity-100'}`}
            title={game.title}
            allowFullScreen
            scrolling="no"
            onLoad={() => setIframeLoaded(true)} // 🟢 Iframe එක load වුණාම මේක Fire වෙනවා
          />
        )}
      </div>

      {/* 🛡️ 4. Footer Intel */}
      <div className="bg-[#050505] border-t border-white/5 p-2 text-center relative z-20">
          <p className="text-[9px] text-gray-600 font-mono tracking-[0.3em] uppercase">Encryption: Active | GameHub-X Environment</p>
      </div>
    </div>
  );
}