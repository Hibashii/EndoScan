import MetricCard from "../components/MetricCard";
import HBar from "../components/HBar";
import { DASHBOARD_STATS } from "../data/mockData";

export default function DashboardPage() {
  const d = DASHBOARD_STATS;
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Explorer les données</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">Analyse des perturbateurs endocriniens thyroïdiens dans les produits du quotidien</p>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <MetricCard label="Produits analysés" value={d.totalProducts.toLocaleString("fr-FR")} sub="Open Food + Beauty Facts" color="teal" />
        <MetricCard label="Contiennent un PE thyroïdien" value={`${d.percentWithPE}%`} sub="soit ~1.2M produits" color="red" />
        <MetricCard label="Substances TEDX « thyroid »" value={d.totalSubstancesTEDX} sub="perturbateurs identifiés" color="amber" />
      </div>

      {/* Top substances */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Perturbateurs les plus fréquents dans les produits</h2>
        <div className="space-y-0.5">
          {d.topSubstances.map((s, i) => (
            <HBar key={i} label={s.name} pct={s.pct} maxPct={30} risk={s.risk} />
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-3">% des produits contenant cette substance · Source : Open Food/Beauty Facts × TEDX (données illustratives)</p>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By category */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Par catégorie de produit</h2>
          <div className="space-y-0.5">
            {d.byCategory.map((c, i) => (
              <HBar key={i} label={c.cat} pct={c.pct} maxPct={60} risk={c.pct > 40 ? "high" : c.pct > 25 ? "medium" : undefined} />
            ))}
          </div>
        </div>

        {/* Cosm vs Food */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Cosmétiques vs alimentaire</h2>
          <div className="flex items-end justify-center gap-12 h-48 mt-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-red-600 mb-2">{d.cosmVsFood.cosm}%</span>
              <div className="w-20 rounded-t-xl bg-gradient-to-t from-red-500 to-red-400"
                style={{ height: `${d.cosmVsFood.cosm * 2.5}px` }} />
              <span className="text-xs text-gray-600 mt-2 font-medium">Cosmétiques</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-amber-600 mb-2">{d.cosmVsFood.food}%</span>
              <div className="w-20 rounded-t-xl bg-gradient-to-t from-amber-500 to-amber-400"
                style={{ height: `${d.cosmVsFood.food * 2.5}px` }} />
              <span className="text-xs text-gray-600 mt-2 font-medium">Alimentaire</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 text-center">% de produits contenant au moins un PE thyroïdien</p>
        </div>
      </div>
    </div>
  );
}
