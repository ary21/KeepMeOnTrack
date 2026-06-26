import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import { useSettingsStore } from '../store/settingsStore';
import { generateCalendarMonth } from '../utils/dateUtils';

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function Calendar({ onOpenSetup }) {
  const { habits } = useHabitStore();
  const { settings } = useSettingsStore();

  const activeHabit = habits.find((h) => h.id === settings.activeHabitId) || habits[0];

  const [currentDate, setCurrentDate] = useState(new Date());
  const gridRef = useRef(null);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (!activeHabit) return;
    
    // Calculate SVG paths for connecting consecutive days
    const timer = setTimeout(() => {
      calculateChainPaths();
    }, 150);

    window.addEventListener('resize', calculateChainPaths);
    return () => {
      window.removeEventListener('resize', calculateChainPaths);
      clearTimeout(timer);
    };
  }, [currentDate, activeHabit]);

  const calculateChainPaths = () => {
    if (!gridRef.current) return;
    
    const dayCells = gridRef.current.querySelectorAll('[data-day-done="true"]');
    const newConnections = [];

    // Group cells by date
    const cellsByDate = {};
    dayCells.forEach(cell => {
      const date = cell.getAttribute('data-date');
      cellsByDate[date] = cell.getBoundingClientRect();
    });

    const gridRect = gridRef.current.getBoundingClientRect();

    // Check consecutive days in activeHabit.completedDays
    const sortedCompletions = [...activeHabit.completedDays].sort();
    
    for (let i = 0; i < sortedCompletions.length - 1; i++) {
      const current = sortedCompletions[i];
      const next = sortedCompletions[i + 1];
      
      // Verify if next day is exactly +1 day
      const d1 = new Date(current + 'T00:00:00');
      const d2 = new Date(next + 'T00:00:00');
      const diffTime = Math.abs(d2 - d1);
      const isConsecutive = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) === 1;

      if (isConsecutive && cellsByDate[current] && cellsByDate[next]) {
        const c1 = cellsByDate[current];
        const c2 = cellsByDate[next];

        const x1 = c1.left + c1.width / 2 - gridRect.left;
        const y1 = c1.top + c1.height / 2 - gridRect.top;
        const x2 = c2.left + c2.width / 2 - gridRect.left;
        const y2 = c2.top + c2.height / 2 - gridRect.top;

        newConnections.push({
          id: `${current}-${next}`,
          x1, y1, x2, y2
        });
      }
    }

    setConnections(newConnections);
  };

  if (!activeHabit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="text-6xl animate-bounce">📅</div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Belum ada target aktif</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            Ayo buat target Anda untuk melihat visualisasi kalender di sini.
          </p>
        </div>
        <button
          onClick={onOpenSetup}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/20"
        >
          Buat Target Baru
        </button>
      </div>
    );
  }

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const days = generateCalendarMonth(
    currentYear,
    currentMonth,
    activeHabit.completedDays,
    activeHabit.startDate
  );

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const accent = activeHabit.accentColor || '#22c55e';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Month Selector header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <button 
          onClick={prevMonth}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <button 
          onClick={nextMonth}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-95"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Calendar Grid Container */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm overflow-hidden">
        
        {/* SVG connection lines layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {connections.map((conn) => (
            <line
              key={conn.id}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke={accent}
              strokeWidth="5"
              strokeLinecap="round"
              className="chain-path opacity-80"
              style={{
                filter: `drop-shadow(0 0 4px ${accent}66)`
              }}
            />
          ))}
        </svg>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2.5 text-center mb-3">
          {WEEKDAYS.map((day) => (
            <div 
              key={day} 
              className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div ref={gridRef} className="grid grid-cols-7 gap-2.5 relative z-10">
          {days.map((item, index) => {
            if (item.type === 'padding') {
              return <div key={`pad-${index}`} className="aspect-square" />;
            }

            const { date, day, isToday, isDone, isMissed, isFuture, isBeforeStart } = item;

            let cellClass = '';
            let style = {};

            if (isDone) {
              cellClass = 'text-white border-transparent scale-105 shadow-sm font-bold';
              style = { backgroundColor: accent };
            } else if (isMissed) {
              cellClass = 'bg-rose-500/10 border-rose-500/30 text-rose-500 font-semibold';
            } else if (isFuture) {
              cellClass = 'border-dashed border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed';
            } else if (isBeforeStart) {
              cellClass = 'text-slate-300 dark:text-slate-700 bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/40 cursor-not-allowed';
            } else {
              // Not completed today yet or past uncompleted but not missed yet
              cellClass = 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors font-medium';
            }

            return (
              <div
                key={date}
                data-date={date}
                data-day-done={isDone ? 'true' : 'false'}
                style={style}
                className={`aspect-square flex items-center justify-center rounded-2xl border text-sm relative transition-all duration-300 ${cellClass} ${
                  isToday ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                }`}
              >
                <span>{day}</span>
                {isDone && (
                  <span className="absolute -top-1 -right-0.5 w-3.5 h-3.5 rounded-full bg-white text-[8px] flex items-center justify-center border text-slate-900 border-slate-100 shadow-sm animate-scale-in">
                    <Check size={8} strokeWidth={3} style={{ color: accent }} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend Information */}
      <div className="flex justify-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl text-xs font-semibold shadow-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800" />
          <span>Masa Depan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30" />
          <span className="text-rose-500">Terlewat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-lg" style={{ backgroundColor: accent }} />
          <span className="text-slate-700 dark:text-slate-200">Selesai</span>
        </div>
      </div>

    </div>
  );
}
