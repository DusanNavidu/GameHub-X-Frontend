export default function Footer() {
  return (
    <footer className="border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 py-8 mt-12">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <p className="text-xs font-mono text-gray-600 uppercase tracking-widest">© 2026 GameHub-X Secure System | All Systems Operational</p>
      </div>
      <div className="flex gap-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
          <span className="hover:text-green-500 cursor-pointer transition-colors">Privacy Protocol</span>
          <span className="hover:text-green-500 cursor-pointer transition-colors">Terms of Engagement</span>
          <span className="hover:text-green-500 cursor-pointer transition-colors">Support Comms</span>
      </div>
    </footer>
  );
}