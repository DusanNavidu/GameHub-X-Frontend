import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Flame, MonitorPlay, Gamepad2, LayoutGrid } from "lucide-react";
import Button from "../../components/Button";
import GameCard from "../../components/GameCard";
import GameInfoModel from "../../components/GameInfoModel";
import { getGames, type GameData } from "../../service/game";
import { getCategories, type CategoryData } from "../../service/category";
import { useAuth } from "../../context/authContext";

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Layout එකෙන් Search Query එක ගන්නවා 🟢
  const { searchQuery } = useOutletContext<{ searchQuery: string }>();

  const [games, setGames] = useState<GameData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [activeCategory, setActiveCategory] = useState("ALL");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesRes, catRes] = await Promise.all([ getGames(), getCategories("", "ACTIVE") ]);
        setGames(gamesRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Failed to load arena data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredGames = games.filter(game => {
    const matchesCategory = activeCategory === "ALL" || game.categoryId?._id === activeCategory;
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-in fade-in duration-700">
      
      {/* 🚀 Personalized Hero Banner */}
      <div className="relative w-full h-[350px] md:h-[450px] rounded-3xl overflow-hidden border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.1)] mb-12 flex items-center p-8 md:p-16 group">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-green-400 text-xs font-black tracking-[0.3em] uppercase mb-4">
            <span className="w-8 h-[2px] bg-green-500"></span> ACCESS GRANTED
          </div>
          
          {/* 🟢 Special Greeting */}
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase leading-[1.1] mb-2">
            Welcome Back, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
              {user?.fullname.split(' ')[0]} 
            </span>
          </h1>
          
          <p className="text-gray-400 text-sm md:text-base mb-8 max-w-md font-mono tracking-wide">
            Your personal arsenal is fully loaded. Select an asset and engage.
          </p>
          <Button variant="green" size="lg" className="px-8 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
            <MonitorPlay size={18} className="mr-2 inline" /> Resume Last Session
          </Button>
        </div>
      </div>

      {/* 🏷️ Category Filter Bar */}
      <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
        <button 
          onClick={() => setActiveCategory("ALL")}
          className={`px-6 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap border ${
            activeCategory === "ALL" ? "bg-green-500 text-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
          }`}
        >All Sectors</button>
        {categories.map((cat) => (
          <button 
            key={cat._id}
            onClick={() => setActiveCategory(cat._id)}
            className={`px-6 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap border ${
              activeCategory === cat._id ? "bg-green-500 text-black border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 🎮 Games Grid */}
      <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="text-xl font-black uppercase tracking-[0.2em] flex items-center gap-3">
          <LayoutGrid className="text-green-500" size={24} /> Operational <span className="text-green-500">Assets</span>
        </h3>
      </div>

      {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-72 bg-white/5 rounded-2xl animate-pulse border border-white/10"></div>)}
          </div>
      ) : filteredGames.length === 0 ? (
          <div className="py-20 text-center">
              <Gamepad2 size={48} className="mx-auto text-gray-700 mb-4" />
              <h4 className="text-gray-500 font-mono uppercase tracking-widest">No assets found matching criteria.</h4>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredGames.map((game) => (
                  <GameCard key={game._id} game={game} onViewInfo={(g) => setSelectedGame(g)} onPlay={(id) => navigate(`/play/${id}`)} />
              ))}
          </div>
      )}

      {selectedGame && (
          <GameInfoModel game={selectedGame} onClose={() => setSelectedGame(null)} onPlay={(id) => navigate(`/play/${id}`)} />
      )}
    </div>
  );
}