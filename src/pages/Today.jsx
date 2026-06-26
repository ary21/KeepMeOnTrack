import React from 'react';
import { Flame, CheckCircle2, Circle } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import { useSettingsStore } from '../store/settingsStore';
import { getTodayISO } from '../utils/dateUtils';
import { calculateCurrentStreak } from '../utils/streakCalculator';
import confetti from 'canvas-confetti';

// Play premium synthesizer beep
function playCompletionSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    // Play a nice sweet high pitch double chime
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    console.error('Audio failed to play', e);
  }
}

export default function Today({ onOpenSetup }) {
  const { habits, toggleDay } = useHabitStore();
  const { settings } = useSettingsStore();

  const activeHabit = habits.find((h) => h.id === settings.activeHabitId) || habits[0];
  const today = getTodayISO();

  if (!activeHabit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="text-6xl animate-bounce">🎯</div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Belum ada target aktif</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            Bangun kebiasaan baru sekarang. Sederhana, fokus satu target pada satu waktu.
          </p>
        </div>
        <button
          onClick={onOpenSetup}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          Buat Target Pertama Anda
        </button>
      </div>
    );
  }

  const isCompleted = activeHabit.completedDays.includes(today);
  const currentStreak = calculateCurrentStreak(activeHabit.completedDays, today);
  const accent = activeHabit.accentColor || '#22c55e';

  const handleTap = () => {
    toggleDay(activeHabit.id, today);
    
    const nextCompleted = !isCompleted;
    if (nextCompleted) {
      if (settings.soundEnabled) {
        playCompletionSound();
      }
      
      // Multi-angle premium confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: [accent, '#6366f1', '#a855f7'],
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Streak Counter Header */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 shadow-sm animate-pulse">
          <Flame size={24} className="text-amber-500 fill-amber-500" />
          <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
            {currentStreak} Hari Streak!
          </span>
        </div>
        <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
          Target Anda
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-2">
          <span>{activeHabit.emoji}</span>
          <span>{activeHabit.name}</span>
        </h1>
      </div>

      {/* Large Interactive Tap Button */}
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Outer pulse circles */}
        <div 
          className="absolute inset-0 rounded-full opacity-10 animate-ping duration-1000"
          style={{ backgroundColor: accent }}
        />
        <div 
          className="absolute inset-4 rounded-full opacity-20 animate-pulse duration-700"
          style={{ backgroundColor: accent }}
        />

        {/* Core button */}
        <button
          onClick={handleTap}
          style={{
            background: isCompleted 
              ? `linear-gradient(135deg, ${accent}, ${accent}dd)` 
              : 'linear-gradient(135deg, #1e293b, #0f172a)'
          }}
          className={`relative z-10 w-48 h-48 rounded-full shadow-2xl flex flex-col items-center justify-center text-white transition-all active:scale-90 hover:scale-105 border-4 duration-300 ${
            isCompleted 
              ? 'border-white dark:border-slate-800' 
              : 'border-slate-700 dark:border-slate-800'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 size={54} className="mb-2 text-white animate-bounce" />
              <span className="text-sm font-bold uppercase tracking-wider">Selesai!</span>
            </>
          ) : (
            <>
              <Circle size={44} className="mb-3 text-slate-400 group-hover:text-white" />
              <span className="text-sm font-bold uppercase tracking-wider text-slate-300">Tap Hari Ini</span>
            </>
          )}
        </button>
      </div>

      {/* Target Progress Quick Indicator */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Kemajuan Target</span>
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {activeHabit.completedDays.length} / {activeHabit.targetDays} Hari
          </span>
        </div>
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${Math.min(100, (activeHabit.completedDays.length / activeHabit.targetDays) * 100)}%`,
              backgroundColor: accent
            }}
          />
        </div>
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-1 font-semibold">
          {isCompleted 
            ? 'Kerja bagus! Sampai jumpa besok hari.' 
            : 'Ketuk tombol di atas setelah Anda menyelesaikan aktivitas hari ini.'
          }
        </div>
      </div>
    </div>
  );
}
