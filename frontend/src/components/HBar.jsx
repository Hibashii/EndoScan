export default function HBar({ label, pct, maxPct = 100, risk, color }) {
  const barColor = color
    ? color
    : risk === "high" ? "bg-red-500" : risk === "medium" ? "bg-amber-400" : "bg-indigo-500";
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-slate-600 w-28 md:w-36 truncate text-right">{label}</span>
      <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${(pct / maxPct) * 100}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-10">{pct}%</span>
    </div>
  );
}
