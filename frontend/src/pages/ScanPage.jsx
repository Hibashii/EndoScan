import { useState } from "react";

// Known real barcodes for POC scan simulation
const DEMO_BARCODES = [
  { code: "3017620422003", name: "Nutella" },
  { code: "5449000000996", name: "Coca-Cola" },
  { code: "3175681851849", name: "Gel Douche" },
  { code: "8001841584102", name: "Dentifrice Colgate" },
  { code: "3228857000166", name: "Evian" },
];

export default function ScanPage({ goToSearch }) {
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState(null);
  const [detectedName, setDetectedName] = useState(null);

  const startScan = () => {
    setScanning(true);
    setDetected(null);
    setDetectedName(null);
    // Simule la détection — à remplacer par QuaggaJS
    setTimeout(() => {
      const pick = DEMO_BARCODES[Math.floor(Math.random() * DEMO_BARCODES.length)];
      setDetected(pick.code);
      setDetectedName(pick.name);
      setScanning(false);
    }, 3000);
  };

  const goToResult = () => {
    if (detected && goToSearch) {
      goToSearch(detected);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Scanner un produit</h1>
      <p className="text-slate-500 text-sm mt-1 mb-6">Scannez le code-barres avec votre caméra</p>

      {/* Camera viewport */}
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-[4/3] mb-4">
        {!scanning && !detected && (
          <button onClick={startScan} className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-white cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-pulse-ring" />
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium opacity-80">Appuyez pour scanner</p>
            <p className="text-xs opacity-50 mt-1">La caméra s'activera automatiquement</p>
          </button>
        )}

        {scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-400 rounded-br-lg" />
              <div className="absolute left-2 right-2 h-0.5 bg-indigo-400 animate-scan-line opacity-80" />
            </div>
            <p className="text-white text-sm font-medium mt-4 animate-pulse">Recherche de code-barres...</p>
          </div>
        )}

        {detected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 animate-fade-in">
            <div className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium mb-2">
              Code détecté !
            </div>
            <p className="text-white text-lg font-mono">{detected}</p>
            <p className="text-white/60 text-xs mt-1">{detectedName}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!scanning && !detected && (
        <button onClick={startScan}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors active:scale-[0.98] cursor-pointer">
          Activer le scanner
        </button>
      )}
      {scanning && (
        <button onClick={() => setScanning(false)}
          className="w-full py-3.5 bg-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-300 transition-colors cursor-pointer">
          Annuler
        </button>
      )}
      {detected && (
        <div className="space-y-2">
          <button onClick={goToResult}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors active:scale-[0.98] cursor-pointer">
            Voir l'analyse complète →
          </button>
          <button onClick={() => setDetected(null)}
            className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors cursor-pointer">
            Scanner un autre produit
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-indigo-50 rounded-xl p-4">
        <p className="text-xs text-indigo-800 font-medium mb-1">Comment ça marche ?</p>
        <p className="text-xs text-indigo-600 leading-relaxed">
          Le scanner utilise la caméra de votre appareil pour lire le code-barres du produit.
          Les ingrédients sont ensuite croisés avec la base TEDX pour identifier les perturbateurs endocriniens
          et leurs effets sur la santé (thyroïde, reproduction, système immunitaire, etc.).
        </p>
        <p className="text-[10px] text-indigo-400 mt-2 italic">
          Version POC — simulation de scan · La version finale utilisera QuaggaJS pour la lecture caméra réelle
        </p>
      </div>
    </div>
  );
}
