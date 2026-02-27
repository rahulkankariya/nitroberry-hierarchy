"use client";

import React, { useState } from "react";
import { Columns, Rows, LogOut, Menu, X } from "lucide-react";
import { authService } from "@/app/api/auth-service";
import { Button } from "../../components/common/button";
import { Logo } from "../common/logo";

interface HierarchyHeaderProps {
  layout: "vertical" | "horizontal";
  setLayout: (layout: "vertical" | "horizontal") => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export const HierarchyHeader: React.FC<HierarchyHeaderProps> = ({
  layout,
  setLayout,
  onExpandAll,
  onCollapseAll,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper to trigger actions and close menu on mobile
  const handleMobileAction = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* STICKY HEADER: 
        z-[100] ensures it stays above all tree nodes and connector lines.
        sticky top-0 keeps it visible during scrolling.
      */}
      <header className="sticky top-0 z-100 w-full p-4 bg-white border-b flex items-center justify-between gap-4 shrink-0 shadow-sm">
        {/* BRAND SECTION */}
        <Logo variant="header" />

        {/* DESKTOP CONTROLS (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-3">
            {/* View Controls: Expand/Collapse */}
            <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200 shadow-sm">
              <button
                onClick={onExpandAll}
                className="px-3 py-1 hover:bg-white text-slate-600 hover:text-[#7f56d9] rounded text-[10px] font-extrabold transition-all uppercase"
              >
                Expand
              </button>
              <div className="w-px bg-slate-200 mx-1" />
              <button
                onClick={onCollapseAll}
                className="px-3 py-1 hover:bg-white text-slate-600 hover:text-[#7f56d9] rounded text-[10px] font-extrabold transition-all uppercase"
              >
                Collapse
              </button>
            </div>

            {/* Layout Toggle: Vertical/Horizontal */}
            <div className="flex bg-[#f4f0ff] p-1 rounded-md border border-[#e9dffc] gap-1 shadow-sm">
              <button
                onClick={() => setLayout("vertical")}
                className={`flex items-center gap-1 px-3 py-1 rounded text-[10px] font-extrabold transition-all ${
                  layout === "vertical" 
                    ? "bg-[#7f56d9] text-white" 
                    : "text-[#7f56d9] hover:bg-white"
                }`}
              >
                <Rows size={14} /> VERTICAL
              </button>
              <button
                onClick={() => setLayout("horizontal")}
                className={`flex items-center gap-1 px-3 py-1 rounded text-[10px] font-extrabold transition-all ${
                  layout === "horizontal" 
                    ? "bg-[#7f56d9] text-white" 
                    : "text-[#7f56d9] hover:bg-white"
                }`}
              >
                <Columns size={14} /> HORIZONTAL
              </button>
            </div>
          </div>

          {/* Logout Action */}
          <Button
            onClick={() => authService.logout()}
            className="w-auto! py-2.5! px-5! bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-2 shadow-none transition-all"
          >
            <LogOut size={14} className="shrink-0" />
            <span className="leading-none">Logout</span>
          </Button>
        </div>

        {/* MOBILE HAMBURGER TOGGLE */}
        <button
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} className="text-[#7f56d9]" /> : <Menu size={24} />}
        </button>
      </header>

      {/* MOBILE MENU DROPDOWN:
        Uses fixed positioning and z-[110] to overlay the hierarchy chart.
      */}
      {isMenuOpen && (
        <div className="fixed inset-x-0 top-18.25 md:hidden bg-white border-b p-4 flex flex-col gap-6 z-110 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">View Controls</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleMobileAction(onExpandAll)}
                className="p-3 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 active:bg-[#7f56d9] active:text-white transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={() => handleMobileAction(onCollapseAll)}
                className="p-3 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 active:bg-[#7f56d9] active:text-white transition-colors"
              >
                Collapse
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Layout Mode</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleMobileAction(() => setLayout("vertical"))}
                className={`p-3 rounded-lg text-xs font-bold border transition-all ${
                  layout === "vertical" ? "bg-[#7f56d9] text-white border-[#7f56d9]" : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                Vertical
              </button>
              <button
                onClick={() => handleMobileAction(() => setLayout("horizontal"))}
                className={`p-3 rounded-lg text-xs font-bold border transition-all ${
                  layout === "horizontal" ? "bg-[#7f56d9] text-white border-[#7f56d9]" : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                Horizontal
              </button>
            </div>
          </div>

          <Button
            onClick={() => authService.logout()}
            className="w-full! py-3.5! bg-red-50 text-red-600 border border-red-100 font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </div>
      )}
    </>
  );
};