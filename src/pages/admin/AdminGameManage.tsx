import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; // 🟢 Modal එක උඩින්ම පෙන්නන්න මේක අත්‍යවශ්‍යයි
import { Search, Plus, Edit, Power, X, Gamepad2, AlertCircle, UploadCloud, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import Button from "../../components/Button";
import { getGames, createGame, updateGame, toggleGameStatus, type GameData } from "../../service/game";
import { getCategories, type CategoryData } from "../../service/category";

export default function AdminGameManage() {
  const [games, setGames] = useState<GameData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [gameUrl, setGameUrl] = useState("");
  const [uploadType, setUploadType] = useState<"URL" | "FILE">("URL");
  
  // File States & Previews 🟢
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Image Preview සඳහා
  const [gameFile, setGameFile] = useState<File | null>(null);
  
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const gameFileInputRef = useRef<HTMLInputElement>(null);

  // දත්ත ලබාගැනීම
  const fetchData = async () => {
    setLoading(true);
    try {
      const [gamesRes, catRes] = await Promise.all([
        getGames(search, categoryFilter, statusFilter),
        getCategories("", "ACTIVE")
      ]);
      setGames(gamesRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => { fetchData(); }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, categoryFilter]);

  // Submit Function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    if (!editingId && !thumbnailFile) {
      setError("Cover image is required to deploy a new game!");
      setFormLoading(false);
      return;
    }
    if (uploadType === "URL" && !gameUrl) {
      setError("Embedded Game URL is required!");
      setFormLoading(false);
      return;
    }
    if (uploadType === "FILE" && !gameFile && !editingId) {
      setError("Game File (.zip/.html) is required!");
      setFormLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("categoryId", categoryId);
      
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      
      if (uploadType === "URL") {
        formData.append("gameUrl", gameUrl);
      } else if (gameFile) {
        formData.append("gameFile", gameFile);
      }

      if (editingId) {
        await updateGame(editingId, formData);
      } else {
        await createGame(formData);
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Error deploying game asset");
    } finally {
      setFormLoading(false);
    }
  };

  // Add New Modal පෙන්වීම
  const handleAddNew = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategoryId(categories[0]?._id || "");
    setGameUrl("");
    setUploadType("URL");
    setThumbnailFile(null);
    setPreviewUrl(null); // Preview එක මකා දැමීම
    setGameFile(null);
    setError("");
    setIsModalOpen(true);
  };

  // Edit Modal පෙන්වීම
  const handleEdit = (game: GameData) => {
    setEditingId(game._id);
    setTitle(game.title);
    setDescription(game.description);
    setCategoryId(game.categoryId?._id || "");
    setPreviewUrl(game.thumbnailUrl); // කලින් තිබුණු Image එක preview කිරීම
    
    if (game.gameUrl && !game.gameUrl.includes("cloudinary.com")) {
      setUploadType("URL");
      setGameUrl(game.gameUrl);
    } else {
      setUploadType("FILE");
      setGameUrl("");
    }

    setThumbnailFile(null);
    setGameFile(null);
    setError("");
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleGameStatus(id);
      fetchData();
    } catch (err) {
      console.error("Status toggle failed", err);
    }
  };

  // 🟢 Image File එකක් තේරූ විට Preview එක හදමු
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Blob URL එකක් සාදයි
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 🌟 Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] flex items-center gap-3">
            <Gamepad2 className="text-green-500" size={32} />
            Game <span className="text-green-500">Manage</span>
          </h1>
          <p className="text-gray-400 font-mono mt-2 uppercase text-sm tracking-wider">
            Deploy & Configure Arena Assets
          </p>
        </div>
        <Button variant="green" onClick={handleAddNew}>
          <Plus size={18} /> Deploy New Game
        </Button>
      </div>

      {/* 🔍 Filters */}
      <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-4 shadow-lg">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" />
          <input type="text" placeholder="SEARCH GAMES..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500 transition-all font-mono" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-black/40 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500 transition-all font-mono">
          <option value="ALL">ALL CATEGORIES</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-black/40 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500 transition-all font-mono">
          <option value="ALL">ALL STATUS</option>
          <option value="ACTIVE">ACTIVE ONLY</option>
          <option value="INACTIVE">INACTIVE ONLY</option>
        </select>
      </div>

      {/* 📋 Data Table */}
      <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-2xl backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/60 border-b border-green-500/20 text-xs text-gray-400 uppercase tracking-widest font-mono">
                <th className="p-4 font-bold w-20 text-center">Cover</th>
                <th className="p-4 font-bold">Intel / Title</th>
                <th className="p-4 font-bold">Sector</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Override</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-green-500 animate-pulse font-mono tracking-widest">Scanning Arsenal Data...</td></tr>
              ) : games.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-500 font-mono tracking-widest">No Assets Detected.</td></tr>
              ) : (
                games.map((game) => (
                  <tr key={game._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-center">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-[0_0_10px_rgba(0,0,0,0.5)] mx-auto relative group-hover:border-green-500/50 transition-colors">
                        <img src={game.thumbnailUrl} alt={game.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white tracking-wider text-base">{game.title}</div>
                      <div className="text-xs text-gray-500 max-w-[250px] truncate mt-1">{game.description}</div>
                    </td>
                    <td className="p-4 text-green-400 font-mono text-xs tracking-wider">[{game.categoryId?.name}]</td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-md text-[10px] font-black tracking-widest uppercase ${
                        game.status === "ACTIVE" 
                          ? "bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]" 
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}>
                        {game.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2 items-center">
                        <button onClick={() => handleEdit(game)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg border border-blue-500/30 transition-all hover:scale-105" title="Edit Game"><Edit size={16} /></button>
                        <button onClick={() => handleToggleStatus(game._id)} className={`p-2 rounded-lg border transition-all hover:scale-105 ${
                            game.status === "ACTIVE" ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30" : "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30"
                          }`} title="Toggle Power"><Power size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🎴 Modal Overlay (createPortal භාවිතයෙන් Top Level එකේ Render වේ) */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !formLoading && setIsModalOpen(false)}></div>
          
          {/* Modal Content - Expanded to max-w-4xl for two-column layout */}
          <div className="relative bg-[#050505] border border-green-500/30 rounded-2xl p-6 w-full max-w-4xl shadow-[0_0_50px_rgba(34,197,94,0.15)] animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-green-500/20">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Gamepad2 className="text-green-500" size={28} /> 
                {editingId ? "Reconfigure Asset" : "Initialize New Game"}
              </h2>
              <button onClick={() => !formLoading && setIsModalOpen(false)} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-lg transition-colors"><X size={20} /></button>
            </div>

            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center gap-3 font-mono"><AlertCircle size={18} /> {error}</div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* 🖼️ Column 1: Image Upload (Left Side) - Takes 4 columns out of 12 */}
              <div className="md:col-span-4 flex flex-col gap-4">
                <label className="text-xs text-gray-400 font-mono tracking-widest uppercase">Cover Art (Thumbnail)</label>
                
                <div 
                  className={`relative w-full aspect-square md:aspect-[3/4] rounded-2xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all group ${previewUrl ? 'border-green-500/50' : 'border-gray-700 hover:border-green-500 bg-black/40'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleThumbnailChange} />
                  
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                        <UploadCloud className="text-white mb-2" size={32} />
                        <span className="text-white font-bold text-sm tracking-wider">CHANGE COVER</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 flex flex-col items-center">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ImageIcon className="text-gray-400 group-hover:text-green-500 transition-colors" size={32} />
                      </div>
                      <span className="text-gray-300 font-bold mb-1">Click to browse</span>
                      <span className="text-xs text-gray-500 font-mono">1080x1080px recommended</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 📝 Column 2: Form Inputs (Right Side) - Takes 8 columns out of 12 */}
              <div className="md:col-span-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-gray-400 font-mono tracking-widest mb-2 uppercase">Asset Title</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 transition-all font-mono shadow-inner" placeholder="e.g. Cyber Racer 2077" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 font-mono tracking-widest mb-2 uppercase">Sector / Category</label>
                    <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 transition-all font-mono shadow-inner appearance-none">
                      <option value="" disabled>Select Target Sector</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-mono tracking-widest mb-2 uppercase">Intelligence / Description</label>
                  <textarea rows={3} required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 transition-all font-mono resize-none shadow-inner" placeholder="Provide brief lore or game mechanics..."></textarea>
                </div>

                {/* Source Type Toggle */}
                <div className="pt-4 border-t border-white/5">
                  <label className="block text-xs text-gray-400 font-mono tracking-widest mb-3 uppercase">Integration Type</label>
                  <div className="flex bg-black/40 rounded-xl p-1.5 border border-gray-800 w-full md:w-fit">
                    <button type="button" onClick={() => setUploadType("URL")} className={`flex-1 md:w-40 py-2.5 text-xs font-bold tracking-widest rounded-lg transition-all flex justify-center items-center gap-2 uppercase ${uploadType === "URL" ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "text-gray-500 hover:text-white"}`}>
                      <LinkIcon size={14} /> Link Embed
                    </button>
                    <button type="button" onClick={() => setUploadType("FILE")} className={`flex-1 md:w-40 py-2.5 text-xs font-bold tracking-widest rounded-lg transition-all flex justify-center items-center gap-2 uppercase ${uploadType === "FILE" ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "text-gray-500 hover:text-white"}`}>
                      <UploadCloud size={14} /> Raw File
                    </button>
                  </div>
                </div>

                {/* Source Input */}
                <div className="bg-green-500/5 p-5 rounded-xl border border-green-500/20">
                  {uploadType === "URL" ? (
                    <div>
                      <input type="url" value={gameUrl} onChange={e => setGameUrl(e.target.value)} className="w-full bg-black/60 border border-green-900 rounded-xl px-4 py-3 text-sm text-green-400 focus:border-green-500 transition-all font-mono" placeholder="https://play.famobi.com/..." />
                      <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-mono uppercase tracking-widest"><AlertCircle size={10} /> External host URL for iframe rendering</p>
                    </div>
                  ) : (
                    <div className="text-center cursor-pointer py-6 border border-dashed border-gray-700 rounded-xl hover:border-green-500 bg-black/40 transition-colors" onClick={() => gameFileInputRef.current?.click()}>
                      <input type="file" accept=".zip,.html" className="hidden" ref={gameFileInputRef} onChange={e => setGameFile(e.target.files?.[0] || null)} />
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                        <UploadCloud className="text-green-500" size={24} />
                      </div>
                      <p className="text-sm font-bold text-white mb-1">
                        {gameFile ? <span className="text-green-400">{gameFile.name}</span> : (editingId ? "Upload New File to Override" : "Select Payload (.HTML or .ZIP)")}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Max file size 50MB</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-green-500/20">
                  <Button type="button" variant="white" onClick={() => setIsModalOpen(false)} disabled={formLoading}>Abort Setup</Button>
                  <Button type="submit" variant="green" disabled={formLoading} className="px-8 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    {formLoading ? "Deploying Asset..." : editingId ? "Confirm Override" : "Execute Deployment"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body // 🟢 React Portal එක Render කරන ස්ථානය
      )}

    </div>
  );
}