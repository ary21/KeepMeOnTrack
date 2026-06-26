import React from 'react';
import { CheckSquare, Calendar, TrendingUp, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'today', name: 'Hari Ini', icon: CheckSquare },
    { id: 'calendar', name: 'Kalender', icon: Calendar },
    { id: 'progress', name: 'Progres', icon: TrendingUp },
    { id: 'settings', name: 'Pengaturan', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50 px-4 py-2">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold scale-105 bg-indigo-500/10' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <Icon size={20} className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] tracking-wider uppercase">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
