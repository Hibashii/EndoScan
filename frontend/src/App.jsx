import { useState } from "react";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import SearchPage from "./pages/SearchPage";
import ScanPage from "./pages/ScanPage";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar page={page} setPage={setPage} />
      <main>
        {page === "dashboard" && <DashboardPage />}
        {page === "search" && <SearchPage />}
        {page === "scan" && <ScanPage setPage={setPage} />}
      </main>
    </div>
  );
}
