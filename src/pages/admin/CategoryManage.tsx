import { useState, useEffect } from "react";
import { Search, Plus, Edit, Power, X, ListTree, AlertCircle } from "lucide-react";
import Button from "../../components/Button"; // ඔයාගේ Button component එකේ path එක හරියට දෙන්න
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  toggleCategoryStatus,
  type CategoryData 
} from "../../service/category";

export default function CategoryManage() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  // දත්ත ලබාගැනීම
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories(search, statusFilter);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  // Search හෝ Filter වෙනස් වෙද්දී Fetch කිරීම
  useEffect(() => {
    // Search එක type කරද්දී දිගටම call යන එක නවත්තන්න පොඩි delay එකක් (Debounce) දෙනවා
    const delayDebounceFn = setTimeout(() => {
      fetchCategories();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter]);


  // 🟢 Create හෝ Update කිරීම
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    try {
      if (editingId) {
        await updateCategory(editingId, formData);
      } else {
        await createCategory(formData);
      }
      setIsModalOpen(false);
      fetchCategories(); // අලුත් දත්ත ගන්නවා
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  // 🟡 Edit බොත්තම එබූ විට
  const handleEdit = (cat: CategoryData) => {
    setEditingId(cat._id);
    setFormData({ name: cat.name, description: cat.description || "" });
    setError("");
    setIsModalOpen(true);
  };

  // 🔵 අලුත් එකක් හදන බොත්තම එබූ විට
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setError("");
    setIsModalOpen(true);
  };

  // 🔴 Status වෙනස් කිරීම
  const handleToggleStatus = async (id: string) => {
    try {
      await toggleCategoryStatus(id);
      fetchCategories(); // Status මාරු කළාට පසු Refresh කිරීම
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 🌟 Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] flex items-center gap-3">
            <ListTree className="text-green-500" size={32} />
            Category <span className="text-green-500">Manage</span>
          </h1>
          <p className="text-gray-400 font-mono mt-2 uppercase text-sm tracking-wider">
            Organize game sectors and divisions
          </p>
        </div>
        <Button variant="green" onClick={handleAddNew}>
          <Plus size={18} /> Add New Category
        </Button>
      </div>

      {/* 🔍 Search & Filter Section */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-green-500 transition-colors" />
          <input
            type="text"
            placeholder="SEARCH CATEGORIES..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500 transition-all placeholder-gray-600 font-mono"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-black/40 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-green-500 transition-all font-mono outline-none"
        >
          <option value="ALL">ALL STATUS</option>
          <option value="ACTIVE">ACTIVE ONLY</option>
          <option value="INACTIVE">INACTIVE ONLY</option>
        </select>
      </div>

      {/* 📋 Data Table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-xs text-gray-400 uppercase tracking-widest font-mono">
                <th className="p-4 font-bold">Category Name</th>
                <th className="p-4 font-bold">Description</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-green-500 animate-pulse font-mono tracking-widest">
                    Loading Data...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 font-mono tracking-widest">
                    No Categories Found.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white tracking-wider">{cat.name}</td>
                    <td className="p-4 text-gray-400 max-w-xs truncate">{cat.description || "N/A"}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                        cat.status === "ACTIVE" 
                          ? "bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]" 
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}>
                        {cat.status}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(cat)}
                        className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 rounded-lg border border-blue-500/30 transition-all"
                        title="Edit Category"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(cat._id)}
                        className={`p-2 rounded-lg border transition-all ${
                          cat.status === "ACTIVE"
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30"
                            : "bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/30"
                        }`}
                        title={cat.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      >
                        <Power size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🎴 Create / Edit Modal (Glassmorphism Overlay) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Layer */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          {/* Modal Content */}
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white uppercase tracking-widest">
                {editingId ? "Edit Category" : "New Category"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 font-mono tracking-widest mb-2 uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-all placeholder-gray-600"
                  placeholder="e.g. Action, RPG, Strategy"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-mono tracking-widest mb-2 uppercase">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-green-500 transition-all placeholder-gray-600 resize-none"
                  placeholder="Brief details about this category..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <Button type="button" variant="white" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="green" disabled={formLoading}>
                  {formLoading ? "Saving..." : editingId ? "Save Changes" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}