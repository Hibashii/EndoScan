import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from '@zxing/browser';
import { MOCK_PRODUCTS } from "../data/mockData";
import { riskColor, riskLabel, vigilanceScore } from "../data/utils";

const isBarcode = (str) => /^\d+$/.test(str.trim());

export default function SearchPage({ initialCode, clearInitialCode }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);        // single product analysis
  const [searchResults, setSearchResults] = useState(null); // name search results
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  // --- États et Références pour le Scanner Caméra ---
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const videoRef = useRef(null);
  const controlsRef = useRef(null);

  // Fonction pour lancer la recherche
  const handleSearch = (code) => {
    const searchCode = code || query.trim();
    if (!searchCode) return;
    
    setQuery(searchCode);
    setLoading(true);
    setNotFound(false);
    setResult(null);

    // Simule un appel API
    setTimeout(() => {
      const product = MOCK_PRODUCTS[searchCode];
      if (product) {
        setResult(product);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }, 800);
  };

  // --- Fonctions du Scanner ---
  const startScan = async () => {
    setIsScanning(true);
    setScanError("");
    setResult(null);
    
    try {
      const codeReader = new BrowserMultiFormatReader();
      controlsRef.current = await codeReader.decodeFromVideoDevice(
        null, 
        videoRef.current, 
        (scanResult, error) => {
          if (scanResult) {
            const codeScanne = scanResult.getText();
            stopScan(); // 1. On éteint la caméra
            setQuery(codeScanne); // 2. On écrit le code dans le champ textuel
            handleSearch(codeScanne); // 3. On lance la recherche automatiquement
          }
          if (error && error.name !== 'NotFoundException') {
            console.error(error);
          }
        }
      );
    } catch (err) {
      console.error(err);
      setScanError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
    }
    setIsScanning(false);
  };

  // Sécurité : couper la caméra si on quitte la page
  useEffect(() => {
    return () => stopScan();
  }, []);

  const score = vigilanceScore(result);
  const allEffects = result ? collectEffects(result.matched) : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Rechercher un produit</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">Entrez ou scannez un code-barres pour analyser les perturbateurs endocriniens</p>

      {/* Barre de recherche avec le nouveau bouton Scan */}
      <div className="flex gap-2 mb-3">
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Code-barres (ex: 3017620422003)"
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white" 
        />
        
        {/* Bouton pour ouvrir la caméra */}
        <button 
          onClick={isScanning ? stopScan : startScan}
          className={`px-4 py-3 text-white rounded-xl text-xl font-medium transition-colors active:scale-95 flex items-center justify-center
            ${isScanning ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-800 hover:bg-gray-900'}`}
          title={isScanning ? "Fermer la caméra" : "Scanner un code-barres"}
        >
          {isScanning ? '✖' : '📷'}
        </button>

        <button 
          onClick={() => handleSearch()}
          className="px-5 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors active:scale-95">
          Analyser
        </button>
      </div>

      {scanError && <p className="text-red-500 text-sm mb-4">{scanError}</p>}

      {/* Zone Vidéo du Scanner (Affichée uniquement si isScanning est vrai) */}
      {isScanning && (
        <div className="mb-6 rounded-2xl overflow-hidden border-4 border-teal-500 shadow-lg bg-black relative animate-fade-in">
          <video ref={videoRef} className="w-full h-64 object-cover" />
          <div className="absolute inset-0 border-2 border-white/30 m-8 rounded-xl pointer-events-none"></div>
          <p className="absolute bottom-4 left-0 right-0 text-center text-white text-xs font-semibold bg-black/50 py-1">
            Placez le code-barres au centre
          </p>
        </div>
      )}

      {/* Codes d'exemples */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <span className="text-[10px] text-gray-400 self-center mr-1">Essayez :</span>
        {sampleCodes.map(s => (
          <button key={s.code} onClick={() => handleSearch(s.code)}
            className="text-[10px] px-2 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-teal-300 hover:text-teal-600 transition-colors">
            {s.name}
          </button>
        ))}
      </div>

      {/* Chargement */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="ml-3 text-sm text-slate-500">Recherche en cours...</span>
        </div>
      )}

      {/* Produit non trouvé */}
      {notFound && (
        <div className="bg-gray-50 rounded-2xl p-8 text-center animate-fade-in">
          <p className="text-gray-400 text-lg mb-1">Produit non trouvé</p>
          <p className="text-gray-400 text-xs">Essayez un des codes-barres de démonstration ci-dessus</p>
        </div>
      )}

      {/* Résultat (Ton code d'origine intact) */}
      {result && score && (
        <div className="space-y-4 animate-fade-in">
          {/* Back to results button (if came from name search) */}
          {!isBarcode(query) && (
            <button onClick={() => searchByName(query)}
              className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer">
              ← Retour aux résultats
            </button>
          )}

          {/* Product header */}
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
              <div className={`text-center px-4 py-3 rounded-2xl shrink-0
                ${score.color === "red" ? "bg-red-50" : score.color === "amber" ? "bg-amber-50" : "bg-emerald-50"}`}>
                <p className={`text-2xl font-bold
                  ${score.color === "red" ? "text-red-600" : score.color === "amber" ? "text-amber-600" : "text-emerald-600"}`}>
                  {result.matched.length}/{result.ingredients.length}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">à risque</p>
                <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg text-white
                  ${score.color === "red" ? "bg-red-500" : score.color === "amber" ? "bg-amber-500" : "bg-emerald-500"}`}>
                  {score.label}
                </span>
              </div>
            </div>

            {/* Effect summary tags */}
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

          {/* Ingredients list */}
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