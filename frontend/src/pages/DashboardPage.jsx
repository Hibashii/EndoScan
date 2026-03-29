import MetricCard from "../components/MetricCard";
import HBar from "../components/HBar";
import { DASHBOARD_STATS } from '../data/realData';

export default function DashboardPage() {
  const d = DASHBOARD_STATS;

  const topSubstances = d.topPE || [];
  const riskDist = d.riskDistribution || [];

  const cosmPct = d.totalProducts ? Math.round((d.totalBeauty / d.totalProducts) * 100) : 0;
  const foodPct = d.totalProducts ? Math.round((d.totalFood / d.totalProducts) * 100) : 0;

  // On calcule les maximums pour que les barres s'ajustent joliment
  const maxTopPct = topSubstances.length > 0 
    ? Math.max(...topSubstances.map(s => Math.round((s.count / d.totalProducts) * 100))) 
    : 100;
    
  const maxRiskPct = riskDist.length > 0 
    ? Math.max(...riskDist.map(r => Math.round((r.value / d.totalProducts) * 100))) 
    : 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Explorer les données</h1>
      <p className="text-slate-500 text-sm mt-1 mb-6">
        Analyse des perturbateurs endocriniens dans les produits du quotidien
      </p>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <MetricCard label="Produits analysés" value={d.totalProducts?.toLocaleString("fr-FR")} sub="Open Food + Beauty Facts" color="teal" />
        <MetricCard label="Contiennent un PE" value={`${d.percentWithPE}%`} sub="des produits mondiaux" color="red" />
        <MetricCard label="Cosmétiques scannés" value={d.totalBeauty?.toLocaleString("fr-FR")} sub="dans la base" color="amber" />
      </div>

      {/* Top substances */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Perturbateurs les plus fréquents détectés</h2>
        <div className="space-y-0.5">
          {topSubstances.map((s, i) => {
            // Vrai calcul du pourcentage (produits contenant le PE / total des produits * 100)
            const realPct = d.totalProducts ? Math.round((s.count / d.totalProducts) * 100) : 0;
            return (
              <HBar key={i} label={s.name} pct={realPct} maxPct={Math.max(15, maxTopPct)} risk="high" />
            );
          })}
        </div>
        <p className="text-[10px] text-gray-400 mt-3">Source : Open Food/Beauty Facts × TEDX (Données réelles)</p>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Distribution des Risques */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Impact Santé (Données TEDX)</h2>
          <div className="space-y-0.5">
            {riskDist.map((r, i) => {
               // Vrai calcul du pourcentage
               const realPct = d.totalProducts ? Math.round((r.value / d.totalProducts) * 100) : 0;
               return (
                 <HBar key={i} label={r.name} pct={realPct} maxPct={Math.max(15, maxRiskPct)} risk={realPct > 10 ? "high" : "medium"} />
               );
            })}
          </div>
        </div>

        {/* Cosm vs Food */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Répartition de la base de données</h2>
          <div className="flex items-end justify-center gap-12 h-48 mt-4">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-red-600 mb-2">{cosmPct}%</span>
              <div className="w-20 rounded-t-xl bg-gradient-to-t from-red-500 to-red-400"
                style={{ height: `${cosmPct * 2.5}px` }} />
              <span className="text-xs text-gray-600 mt-2 font-medium">Cosmétiques</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-amber-600 mb-2">{foodPct}%</span>
              <div className="w-20 rounded-t-xl bg-gradient-to-t from-amber-500 to-amber-400"
                style={{ height: `${foodPct * 2.5}px` }} />
              <span className="text-xs text-gray-600 mt-2 font-medium">Alimentaire</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-4 text-center">Part des cosmétiques et aliments dans l'analyse globale</p>
        </div>
      </div>
    </div>
  );
}