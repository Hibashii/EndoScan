import MetricCard from "../components/MetricCard";
import HBar from "../components/HBar";
import EffectTag from "../components/EffectTag";
import { DASHBOARD_STATS, EFFECT_CATEGORIES } from "../data/realData";

const EFFECT_BAR_COLORS = {
  estrogenic:   "bg-pink-500",
  androgenic:   "bg-blue-500",
  thyroid:      "bg-violet-500",
  reproductive: "bg-rose-500",
  cancer:       "bg-red-500",
  neurological: "bg-amber-500",
  immune:       "bg-emerald-500",
};

export default function DashboardPage() {
  const d = DASHBOARD_STATS;
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Explorer les données</h1>
      <p className="text-slate-500 text-sm mt-1 mb-6">
        Analyse des perturbateurs endocriniens dans les produits du quotidien
      </p>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <MetricCard
          label="Produits analysés"
          value={d.totalProducts.toLocaleString("fr-FR")}
          sub="Open Food + Beauty Facts"
          color="indigo"
        />
        <MetricCard
          label="Contiennent un PE"
          value={`${d.percentWithPE}%`}
          sub="soit ~1.2M produits"
          color="red"
        />
        <MetricCard
          label="Substances TEDX"
          value={d.totalSubstancesTEDX}
          sub={`${d.totalWithEffects} avec effets identifiés`}
          color="amber"
        />
      </div>

      {/* Effects breakdown — NEW */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Répartition par type d'effet endocrinien</h2>
        <p className="text-[11px] text-slate-400 mb-4">Nombre de substances TEDX par catégorie d'impact sur la santé</p>
        <div className="space-y-3">
          {d.byEffect.map((e, i) => {
            const cat = EFFECT_CATEGORIES[e.effect];
            return (
              <div key={e.effect} className="flex items-center gap-3">
                <span className="text-base w-6 text-center shrink-0">{cat?.emoji}</span>
                <span className="text-xs text-slate-600 w-24 md:w-28 truncate">{e.label}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${EFFECT_BAR_COLORS[e.effect] || "bg-slate-400"} rounded-full transition-all duration-700`}
                    style={{ width: `${(e.count / d.byEffect[0].count) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700 w-12 text-right">{e.count}</span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 mt-3">
          Une substance peut apparaître dans plusieurs catégories · Source : TEDX List (données illustratives)
        </p>
      </div>

      {/* Top substances */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Perturbateurs les plus fréquents dans les produits</h2>
        <div className="space-y-0.5">
          {d.topSubstances.map((s, i) => (
            <HBar key={i} label={s.name} pct={s.pct} maxPct={30} risk={s.risk} />
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-3">
          % des produits contenant cette substance · Source : Open Food/Beauty Facts × TEDX (données illustratives)
        </p>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By product category */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Par catégorie de produit</h2>
          <div className="space-y-0.5">
            {d.byCategory.map((c, i) => (
              <HBar key={i} label={c.cat} pct={c.pct} maxPct={60} risk={c.pct > 40 ? "high" : c.pct > 25 ? "medium" : undefined} />
            ))}
          </div>
        </div>

        {/* Cosm vs Food */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Cosmétiques vs alimentaire</h2>
          <div className="flex items-end justify-center gap-12 h-48 mt-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-red-600 mb-2">{d.cosmVsFood.cosm}%</span>
              <div className="w-20 rounded-t-xl bg-gradient-to-t from-red-500 to-rose-400"
                style={{ height: `${d.cosmVsFood.cosm * 2.5}px` }} />
              <span className="text-xs text-slate-600 mt-2 font-medium">Cosmétiques</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-amber-600 mb-2">{d.cosmVsFood.food}%</span>
              <div className="w-20 rounded-t-xl bg-gradient-to-t from-amber-500 to-orange-400"
                style={{ height: `${d.cosmVsFood.food * 2.5}px` }} />
              <span className="text-xs text-slate-600 mt-2 font-medium">Alimentaire</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 text-center">
            % de produits contenant au moins un PE
          </p>
        </div>
      </div>
    </div>
  );
}
