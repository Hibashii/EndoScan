import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from '@zxing/browser';
import { MOCK_PRODUCTS } from "../data/mockData";
import { riskColor, riskLabel, vigilanceScore } from "../data/utils";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // --- États et Références pour le Scanner Caméra ---
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const videoRef = useRef(null);
  const controlsRef = useRef(null);

  // Fonction pour lancer la recherche
  // Fonction pour lancer la recherche (connectée au VRAI Backend)
  const handleSearch = async (code) => {
    const searchCode = code || query.trim();
    if (!searchCode) return;
    
    setQuery(searchCode);
    setLoading(true);
    setNotFound(false);
    setResult(null);

    try {
      // 🚀 APPEL AU VRAI BACKEND PYTHON
      const response = await fetch(`http://localhost:8000/api/analyze/${searchCode}`);
      
      if (!response.ok) {
        // Si le backend renvoie une erreur (ex: produit non trouvé)
        setNotFound(true);
      } else {
        // Si le backend trouve le produit et calcule les risques
        const realData = await response.json();
        setResult(realData);
      }
    } catch (error) {
      console.error("Erreur de connexion au serveur Python :", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
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
  const sampleCodes = Object.entries(MOCK_PRODUCTS).map(([code, p]) => ({ code, name: p.name }));

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
     {/* Zone Vidéo du Scanner (Toujours dans le code, mais invisible si inactive) */}
      <div className={`mb-6 rounded-2xl overflow-hidden border-4 border-teal-500 shadow-lg bg-black relative animate-fade-in ${isScanning ? 'block' : 'hidden'}`}>
        {/* Ajout de playsInline et muted pour débloquer la caméra sur iPhone/Mobile */}
        <video ref={videoRef} className="w-full h-64 object-cover" playsInline muted />
        
        <div className="absolute inset-0 border-2 border-white/30 m-8 rounded-xl pointer-events-none"></div>
        <p className="absolute bottom-4 left-0 right-0 text-center text-white text-xs font-semibold bg-black/50 py-1">
          Placez le code-barres au centre
        </p>
      </div>

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
          <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          <span className="ml-3 text-sm text-gray-500">Analyse en cours...</span>
        </div>
      )}

      {/* Produit non trouvé */}
      {notFound && (
        <div className="bg-gray-50 rounded-2xl p-8 text-center animate-fade-in">
          <p className="text-gray-400 text-lg mb-1">Produit non trouvé</p>
        </div>
      )}

      {/* Résultat (Ton code d'origine intact) */}
      {result && score && (
        <div className="space-y-4 animate-fade-in">
          {/* Product header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-bold text-gray-900">{result.name}</p>
                <p className="text-sm text-gray-500">{result.brand} · {result.category}</p>
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
                <p className="text-[10px] text-gray-500 mt-0.5">à risque</p>
                <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg text-white
                  ${score.color === "red" ? "bg-red-500" : score.color === "amber" ? "bg-amber-500" : "bg-emerald-500"}`}>
                  {score.label}
                </span>
              </div>
            </div>
          </div>

          {/* Ingredients list */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Ingrédients analysés ({result.ingredients.length})
            </h3>
            <div className="space-y-2">
              {result.matched.map((m, i) => {
                const c = riskColor(m.risk);
                return (
                  <div key={`m-${i}`} className={`${c.bg} rounded-xl px-4 py-3 flex items-start gap-3`}>
                    <div className={`w-2 h-2 ${c.dot} rounded-full mt-1.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${c.text}`}>{m.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{m.note}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full text-white ${c.badge} shrink-0`}>
                      {riskLabel(m.risk)}
                    </span>
                  </div>
                );
              })}
              {result.ingredients
                .filter(ing => !result.matched.some(m => m.name.toLowerCase() === ing.toLowerCase()))
                .map((ing, i) => (
                  <div key={`s-${i}`} className="flex items-center gap-3 px-4 py-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full shrink-0" />
                    <span className="text-sm text-gray-600">{ing}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">OK</span>
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