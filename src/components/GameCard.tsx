import { Play, Info } from "lucide-react";
import Button from "./Button";
import { type GameData } from "../service/game";
import ProgressiveImage from "./ProgressiveImage";
import { getBlurredImageUrl } from "../util/imageUtils";

interface GameCardProps {
  game: GameData;
  onViewInfo: (game: GameData) => void;
  onPlay: (id: string) => void;
}

export default function GameCard({ game, onViewInfo, onPlay }: GameCardProps) {
  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-green-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] backdrop-blur-sm flex flex-col">
      {/* Thumbnail Area */}
      <div className="h-48 overflow-hidden relative">
        <ProgressiveImage
          lowResSrc={getBlurredImageUrl(game.thumbnailUrl)}
          highResSrc={game.thumbnailUrl}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button 
                onClick={() => onPlay(game._id)}
                className="bg-green-500 text-black p-4 rounded-full shadow-[0_0_20px_#22c55e] hover:scale-110 transition-transform"
            >
                <Play fill="black" size={24} />
            </button>
        </div>
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-black text-green-400 border border-green-500/30 uppercase tracking-widest">
          {game.categoryId?.name}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-black text-white text-lg mb-1 group-hover:text-green-400 transition-colors uppercase tracking-tight">{game.title}</h4>
          <p className="text-xs text-gray-500 mb-4 line-clamp-2 font-mono uppercase italic">{game.description}</p>
        </div>
        
        <div className="flex gap-2">
            <Button variant="green" size="sm" className="flex-1 text-[10px]" onClick={() => onPlay(game._id)}>
                <Play size={14} /> PLAY NOW
            </Button>
            <Button variant="white" size="sm" className="bg-white/10 border-white/10" onClick={() => onViewInfo(game)}>
                <Info size={14} />
            </Button>
        </div>
      </div>
    </div>
  );
}