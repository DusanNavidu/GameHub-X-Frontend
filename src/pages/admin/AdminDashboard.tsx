import { Users, Gamepad2, Activity, Zap } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Players", value: "1,204", icon: <Users size={24} />, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    { title: "Active Games", value: "42", icon: <Gamepad2 size={24} />, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
    { title: "Server Status", value: "Online", icon: <Activity size={24} />, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    { title: "System Load", value: "24%", icon: <Zap size={24} />, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
          System <span className="text-green-500">Overview</span>
        </h1>
        <p className="text-gray-400 font-mono mt-2 uppercase text-sm tracking-wider">Welcome back, Commander.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className={`p-6 rounded-2xl border ${stat.border} ${stat.bg} backdrop-blur-md flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300`}>
            <div className={`p-4 rounded-xl bg-black/40 ${stat.color} shadow-inner`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-400 text-xs font-mono tracking-widest uppercase mb-1">{stat.title}</p>
              <h3 className={`text-2xl font-black tracking-wider ${stat.color}`}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Section (Placeholder) */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-4">
          Recent Network Activity
        </h3>
        <div className="flex flex-col gap-3 font-mono text-sm">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex justify-between items-center p-3 hover:bg-white/5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-gray-300">New player registered: <span className="text-white font-bold">PlayerX_{item}</span></span>
              </div>
              <span className="text-gray-500 text-xs">Just now</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}