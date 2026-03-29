import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Maximize2, RotateCcw, AlertTriangle } from "lucide-react";
import { getGames, type GameData } from "../service/game";

export default function PlayGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await getGames(); // මෙතන id එකෙන් filter කරන logic එක backend එකේ හදන්න ඕනේ
        const found = res.data.find((g: GameData) => g._id === id);
        setGame(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [id]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-green-500 font-mono">ESTABLISHING UPLINK...</div>;
  if (!game) return <div className="h-screen bg-black flex flex-col items-center justify-center text-red-500 font-mono">
    <AlertTriangle size={48} className="mb-4" />
    ASSET NOT FOUND
  </div>;

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden text-white font-sans">
      {/* Game Header */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-black uppercase tracking-widest">{game.title}</h1>
            <p className="text-[10px] text-green-500 font-mono uppercase tracking-[0.2em]">Operational Sector: {game.categoryId?.name}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
            <button onClick={() => window.location.reload()} className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-green-500 transition-colors"><RotateCcw size={18} /></button>
            <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-green-500 transition-colors"><Maximize2 size={18} /></button>
        </div>
      </div>

      {/* Game Iframe Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
         <iframe 
            src={game.gameUrl} 
            className="w-full h-full border-none shadow-[0_0_50px_rgba(34,197,94,0.1)]"
            title={game.title}
            allowFullScreen
            scrolling="no"
         />
      </div>

      {/* Footer Intel */}
      <div className="bg-black border-t border-white/5 p-3 text-center">
          <p className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">Encryption Mode: Active | GameHub-X Secure Environment</p>
      </div>
    </div>
  );
}