import { useState, useEffect } from "react";
import { riskColor, riskLabel, vigilanceScore, collectEffects, computeScore } from "../data/utils";
import EffectTag from "../components/EffectTag";

const isBarcode = (str) => /^\d+$/.test(str.trim());

export default function SearchPage({ initialCode, clearInitialCode }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [lastNameQuery, setLastNameQuery] = useState(null);

  const resetState = () => {
    setResult(null);
    setSearchResults(null);
    setNotFound(false);
    setError(null);
  };

  const analyzeBarcode = async (code) => {
    setLoading(true);
    resetState();

    try {
      const resp = await fetch(`/api/analyze/${code}`);
      if (resp.status === 404) {
        setNotFound(true);
      } else if (!resp.ok) {
        setError("Erreur serveur — réessayez plus tard");
      } else {
        setResult(await resp.json());
      }
    } catch {
      setError("Impossible de contacter le serveur — vérifiez que le backend est lancé");
    } finally {
      setLoading(false);
    }
  };

  const searchByName = async (name) => {
    setLoading(true);
    resetState();
    setLastNameQuery(name);

    try {
      const resp = await fetch(`/api/search?q=${encodeURIComponent(name)}`);
      if (resp.status === 404) {
        setNotFound(true);
      } else if (!resp.ok) {
        setError("Erreur serveur — réessayez plus tard");
      } else {
        setSearchResults(await resp.json());
      }
    } catch {
      setError("Impossible de contacter le serveur — vérifiez que le backend est lancé");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (override) => {
    const q = (override || query).trim();
    if (!q) return;
    setQuery(q);

    if (isBarcode(q)) {
      analyzeBarcode(q);
    } else {
      searchByName(q);
    }
  };

  const pickProduct = (barcode) => {
    setSearchResults(null);
    analyzeBarcode(barcode);
  };

  useEffect(() => {
    if (initialCode) {
      handleSearch(initialCode);
      if (clearInitialCode) clearInitialCode();
    }
  }, []);

  const score = vigilanceScore(result);
  const allEffects = result ? collectEffects(result.matched) : [];
  const productScore = computeScore(result);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Rechercher un produit</h1>
      <p className="text-slate-500 text-sm mt-1 mb-6">
        Entrez un code-barres ou un nom de produit
      </p>

      <div className="flex gap-2 mb-4">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Code-barres ou nom de produit (ex: Nutella, 3017620422003)"
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white" />
        <button onClick={() => handleSearch()}
          className="px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors active:scale-95 cursor-pointer">
          Analyser
        </button>
      </div>

      {error && (
        <div className="bg-red-50 rounded-2xl p-5 text-center mb-4">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="ml-3 text-sm text-slate-500">Recherche en cours...</span>
        </div>
      )}

      {notFound && (
        <div className="bg-slate-50 rounded-2xl p-8 text-center">
          <p className="text-slate-400 text-lg mb-1">Aucun produit trouvé</p>
          <p className="text-slate-400 text-xs">Essayez un autre nom ou un code-barres</p>
        </div>
      )}

      {searchResults && searchResults.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          <p className="text-xs text-slate-400 mb-2">{searchResults.length} résultat{searchResults.length > 1 ? "s" : ""} — cliquez pour analyser</p>
          {searchResults.map((p, i) => (
            <button key={p.barcode + i} onClick={() => pickProduct(p.barcode)}
              className="w-full bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4 hover:border-indigo-200 hover:shadow-sm transition-all text-left cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center shrink-0 group-hover:from-indigo-100 group-hover:to-violet-100 transition-colors">
                <span className="text-sm">{p.source === "food" ? "🍽" : "💄"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                <p className="text-[11px] text-slate-400">
                  Code {p.barcode} · {p.ingredient_count} ingrédient{p.ingredient_count > 1 ? "s" : ""} · {p.source === "food" ? "Alimentaire" : "Cosmétique"}
                </p>
              </div>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {result && result.ingredients.length === 0 && (
        <div className="space-y-4 animate-fade-in">
          {lastNameQuery && (
            <button onClick={() => searchByName(lastNameQuery)}
              className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer">
              ← Retour aux résultats pour "{lastNameQuery}"
            </button>
          )}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-lg font-bold text-slate-900">{result.name}</p>
            <p className="text-sm text-slate-500">
              {[result.brand, result.category].filter(v => v && v !== "Inconnu" && v !== "Marque inconnue").join(" · ") || null}
            </p>
            <span className={`inline-block mt-2 text-[10px] font-medium px-2.5 py-0.5 rounded-full
              ${result.source === "food" ? "bg-amber-50 text-amber-700" : "bg-purple-50 text-purple-700"}`}>
              {result.source === "food" ? "🍽 Alimentaire" : "💄 Cosmétique"}
            </span>
          </div>
          <div className="bg-amber-50 rounded-2xl p-6 text-center">
            <p className="text-amber-700 text-sm font-medium mb-1">⚠️ Ingrédients non disponibles</p>
            <p className="text-amber-600 text-xs">Ce produit existe dans la base mais sa liste d'ingrédients n'a pas encore été renseignée.</p>
          </div>
        </div>
      )}

      {result && result.ingredients.length > 0 && productScore && (
        <div className="space-y-4 animate-fade-in">
          {lastNameQuery && (
            <button onClick={() => searchByName(lastNameQuery)}
              className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer">
              ← Retour aux résultats pour "{lastNameQuery}"
            </button>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-slate-900">{result.name}</p>
                <p className="text-sm text-slate-500">
                  {[result.brand, result.category].filter(v => v && v !== "Inconnu" && v !== "Marque inconnue").join(" · ") || null}
                </p>
                <span className={`inline-block mt-2 text-[10px] font-medium px-2.5 py-0.5 rounded-full
                  ${result.source === "food" ? "bg-amber-50 text-amber-700" : "bg-purple-50 text-purple-700"}`}>
                  {result.source === "food" ? "🍽 Alimentaire" : "💄 Cosmétique"}
                </span>
              </div>
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4
                  ${productScore.color === "emerald" ? "border-emerald-400 bg-emerald-50" :
                    productScore.color === "amber" ? "border-amber-400 bg-amber-50" :
                    productScore.color === "orange" ? "border-orange-400 bg-orange-50" :
                    "border-red-400 bg-red-50"}`}>
                  <span className={`text-xl font-bold
                    ${productScore.color === "emerald" ? "text-emerald-600" :
                      productScore.color === "amber" ? "text-amber-600" :
                      productScore.color === "orange" ? "text-orange-600" :
                      "text-red-600"}`}>
                    {productScore.score}<span className="text-xs font-medium text-slate-400">/100</span>
                  </span>
                </div>
                <span className={`mt-2 text-[11px] font-semibold px-3 py-1 rounded-full text-white
                  ${productScore.color === "emerald" ? "bg-emerald-500" :
                    productScore.color === "amber" ? "bg-amber-500" :
                    productScore.color === "orange" ? "bg-orange-500" :
                    "bg-red-500"}`}>
                  {productScore.label}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">{result.matched.length} PE / {result.ingredients.length}</p>
              </div>
            </div>

            {allEffects.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium mb-2">Effets endocriniens détectés</p>
                <div className="flex flex-wrap gap-1.5">
                  {allEffects.map(e => (
                    <EffectTag key={e} effect={e} size="md" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Ingrédients analysés ({result.ingredients.length})
            </h3>
            <div className="space-y-2">
              {result.matched.map((m, i) => {
                const c = riskColor(m.risk);
                return (
                  <div key={`m-${i}`} className={`${c.bg} rounded-xl px-4 py-3 animate-fade-in-up stagger-${i + 1}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 ${c.dot} rounded-full mt-1.5 shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-semibold ${c.text}`}>{m.name}</p>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full text-white ${c.badge}`}>
                            {riskLabel(m.risk)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{m.note}</p>
                        {m.effects && m.effects.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {m.effects.map(e => (
                              <EffectTag key={e} effect={e} size="sm" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {result.ingredients
                .filter(ing => !result.matched.some(m => m.name.toLowerCase() === ing.toLowerCase()))
                .map((ing, i) => (
                  <div key={`s-${i}`} className="flex items-center gap-3 px-4 py-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full shrink-0" />
                    <span className="text-sm text-slate-600">{ing}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">OK</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
