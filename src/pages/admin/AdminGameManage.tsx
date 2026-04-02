import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, Edit, Power, X, Gamepad2, AlertCircle, UploadCloud, Link as LinkIcon, Image as ImageIcon, Hash, Layers } from "lucide-react";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import { getGames, createGame, updateGame, toggleGameStatus, type GameData } from "../../service/game";
import { getCategories, type CategoryData } from "../../service/category";
import { getTagsForAdminGameAdd, type TagData } from "../../service/tag";
import { getActiveGameTypes, type GameTypeData } from "../../service/gameType";

export default function AdminGameManage() {
  const [games, setGames] = useState<GameData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [gameTypes, setGameTypes] = useState<GameTypeData[]>([]);
  const [availableTags, setAvailableTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [gameTypeId, setGameTypeId] = useState("");
  
  // Interactive Tag State
  const [selectedTags, setSelectedTags] = useState<{id: string, name: string}[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [gameUrl, setGameUrl] = useState("");
  const [uploadType, setUploadType] = useState<"URL" | "FILE">("URL");
  
  // File States
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [gameFile, setGameFile] = useState<File | null>(null);
  
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const gameFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, tagRes, typeRes] = await Promise.all([
          getCategories("", "ACTIVE", 1, 100),
          getTagsForAdminGameAdd(),
          getActiveGameTypes()
        ]);
        setCategories(catRes.data);
        setAvailableTags(tagRes.data);
        setGameTypes(typeRes.data);
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchInitialData();
  }, []);

  const fetchGames = async (currentPage: number = page) => {
    setLoading(true);
    try {
      const res = await getGames(search, categoryFilter, statusFilter, currentPage, 10);
      setGames(res.data);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch games", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchGames(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    if (page !== 1 || search !== "" || statusFilter !== "ALL" || categoryFilter !== "ALL") {
       fetchGames(page);
    }
  }, [page]);

  const handleAddTag = (name: string, id?: string) => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanName) return;
    const formatted = `#${cleanName}`;

    if (selectedTags.find(t => t.name === formatted)) {
      setTagInput(""); return; 
    }

    if (id) {
      setSelectedTags([...selectedTags, { id, name: formatted }]);
    } else {
      const existing = availableTags.find(t => t.name === formatted);
      if (existing) {
        setSelectedTags([...selectedTags, { id: existing._id, name: existing.name }]);
      } else {
        setSelectedTags([...selectedTags, { id: formatted, name: formatted }]); 
      }
    }
    setTagInput("");
    setShowSuggestions(false);
  };

  const removeTag = (name: string) => {
    setSelectedTags(selectedTags.filter(t => t.name !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    if (!editingId && !thumbnailFile) {
      setError("Cover image is required!");
      setFormLoading(false);
      return;
    }
    if (uploadType === "URL" && !gameUrl) {
      setError("Embedded Game URL is required!");
      setFormLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("categoryId", categoryId);
      formData.append("gameTypeId", gameTypeId);
      
      formData.append("tags", JSON.stringify(selectedTags.map(t => t.id)));
      
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      if (uploadType === "URL") formData.append("gameUrl", gameUrl);
      else if (gameFile) formData.append("gameFile", gameFile);

      if (editingId) await updateGame(editingId, formData);
      else await createGame(formData);
      
      setIsModalOpen(false);
      fetchGames(page);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error deploying game asset");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategoryId(categories[0]?._id || "");
    setGameTypeId(gameTypes[0]?._id || "");
    setSelectedTags([]); 
    setTagInput("");
    setGameUrl("");
    setUploadType("URL");
    setThumbnailFile(null);
    setPreviewUrl(null);
    setGameFile(null);
    setError("");
    setIsModalOpen(true);
  };

  const handleEdit = (game: GameData) => {
    setEditingId(game._id);
    setTitle(game.title);
    setDescription(game.description);
    setCategoryId(game.categoryId?._id || "");
    setGameTypeId(game.gameTypeId?._id || "");
    
    setSelectedTags(game.tags?.map(t => ({ id: t._id, name: t.name })) || []); 
    setTagInput("");

    setPreviewUrl(game.thumbnailUrl);
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
      fetchGames(page);
    } catch (err) {
      console.error("Status toggle failed", err);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] flex items-center gap-3">
            <Gamepad2 className="text-green-500" size={32} /> Game <span className="text-green-500">Manage</span>
          </h1>
          <p className="text-gray-400 font-mono mt-2 uppercase text-sm tracking-wider">Deploy & Configure Arena Assets</p>
        </div>
        <Button variant="green" onClick={handleAddNew}><Plus size={18} /> Deploy New Game</Button>
      </div>

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

      <Table headers={["Cover", "Intel / Title", "Sector & Type", "Status", "Override"]}>
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
                <div className="text-xs text-gray-500 max-w-[200px] truncate mt-1">{game.description}</div>
              </td>
              <td className="p-4">
                <div className="text-green-400 font-mono text-xs tracking-wider mb-1">[{game.categoryId?.name}]</div>
                <div className="text-blue-400 font-mono text-[10px] tracking-wider mb-2 flex items-center gap-1">
                   <Layers size={10}/> {game.gameTypeId?.name || "Standard"}
                </div>
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {game.tags?.slice(0, 3).map(tag => (
                    <span key={tag._id} className="text-[9px] px-1.5 py-0.5 bg-white/10 text-gray-300 rounded font-mono">{tag.name}</span>
                  ))}
                  {game.tags && game.tags.length > 3 && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-white/5 text-gray-500 rounded font-mono">+{game.tags.length - 3}</span>
                  )}
                </div>
              </td>
              <td className="p-4">
                <span className={`px-3 py-1.5 rounded-md text-[10px] font-black tracking-widest uppercase ${game.status === "ACTIVE" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>{game.status}</span>
              </td>
              <td className="p-4">
                <div className="flex justify-end gap-2 items-center">
                  <button onClick={() => handleEdit(game)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg border border-blue-500/30 transition-all hover:scale-105" title="Edit Game"><Edit size={16} /></button>
                  <button onClick={() => handleToggleStatus(game._id)} className={`p-2 rounded-lg border transition-all hover:scale-105 ${game.status === "ACTIVE" ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30" : "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30"}`} title="Toggle Power"><Power size={16} /></button>
                </div>
              </td>
            </tr>
          ))
        )}
      </Table>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !formLoading && setIsModalOpen(false)}></div>
          
          <div className="relative bg-[#050505] border border-green-500/30 rounded-2xl p-6 w-full max-w-5xl shadow-[0_0_50px_rgba(34,197,94,0.15)] animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-green-500/20">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Gamepad2 className="text-green-500" size={28} /> {editingId ? "Reconfigure Asset" : "Initialize New Game"}
              </h2>
              <button onClick={() => !formLoading && setIsModalOpen(false)} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-lg transition-colors"><X size={20} /></button>
            </div>

            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center gap-3 font-mono"><AlertCircle size={18} /> {error}</div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-3 flex flex-col gap-4">
                <label className="text-xs text-gray-400 font-mono tracking-widest uppercase">Cover Art</label>
                <div 
                  className={`relative w-full aspect-square rounded-2xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center cursor-pointer transition-all group ${previewUrl ? 'border-green-500/50' : 'border-gray-700 hover:border-green-500 bg-black/40'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleThumbnailChange} />
                  {previewUrl ? (
                    <><img src={previewUrl} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><UploadCloud className="text-white" size={32} /></div></>
                  ) : (
                    <div className="text-center p-4"><ImageIcon className="text-gray-400 mb-2 mx-auto" size={32} /><span className="text-xs text-gray-500">1080x1080px</span></div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-9 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs text-gray-400 font-mono tracking-widest mb-2 uppercase">Asset Title</label>
                    <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 transition-all font-mono" placeholder="Cyber Racer 2077" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 font-mono tracking-widest mb-2 uppercase">Sector / Category</label>
                    <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 transition-all font-mono">
                      <option value="" disabled>Select Target Sector</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-blue-400 font-mono tracking-widest mb-2 uppercase">Game Type</label>
                    <select required value={gameTypeId} onChange={e => setGameTypeId(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 transition-all font-mono">
                      <option value="" disabled>Select Format</option>
                      {gameTypes.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-mono tracking-widest mb-2 uppercase">Intelligence / Description</label>
                  <textarea rows={2} required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 transition-all font-mono resize-none" placeholder="Provide brief lore..."></textarea>
                </div>

                <div className="relative">
                  <label className="block text-xs text-gray-400 font-mono tracking-widest mb-2 uppercase flex items-center gap-2">
                    <Hash size={14}/> System Tags
                  </label>
                  
                  <div className="bg-black/40 border border-gray-700 rounded-xl p-3 min-h-[50px] flex flex-wrap gap-2 items-center focus-within:border-green-500 transition-colors">
                    {selectedTags.map(tag => (
                      <span key={tag.name} className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/50 rounded-md text-[10px] font-mono tracking-widest uppercase flex items-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                        {tag.name}
                        <X size={12} className="cursor-pointer hover:text-white" onClick={() => removeTag(tag.name)} />
                      </span>
                    ))}

                    <input 
                      type="text" 
                      value={tagInput}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                        setTagInput(val);
                        setShowSuggestions(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (tagInput) handleAddTag(tagInput);
                        }
                      }}
                      className="bg-transparent border-none text-sm text-white focus:outline-none font-mono min-w-[120px] flex-1"
                      placeholder={selectedTags.length === 0 ? "Type tag and press Enter..." : ""}
                    />
                  </div>

                  {showSuggestions && tagInput && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#0a0a0a] border border-green-500/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 max-h-48 overflow-y-auto custom-scrollbar">
                      
                      {availableTags
                        .filter(t => t.name.includes(tagInput) && !selectedTags.find(s => s.name === t.name))
                        .map(tag => (
                          <div 
                            key={tag._id} 
                            onClick={() => handleAddTag(tag.name, tag._id)}
                            className="px-4 py-3 border-b border-white/5 hover:bg-white/5 cursor-pointer flex items-center gap-2 text-sm text-gray-300 font-mono transition-colors"
                          >
                            <Hash size={14} className="text-gray-500" /> {tag.name.replace('#', '')}
                          </div>
                      ))}

                      {!availableTags.find(t => t.name === `#${tagInput}`) && !selectedTags.find(s => s.name === `#${tagInput}`) && (
                        <div 
                          onClick={() => handleAddTag(tagInput)}
                          className="px-4 py-3 bg-green-500/10 hover:bg-green-500/20 cursor-pointer flex items-center gap-2 text-sm text-green-400 font-mono transition-colors border-t border-green-500/20"
                        >
                          <Plus size={14} /> Create New Tag: <span className="font-bold">#{tagInput}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex bg-black/40 rounded-xl p-1.5 border border-gray-800 w-fit mb-4">
                    <button type="button" onClick={() => setUploadType("URL")} className={`w-32 py-2 text-xs font-bold tracking-widest rounded-lg transition-all flex justify-center items-center gap-2 uppercase ${uploadType === "URL" ? "bg-green-500 text-black" : "text-gray-500 hover:text-white"}`}><LinkIcon size={14} /> URL</button>
                    <button type="button" onClick={() => setUploadType("FILE")} className={`w-32 py-2 text-xs font-bold tracking-widest rounded-lg transition-all flex justify-center items-center gap-2 uppercase ${uploadType === "FILE" ? "bg-green-500 text-black" : "text-gray-500 hover:text-white"}`}><UploadCloud size={14} /> File</button>
                  </div>
                  
                  <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/20">
                    {uploadType === "URL" ? (
                      <input type="url" value={gameUrl} onChange={e => setGameUrl(e.target.value)} className="w-full bg-black/60 border border-green-900 rounded-xl px-4 py-3 text-sm text-green-400 focus:border-green-500 transition-all font-mono" placeholder="https://play.game.com/..." />
                    ) : (
                      <div className="text-center cursor-pointer py-4 border border-dashed border-gray-700 rounded-xl hover:border-green-500 bg-black/40" onClick={() => gameFileInputRef.current?.click()}>
                        <input type="file" accept=".zip,.html" className="hidden" ref={gameFileInputRef} onChange={e => setGameFile(e.target.files?.[0] || null)} />
                        <UploadCloud className="text-green-500 mx-auto mb-2" size={24} />
                        <p className="text-sm font-bold text-white">{gameFile ? <span className="text-green-400">{gameFile.name}</span> : "Select Payload (.HTML or .ZIP)"}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="white" onClick={() => setIsModalOpen(false)} disabled={formLoading}>Abort</Button>
                  <Button type="submit" variant="green" disabled={formLoading} className="shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    {formLoading ? "Deploying..." : editingId ? "Confirm Override" : "Execute Deployment"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}