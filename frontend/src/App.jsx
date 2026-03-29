import { useState } from "react";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import SearchPage from "./pages/SearchPage";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [initialCode, setInitialCode] = useState(null);

  const goToSearch = (code) => {
    setInitialCode(code || null);
    setPage("search");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar page={page} setPage={setPage} />
      <main>
        {page === "dashboard" && <DashboardPage />}
        {page === "search" && <SearchPage initialCode={initialCode} clearInitialCode={() => setInitialCode(null)} />}
      </main>
    </div>
  );
}
