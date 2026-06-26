import React from 'react';
import BottomNav from './BottomNav';

export default function AppShell({ activeTab, setActiveTab, children, headerContent }) {
  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Premium Gradient Top Header */}
      <header className="sticky top-0 z-30 w-full glass shadow-sm px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/25">
              K
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              KeepMeOnTrack
            </span>
          </div>
          <div>
            {headerContent}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full px-4 py-6 max-w-md mx-auto">
        {children}
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
