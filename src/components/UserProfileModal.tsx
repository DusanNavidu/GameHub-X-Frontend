import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, UploadCloud, User as UserIcon } from "lucide-react";
import Button from "./Button";
import { updateProfilePic } from "../service/auth";

interface UserProfileModalProps {
  user: any;
  onClose: () => void;
  onUpdateSuccess: (newPicUrl: string) => void;
}

export default function UserProfileModal({ user, onClose, onUpdateSuccess }: UserProfileModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("profilePic", file);
      
      const res = await updateProfilePic(formData);
      onUpdateSuccess(res.data.profilePic); // Context එක Update කරන්න අලුත් URL එක යවනවා
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile picture");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => !loading && onClose()}></div>
      
      <div className="relative bg-[#0a0a0a] border border-green-500/30 rounded-3xl p-8 w-full max-w-sm shadow-[0_0_50px_rgba(34,197,94,0.15)] animate-in zoom-in-95 duration-200">
        <button onClick={() => !loading && onClose()} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest">Operator <span className="text-green-500">Profile</span></h2>
          <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-wider">{user.fullname}</p>
        </div>

        {error && <p className="text-red-400 text-xs text-center mb-4 bg-red-500/10 py-2 rounded-lg border border-red-500/20">{error}</p>}

        <div className="flex flex-col items-center gap-6">
          <div 
            className="w-32 h-32 rounded-full border-2 border-dashed border-green-500/50 flex items-center justify-center overflow-hidden cursor-pointer group relative bg-white/5"
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            
            {preview || user.profilePic ? (
              <img src={preview || user.profilePic} alt="Profile" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
            ) : (
              <UserIcon size={40} className="text-gray-500 group-hover:text-green-500 transition-colors" />
            )}

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <UploadCloud className="text-white drop-shadow-md" size={28} />
            </div>
          </div>
          
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest text-center">Click avatar to select image <br/> (Max 5MB)</p>

          <Button variant="green" className="w-full" onClick={handleUpload} disabled={!file || loading}>
            {loading ? "UPLOADING..." : "SAVE PROFILE SECURELY"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}