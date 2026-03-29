import { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function ScanPage({ goToSearch }) {
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState(null);
  const [scanError, setScanError] = useState("");

  // Références pour la caméra
  const videoRef = useRef(null);
  const controlsRef = useRef(null);

  const startScan = async () => {
    setScanning(true);
    setDetected(null);
    setScanError("");
    
    try {
      const codeReader = new BrowserMultiFormatReader();
      // On connecte le lecteur à la balise vidéo
      controlsRef.current = await codeReader.decodeFromVideoDevice(
        null, 
        videoRef.current, 
        (result, error) => {
          if (result) {
            const codeScanne = result.getText();
            stopScan(); // On arrête la caméra dès qu'on a trouvé
            setDetected(codeScanne);
          }
          if (error && error.name !== 'NotFoundException') {
            // On ignore les erreurs "NotFound" car le scanner cherche 30 fois par seconde
            console.error(error);
          }
        }
      );
    } catch (err) {
      console.error(err);
      setScanError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setScanning(false);
    }
  };

  const stopScan = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
    }
    setScanning(false);
  };

  // Sécurité : on coupe la caméra si l'utilisateur change de page
  useEffect(() => {
    return () => stopScan();
  }, []);

  const goToResult = () => {
    if (detected && goToSearch) {
      goToSearch(detected);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Scanner un produit</h1>
      <p className="text-slate-500 text-sm mt-1 mb-6">Scannez le code-barres avec votre caméra</p>

      {scanError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm text-center">
          {scanError}
        </div>
      )}

      {/* Camera viewport */}
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-[4/3] mb-4">
        
        {/* LA BALISE VIDÉO (Cachée si on ne scanne pas) */}
        <video 
          ref={videoRef} 
          className={`absolute inset-0 w-full h-full object-cover ${scanning ? 'block' : 'hidden'}`} 
          playsInline 
          muted 
        />

        {/* État : Prêt à scanner (Caméra éteinte) */}
        {!scanning && !detected && (
          <button onClick={startScan} className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-white cursor-pointer hover:bg-slate-800 transition-colors">
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

        {/* État : En cours de scan (Animations par-dessus la vidéo) */}
        {scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="relative w-48 h-48">
              {/* Les coins du scanner */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg" />
              {/* La barre animée */}
              <div className="absolute left-2 right-2 h-0.5 bg-indigo-400 animate-scan-line shadow-[0_0_8px_2px_rgba(99,102,241,0.5)]" />
            </div>
            <p className="text-white/90 bg-black/50 px-3 py-1 rounded-full text-xs font-medium mt-6 animate-pulse">
              Placez le code-barres dans le cadre
            </p>
          </div>
        )}

        {/* État : Code trouvé */}
        {detected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-900/90 animate-fade-in backdrop-blur-sm">
            <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold mb-3 shadow-lg flex items-center gap-2">
              <span>✅</span> Code détecté !
            </div>
            <p className="text-white text-2xl font-mono tracking-wider bg-black/30 px-4 py-2 rounded-lg">{detected}</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!scanning && !detected && (
        <button onClick={startScan}
          className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors active:scale-[0.98] cursor-pointer shadow-md">
          Activer le scanner
        </button>
      )}
      {scanning && (
        <button onClick={stopScan}
          className="w-full py-3.5 bg-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-300 transition-colors cursor-pointer">
          Annuler
        </button>
      )}
      {detected && (
        <div className="space-y-3">
          <button onClick={goToResult}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] cursor-pointer flex justify-center items-center gap-2">
            Voir l'analyse complète <span>→</span>
          </button>
          <button onClick={() => setDetected(null)}
            className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors cursor-pointer">
            Scanner un autre produit
          </button>
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <p className="text-xs text-indigo-800 font-bold mb-1 flex items-center gap-1">
          <span>ℹ️</span> Comment ça marche ?
        </p>
        <p className="text-xs text-indigo-600 leading-relaxed">
          Le scanner lit le code-barres du produit en direct.
          Les ingrédients sont ensuite croisés avec la base mondiale <strong>TEDX</strong> pour identifier les perturbateurs endocriniens.
        </p>
      </div>
    </div>
  );
}