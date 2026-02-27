"use client";
import { useEffect, useState } from "react";
import { authService } from "../api/auth-service";
import { Button } from "../components/common/button";
import { Loader } from "../components/common/loader";


export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Fetch user data using centralized axios
    authService.getProfile()
      .then(setUser)
      .catch(() => authService.logout());
  }, []);

  if (!user) return <Loader/>;

  return (
  <main className="min-h-screen bg-[#020202] text-zinc-200">
      
      {/* Fluid Header: Acts like container-fluid */}
      <header className="w-full border-b border-zinc-800 bg-[#020202]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Small version of your logo for the header */}
            <div className="w-8 h-8 bg-[#7f56d9] rounded-lg flex items-center justify-center shadow-lg shadow-[#7f56d9]/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="font-heading text-xl font-black tracking-tight uppercase italic">
              Dashboard
            </h1>
          </div>

          <div className="w-28">
            <Button 
              onClick={authService.logout} 
              className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-xs h-9"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Fluid Grid */}
      <div className="w-full px-6 py-8">
       ff
      </div>

    </main>
  );
}