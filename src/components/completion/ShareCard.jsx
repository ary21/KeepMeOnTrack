import React from 'react';

export default function ShareCard({ habit, templateId }) {
  const accent = habit.accentColor || '#22c55e';
  const totalDays = habit.targetDays;
  
  // Theme designs
  let cardStyle = '';
  let titleStyle = '';
  let subStyle = '';
  let statsContainerStyle = '';
  let statLabelStyle = '';
  let statValStyle = '';

  if (templateId === 'bold') {
    cardStyle = 'bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white';
    titleStyle = 'text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400';
    subStyle = 'text-slate-400 text-lg';
    statsContainerStyle = 'bg-white/5 border border-white/10';
    statLabelStyle = 'text-slate-450';
    statValStyle = 'text-white';
  } else if (templateId === 'pastel') {
    cardStyle = 'bg-gradient-to-tr from-pink-50 via-rose-50 to-indigo-50 text-slate-800';
    titleStyle = 'text-5xl font-extrabold tracking-tight text-indigo-950';
    subStyle = 'text-indigo-900/60 text-lg';
    statsContainerStyle = 'bg-indigo-950/5 border border-indigo-950/10';
    statLabelStyle = 'text-indigo-900/50';
    statValStyle = 'text-indigo-950';
  } else {
    // Minimal (Default)
    cardStyle = 'bg-white text-slate-800 border border-slate-200';
    titleStyle = 'text-5xl font-extrabold tracking-tight text-slate-900';
    subStyle = 'text-slate-500 text-lg';
    statsContainerStyle = 'bg-slate-50 border border-slate-200/60';
    statLabelStyle = 'text-slate-400';
    statValStyle = 'text-slate-800';
  }

  return (
    <div 
      id="share-card-render"
      className={`w-[1080px] h-[1080px] flex flex-col justify-between p-20 select-none box-border font-sans ${cardStyle}`}
    >
      {/* Top Header info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
            K
          </div>
          <span className="text-xl font-bold tracking-wider uppercase opacity-80">
            KeepMeOnTrack
          </span>
        </div>
        <div className="pt-8 space-y-2">
          <div className="text-sm font-black uppercase tracking-widest text-indigo-500">
            Target Tercapai!
          </div>
          <h1 className={titleStyle}>
            {habit.emoji} {habit.name}
          </h1>
          <p className={subStyle}>
            Menyelesaikan rantai kebiasaan penuh tanpa terputus.
          </p>
        </div>
      </div>

      {/* Grid Graphic */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="grid grid-cols-10 gap-4 max-w-[640px]">
          {Array.from({ length: Math.min(totalDays, 50) }).map((_, i) => (
            <div
              key={i}
              style={{ backgroundColor: accent }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md animate-pulse"
            >
              ✓
            </div>
          ))}
          {totalDays > 50 && (
            <div className="w-10 h-10 rounded-xl bg-slate-250 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-500">
              +{totalDays - 50}
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary Footer */}
      <div className="grid grid-cols-3 gap-8">
        <div className={`p-6 rounded-2xl ${statsContainerStyle}`}>
          <div className={`text-xs font-bold uppercase tracking-wider ${statLabelStyle}`}>
            Durasi Total
          </div>
          <div className={`text-3xl font-extrabold mt-1 ${statValStyle}`}>
            {totalDays} Hari
          </div>
        </div>
        <div className={`p-6 rounded-2xl ${statsContainerStyle}`}>
          <div className={`text-xs font-bold uppercase tracking-wider ${statLabelStyle}`}>
            Status
          </div>
          <div className={`text-3xl font-extrabold mt-1 text-emerald-500`}>
            Lulus 100%
          </div>
        </div>
        <div className={`p-6 rounded-2xl ${statsContainerStyle}`}>
          <div className={`text-xs font-bold uppercase tracking-wider ${statLabelStyle}`}>
            Hashtag
          </div>
          <div className={`text-3xl font-extrabold mt-1 text-indigo-500`}>
            #OnTrack
          </div>
        </div>
      </div>
    </div>
  );
}
