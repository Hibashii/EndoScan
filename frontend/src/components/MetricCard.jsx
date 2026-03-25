export default function MetricCard({ label, value, sub, color = "teal" }) {
  const colors = {
    teal: "from-teal-500 to-teal-600",
    red: "from-red-500 to-red-600",
    amber: "from-amber-500 to-amber-600",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-4 md:p-5 text-white`}>
      <p className="text-xs font-medium opacity-80 uppercase tracking-wider">{label}</p>
      <p className="text-2xl md:text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
    </div>
  );
}
