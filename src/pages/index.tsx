import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Gamepad2, LayoutGrid, Loader2 } from "lucide-react";
import ProgressiveImage from "../components/ProgressiveImage";
import Button from "../components/Button";
import { getPublicGames, type GameData } from "../service/game";
import { getPublicCategories, type CategoryData } from "../service/category";
import GameCard from "../components/GameCard";
import GameInfoModel from "../components/GameInfoModel";
import { useAuth } from "../context/authContext"; // 🟢 Auth Context එක

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth(); // 🟢 User ලොග් වෙලාදැයි බැලීමට

  const [showIntro, setShowIntro] = useState(true);
  const [zoomLogo, setZoomLogo] = useState(false);

  // Data States
  const [games, setGames] = useState<GameData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalGames, setTotalGames] = useState(0);
  
  // Pagination & Filter States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // 1. මුලින්ම Categories ටික විතරක් අරගන්නවා (Intro එක වෙලාවේ)
  useEffect(() => {
    const zoomTimer = setTimeout(() => setZoomLogo(true), 100);
    const introTimer = setTimeout(() => setShowIntro(false), 3000);

    getPublicCategories()
      .then(res => setCategories(res.data))
      .catch(err => console.error("Failed to load categories", err));

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(introTimer);
    };
  }, []);

  // 2. Search, Category හෝ Page එක වෙනස් වෙද්දී Games ගන්නවා
  useEffect(() => {
    const fetchGamesData = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await getPublicGames(searchQuery, activeCategory, page);
        
        if (page === 1) {
          setGames(res.data); // අලුත් සර්ච් එකක් නම් පරණ ඒවා මකලා දානවා
        } else {
          setGames(prev => [...prev, ...res.data]); // Load more නම් පරණ ඒවට එකතු කරනවා
        }
        
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalGames(res.pagination?.total || 0);
      } catch (err) {
        console.error("Failed to load arena data", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    // Type කරද්දීම call යන එක නවත්තන්න (Debounce)
    const delayDebounce = setTimeout(() => {
      fetchGamesData();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, activeCategory, page]);

  // Filter Change Handlers (වෙනස් කරද්දී පළවෙනි පිටුවට යනවා)
  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setPage(1);
    setGames([]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
    setGames([]);
  };

  // 🟢 Play බොත්තම එබූ විට පරීක්ෂාව
  const handlePlayGame = (game: GameData) => {
    // 🟢 Game Type එක 'mini game' ද කියලා බලනවා (Case Insensitive)
    const isMiniGame = game.gameTypeId?.name?.toLowerCase() === "mini game"; 

    if (user) {
      // 🟢 ලොග් වී සිටී නම් ඕනෑම ගේම් එකක් ගහන්න දෙනවා
      navigate(`/play/${game._id}`);
    } else {
      // 🔴 ලොග් වී නැත්නම්...
      if (isMiniGame) {
        navigate(`/play/${game._id}`); // Mini Game නම් යන්න දෙනවා
      } else {
        // වෙනත් ගේම් නම් Login එකට යවනවා
        alert("Authentication required for advanced gameplay. Redirecting to login...");
        navigate(`/login`); 
      }
    }
  };

  // Intro Animation Section
  if (showIntro) {
    return (
      <div className="h-screen w-full bg-[#050505] flex items-center justify-center overflow-hidden px-4 relative">
        <div className="absolute w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-green-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div 
          className={`relative z-10 flex flex-col items-center transition-all duration-1000 ease-out transform ${
            zoomLogo ? "scale-100 sm:scale-110 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-10"
          }`}
        >
          <ProgressiveImage
            lowResSrc="https://i.ibb.co/low-quality-link-here.jpg"
            highResSrc="https://i.ibb.co/VWmrz715/Game-Hub-X-lago.png"
            alt="GameHub-X Logo"
            className="w-48 sm:w-64 md:w-80 h-auto mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          />
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-[0.2em] sm:tracking-[0.3em] text-center uppercase">
            GAMEHUB-<span className="text-green-500 drop-shadow-[0_0_10px_#22c55e]">X</span>
          </h1>
          <div className="mt-8 flex flex-col items-center">
            <p className="text-green-500 font-mono tracking-[0.4em] text-xs sm:text-sm animate-pulse text-center uppercase">
              Initializing Arena
            </p>
            <div className="w-48 h-1 bg-gray-800 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-loading-bar"></div>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes loading-bar { 0% { width: 0%; } 50% { width: 60%; } 100% { width: 100%; } }
          .animate-loading-bar { animation: loading-bar 2.5s ease-in-out forwards; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-green-500/30 overflow-x-hidden relative">
      
      {/* Background Ambient Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-green-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-20 relative z-10">
        
        {/* 🌟 Top Navigation Bar */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start cursor-pointer" onClick={() => window.location.reload()}>
            <h2 className="text-2xl font-black tracking-widest text-white drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] uppercase flex items-center">
              <span className="me-3 w-2 h-6 bg-green-500 inline-block rounded-sm"></span>
              GameHub-<span className="text-green-500">X</span>
            </h2>
          </div>

          <div className="relative w-full md:w-[400px] group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search assets, sectors..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-black/40 border border-gray-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500/60 transition-all font-mono"
            />
          </div>

          <div className="hidden md:flex gap-3">
             {user ? (
                 <Button variant="white" size="sm" onClick={() => navigate('/player')}>Dashboard</Button>
             ) : (
                 <>
                  <Button variant="white" size="sm" onClick={() => navigate('/login')}>Login</Button>
                  <Button variant="green" size="sm" onClick={() => navigate('/register')}>Join Arena</Button>
                 </>
             )}
          </div>
        </header>

        {/* 🚀 Hero Banner */}
        {page === 1 && !searchQuery && activeCategory === "ALL" && (
          <div className="relative w-full h-[350px] md:h-[450px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-12 flex items-center p-8 md:p-16 group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
            
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-2 text-green-400 text-xs font-black tracking-[0.3em] uppercase mb-4">
                <span className="w-8 h-[2px] bg-green-500"></span> Live Nexus
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white uppercase leading-[0.9] mb-6">
                Ultimate <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">Gaming HUB</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base mb-8 max-w-md font-medium leading-relaxed">
                Access the most elite collection of instant-play games. No downloads. No lag. Just pure performance.
              </p>
              <div className="flex gap-4">
                  <Button variant="green" size="lg" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })} className="px-8 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  Launch Now
                  </Button>
              </div>
            </div>
          </div>
        )}

        {/* 🏷️ Category Filter Bar */}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
          <button 
            onClick={() => handleCategoryChange("ALL")}
            className={`px-6 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap border ${
              activeCategory === "ALL" 
              ? "bg-green-500 text-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
              : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
            }`}
          >
            All Sectors
          </button>
          {categories.map((cat) => (
            <button 
              key={cat._id}
              onClick={() => handleCategoryChange(cat._id)}
              className={`px-6 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap border ${
                activeCategory === cat._id 
                ? "bg-green-500 text-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 🎮 Games Grid */}
        <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-xl font-black uppercase tracking-[0.2em] flex items-center gap-3">
            <LayoutGrid className="text-green-500" size={24} /> 
            Operational <span className="text-green-500">Assets</span>
          </h3>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            Showing {games.length} of {totalGames} units
          </p>
        </div>

        {loading && page === 1 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="h-72 bg-white/5 rounded-2xl animate-pulse border border-white/10"></div>
                ))}
            </div>
        ) : games.length === 0 ? (
            <div className="py-20 text-center">
                <Gamepad2 size={48} className="mx-auto text-gray-700 mb-4" />
                <h4 className="text-gray-500 font-mono uppercase tracking-widest">No assets found in this sector</h4>
            </div>
        ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {games.map((game) => (
                      <GameCard 
                          key={game._id} 
                          game={game} 
                          onViewInfo={(g) => setSelectedGame(g)}
                          onPlay={() => handlePlayGame(game)} // 🟢 Custom Handler එක මෙතන දානවා
                      />
                  ))}
              </div>

              {/* 🟢 Load More Button */}
              {page < totalPages && (
                <div className="mt-12 flex justify-center">
                  <Button 
                    variant="white" 
                    onClick={() => setPage(p => p + 1)}
                    disabled={loadingMore}
                    className="flex items-center gap-2"
                  >
                    {loadingMore ? <><Loader2 className="animate-spin" size={16} /> Retrieving...</> : "Load More Assets"}
                  </Button>
                </div>
              )}
            </>
        )}

        {/* Info Modal */}
        {selectedGame && (
            <GameInfoModel 
                game={selectedGame} 
                onClose={() => setSelectedGame(null)} 
                onPlay={() => {
                    setSelectedGame(null); // Modal එක වහනවා
                    handlePlayGame(selectedGame); // 🟢 Custom Handler එක හරහා යවනවා
                }}
            />
        )}

      </div>
      
      {/* Footer Intel */}
      <footer className="max-w-7xl mx-auto px-8 py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">© 2026 GameHub-X Terminal | All Rights Reserved</p>
          <div className="flex gap-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
              <span className="hover:text-green-500 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-green-500 cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-green-500 cursor-pointer transition-colors">Support Center</span>
          </div>
      </footer>
    </div>
  );
}