export default function HBar({ label, pct, maxPct = 100, risk }) {
  const c = risk === "high" ? "bg-red-500" : risk === "medium" ? "bg-amber-400" : "bg-teal-500";
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-gray-600 w-28 md:w-36 truncate text-right">{label}</span>
      <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${c} rounded-full transition-all duration-700`}
          style={{ width: `${(pct / maxPct) * 100}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 w-10">{pct}%</span>
    </div>
  );
}
