import { createPortal } from "react-dom";
import { X, Gamepad2, Calendar, User, Info as InfoIcon, Play } from "lucide-react";
import Button from "./Button";
import { type GameData } from "../service/game";
import ProgressiveImage from "./ProgressiveImage";

interface GameInfoModelProps {
  game: GameData;
  onClose: () => void;
  onPlay: (id: string) => void;
}

export default function GameInfoModel({ game, onClose, onPlay }: GameInfoModelProps) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-[#0a0a0a] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
        
        {/* Top Cover Image */}
        <div className="h-64 relative">
          <ProgressiveImage
            lowResSrc={game.thumbnailUrl}
            highResSrc={game.thumbnailUrl}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
          <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 -mt-12 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 drop-shadow-md">{game.title}</h2>
              <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-md text-xs font-black tracking-widest uppercase">
                {game.categoryId?.name}
              </span>
            </div>
            <Button variant="green" onClick={() => onPlay(game._id)}>
              <Play size={18} /> START GAME
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm font-mono uppercase tracking-wider">
            <div className="flex items-center gap-3 text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5">
              <Calendar size={18} className="text-green-500" />
              <span>Released: {new Date(game.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5">
              <User size={18} className="text-green-500" />
              <span>Publisher: System Admin</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-gray-500 tracking-[0.3em] uppercase flex items-center gap-2">
                <InfoIcon size={14} /> Mission Intel
            </h4>
            <p className="text-gray-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 italic">
              "{game.description}"
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}