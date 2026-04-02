import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, Edit, Power, X, Layers, AlertCircle } from "lucide-react";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";

// 🟢 අපි හදපු අලුත් API Service එක මෙතනට ගන්නවා
import api from "../../service/api"; // Service එක හරහා නැතුව කෙලින්ම ගහමු ලේසි වෙන්න, නැත්නම් Service ෆයිල් එකක් හදන්න වෙනවා.
// මම දැනට මේ ෆයිල් එකේම API Call ටික ලියනවා. ඔයාට ඕන නම් මේවා service/gameType.ts එකට ගෙනියන්න පුළුවන්.

interface GameTypeData {
  _id: string;
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export default function AdminGameTypeManage() {
  const [gameTypes, setGameTypes] = useState<GameTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  // 🟢 API Calls (මෙතනම ලියලා තියෙනවා ලේසි වෙන්න)
  const fetchGameTypes = async (currentPage: number = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      params.append("page", currentPage.toString());
      params.append("limit", "10");

      const res = await api.get(`/game-types?${params.toString()}`);
      setGameTypes(res.data.data);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch game types", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchGameTypes(1);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [search, statusFilter]);

  useEffect(() => {
    if (page !== 1 || search !== "" || statusFilter !== "ALL") {
       fetchGameTypes(page);
    }
  }, [page]);

  // Submit Function (Create / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    try {
      if (editingId) {
        await api.put(`/game-types/${editingId}`, { name, description });
      } else {
        await api.post(`/game-types`, { name, description });
      }
      setIsModalOpen(false);
      fetchGameTypes(page);
    } catch (err: any) {
      setError(err.response?.data?.message || "Error deploying game format");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setError("");
    setIsModalOpen(true);
  };

  const handleEdit = (type: GameTypeData) => {
    setEditingId(type._id);
    setName(type.name);
    setDescription(type.description);
    setError("");
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/game-types/${id}/status`);
      fetchGameTypes(page);
    } catch (err) {
      console.error("Status toggle failed", err);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 🌟 Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] flex items-center gap-3">
            <Layers className="text-green-500" size={32} />
            Game Format <span className="text-green-500">Manage</span>
          </h1>
          <p className="text-gray-400 font-mono mt-2 uppercase text-sm tracking-wider">Configure Arena Play Styles</p>
        </div>
        <Button variant="green" onClick={handleAddNew}><Plus size={18} /> Deploy New Format</Button>
      </div>

      {/* 🔍 Filters */}
      <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-4 shadow-lg">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" />
          <input type="text" placeholder="SEARCH FORMATS..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500 transition-all font-mono" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-black/40 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500 transition-all font-mono">
          <option value="ALL">ALL STATUS</option>
          <option value="ACTIVE">ACTIVE ONLY</option>
          <option value="INACTIVE">INACTIVE ONLY</option>
        </select>
      </div>

      {/* 📋 Data Table */}
      <Table headers={["Format Name", "Intelligence / Description", "Status", "Override"]}>
        {loading ? (
          <tr><td colSpan={4} className="p-10 text-center text-green-500 animate-pulse font-mono tracking-widest">Scanning Formats...</td></tr>
        ) : gameTypes.length === 0 ? (
          <tr><td colSpan={4} className="p-10 text-center text-gray-500 font-mono tracking-widest">No Formats Detected.</td></tr>
        ) : (
          gameTypes.map((type) => (
            <tr key={type._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
              <td className="p-4">
                <div className="font-bold text-white tracking-wider text-base">{type.name}</div>
                <div className="text-[10px] text-gray-600 font-mono mt-1">ID: {type._id.substring(18)}</div>
              </td>
              <td className="p-4">
                <div className="text-sm text-gray-400 max-w-[300px] truncate">{type.description}</div>
              </td>
              <td className="p-4">
                <span className={`px-3 py-1.5 rounded-md text-[10px] font-black tracking-widest uppercase ${type.status === "ACTIVE" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>{type.status}</span>
              </td>
              <td className="p-4">
                <div className="flex justify-end gap-2 items-center">
                  <button onClick={() => handleEdit(type)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg border border-blue-500/30 transition-all hover:scale-105" title="Edit Format"><Edit size={16} /></button>
                  <button onClick={() => handleToggleStatus(type._id)} className={`p-2 rounded-lg border transition-all hover:scale-105 ${type.status === "ACTIVE" ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30" : "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30"}`} title="Toggle Power"><Power size={16} /></button>
                </div>
              </td>
            </tr>
          ))
        )}
      </Table>

      {/* 📄 Pagination */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />

      {/* 🎴 Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !formLoading && setIsModalOpen(false)}></div>
          
          <div className="relative bg-[#050505] border border-green-500/30 rounded-2xl p-6 w-full max-w-md shadow-[0_0_50px_rgba(34,197,94,0.15)] animate-in zoom-in-95 duration-300">
            
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-green-500/20">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Layers className="text-green-500" size={24} /> {editingId ? "Reconfigure Format" : "Initialize New Format"}
              </h2>
              <button onClick={() => !formLoading && setIsModalOpen(false)} className="text-gray-500 hover:text-white bg-white/5 p-2 rounded-lg transition-colors"><X size={20} /></button>
            </div>

            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center gap-3 font-mono"><AlertCircle size={18} /> {error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-xs text-gray-400 font-mono tracking-widest mb-2 uppercase">Format Name</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 transition-all font-mono" 
                  placeholder="e.g. Mini Game (Quick Play)" 
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-mono tracking-widest mb-2 uppercase">Intelligence / Description</label>
                <textarea 
                  rows={4} 
                  required 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-green-500 transition-all font-mono resize-none custom-scrollbar" 
                  placeholder="Explain this play style..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/5">
                <Button type="button" variant="white" onClick={() => setIsModalOpen(false)} disabled={formLoading}>Abort</Button>
                <Button type="submit" variant="green" disabled={formLoading} className="shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  {formLoading ? "Deploying..." : editingId ? "Confirm Override" : "Execute Deployment"}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}