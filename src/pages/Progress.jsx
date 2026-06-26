import React from 'react';
import { Award, Zap, CheckCircle, Percent } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import { useSettingsStore } from '../store/settingsStore';
import { getTodayISO, subtractDays } from '../utils/dateUtils';
import { calculateCurrentStreak, calculateLongestStreak } from '../utils/streakCalculator';

const MILESTONES = [
  { days: 7, label: '7 Hari', icon: '🥉', name: 'Perunggu' },
  { days: 30, label: '30 Hari', icon: '🥈', name: 'Perak' },
  { days: 66, label: '66 Hari', icon: '🥇', name: 'Emas' },
  { days: 100, label: '100 Hari', icon: '🏆', name: 'Legenda' },
];

export default function Progress({ onOpenSetup }) {
  const { habits } = useHabitStore();
  const { settings } = useSettingsStore();

  const activeHabit = habits.find((h) => h.id === settings.activeHabitId) || habits[0];
  const today = getTodayISO();

  if (!activeHabit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="text-6xl animate-bounce">📊</div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Belum ada target aktif</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            Isi setup target untuk memantau kemajuan Anda secara visual di sini.
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

  const completedCount = activeHabit.completedDays.length;
  const targetDays = activeHabit.targetDays;
  const progressPercent = Math.min(100, Math.round((completedCount / targetDays) * 100));

  const currentStreak = calculateCurrentStreak(activeHabit.completedDays, today);
  const longestStreak = calculateLongestStreak(activeHabit.completedDays);
  
  // Calculate completion rate based on days elapsed since start date or targetDays
  // Let's make it simple: completed days divided by total target days.
  const completionRate = Math.round((completedCount / targetDays) * 100);

  const accent = activeHabit.accentColor || '#22c55e';

  // Generate weekly summary (past 7 days including today)
  const weeklySummary = [];
  for (let i = 6; i >= 0; i--) {
    const checkDate = subtractDays(today, i);
    const dateObj = new Date(checkDate + 'T00:00:00');
    const dayLabel = dateObj.toLocaleDateString('id-ID', { weekday: 'short' }).slice(0, 3);
    const isDone = activeHabit.completedDays.includes(checkDate);
    const isCheckToday = checkDate === today;
    
    weeklySummary.push({
      date: checkDate,
      label: dayLabel,
      isDone,
      isToday: isCheckToday,
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Progres & Pencapaian</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Setiap langkah kecil membawamu lebih dekat ke target
        </p>
      </div>

      {/* Progress Bar & Milestones */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Kemajuan
            </div>
            <div className="text-3xl font-extrabold mt-1 text-slate-800 dark:text-white">
              {completedCount} <span className="text-sm font-semibold text-slate-500">dari {targetDays} Hari</span>
            </div>
          </div>
          <div className="text-3xl font-black" style={{ color: accent }}>
            {progressPercent}%
          </div>
        </div>

        {/* Progress Bar track */}
        <div className="relative pt-4">
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full relative">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: accent,
              }}
            />
            
            {/* Milestone pins */}
            {MILESTONES.filter(m => m.days <= targetDays).map((milestone) => {
              const position = (milestone.days / targetDays) * 100;
              const isAchieved = completedCount >= milestone.days;
              return (
                <div
                  key={milestone.days}
                  className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: `${position}%` }}
                >
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-md border-2 transition-all duration-300 ${
                      isAchieved 
                        ? 'bg-white border-indigo-500 scale-110' 
                        : 'bg-slate-200 dark:bg-slate-700 border-slate-350 dark:border-slate-800 scale-90 opacity-60'
                    }`}
                    title={`${milestone.name} (${milestone.days} hari)`}
                  >
                    {milestone.icon}
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-6 absolute">
                    {milestone.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-6" /> {/* Spacer for labels */}
      </div>

      {/* Weekly summary strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Minggu Ini</h3>
        <div className="grid grid-cols-7 gap-2.5">
          {weeklySummary.map((item) => (
            <div 
              key={item.date} 
              className={`flex flex-col items-center p-2 rounded-2xl border transition-all ${
                item.isToday 
                  ? 'ring-2 ring-indigo-500 border-transparent bg-indigo-500/5' 
                  : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase">
                {item.label}
              </span>
              <div 
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-all ${
                  item.isDone
                    ? 'text-white shadow-sm'
                    : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600'
                }`}
                style={item.isDone ? { backgroundColor: accent } : {}}
              >
                {item.isDone ? '✓' : '•'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats panel grid */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Active Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
            <Zap size={22} className="fill-amber-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Streak Saat Ini
            </div>
            <div className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">
              {currentStreak} Hari
            </div>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
            <Award size={22} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Streak Terpanjang
            </div>
            <div className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">
              {longestStreak} Hari
            </div>
          </div>
        </div>

        {/* Total Completed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Check-in
            </div>
            <div className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">
              {completedCount} Hari
            </div>
          </div>
        </div>

        {/* Rate percentage */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-500">
            <Percent size={22} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Tingkat Selesai
            </div>
            <div className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5">
              {completionRate}%
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
