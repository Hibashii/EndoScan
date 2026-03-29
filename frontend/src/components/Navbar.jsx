import { BarChart3, Search, Camera } from "lucide-react";

const tabs = [
  { id: "dashboard", label: "Explorer",   Icon: BarChart3 },
  { id: "search",    label: "Rechercher", Icon: Search },
];

export default function Navbar({ page, setPage }) {
  return (
    <>
      {/* Desktop top navbar */}
      <nav className="hidden md:flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">E</span>
          </div>
          <span className="text-lg font-semibold text-slate-900 tracking-tight">EndoScan</span>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-1">POC</span>
        </div>
        <div className="flex gap-1">
          {tabs.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setPage(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                ${page === id ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile bottom navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 z-50 flex justify-around py-2 px-4"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setPage(id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer
              ${page === id ? "text-indigo-600" : "text-slate-400"}`}>
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
