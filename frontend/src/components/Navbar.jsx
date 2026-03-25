import { BarChart3, Search, Camera } from "lucide-react";

const tabs = [
  { id: "dashboard", label: "Explorer", Icon: BarChart3 },
  { id: "search", label: "Rechercher", Icon: Search },
  { id: "scan", label: "Scanner", Icon: Camera },
];

export default function Navbar({ page, setPage }) {
  return (
    <>
      {/* Desktop top navbar */}
      <nav className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 tracking-tight">ThyroGuard</span>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-1">POC</span>
        </div>
        <div className="flex gap-1">
          {tabs.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setPage(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${page === id ? "bg-teal-50 text-teal-700" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile bottom navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around py-2 px-4"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setPage(id)}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all
              ${page === id ? "text-teal-600" : "text-gray-400"}`}>
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
