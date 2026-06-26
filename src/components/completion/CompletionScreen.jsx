import React, { useState } from 'react';
import { X, Share2, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import ShareCard from './ShareCard';

export default function CompletionScreen({ habit, onClose }) {
  const [templateId, setTemplateId] = useState('minimal');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    setIsGenerating(true);
    try {
      const cardEl = document.getElementById('share-card-render');
      if (!cardEl) throw new Error('Render container not found');

      // Temporarily remove hidden styles to let html2canvas draw it
      cardEl.style.position = 'static';
      cardEl.style.left = 'auto';
      cardEl.style.top = 'auto';

      const canvas = await html2canvas(cardEl, {
        width: 1080,
        height: 1080,
        scale: 1,
        useCORS: true,
      });

      // Restore hidden styles
      cardEl.style.position = 'fixed';
      cardEl.style.left = '-9999px';
      cardEl.style.top = '-9999px';

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `keepmeontrack-${habit.name}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Target Selesai!',
            text: `Saya berhasil menyelesaikan target kebiasaan: ${habit.name}! #KeepMeOnTrack`,
          });
        } else {
          // Fallback: Download file
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `keepmeontrack-${habit.name}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (e) {
      console.error(e);
      alert('Gagal menghasilkan kartu pencapaian.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 text-white p-6 overflow-y-auto">
      
      {/* Top Header */}
      <div className="flex justify-between items-center w-full max-w-md mx-auto pt-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-yellow-400 fill-yellow-400" />
          <span className="font-extrabold text-lg tracking-wider text-yellow-400">MILIESTONE DICAPAI</span>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Celebration Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto my-8">
        <div className="text-8xl animate-bounce">🏆</div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
            Luar Biasa!
          </h1>
          <p className="text-lg font-bold text-slate-200">
            Anda telah menyelesaikan target "{habit.emoji} {habit.name}" selama {habit.targetDays} hari.
          </p>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            Rantai kebiasaan Anda tidak pernah terputus. Pilih template di bawah untuk membagikan pencapaian Anda.
          </p>
        </div>

        {/* Template Selector */}
        <div className="flex gap-3 bg-white/5 border border-white/10 rounded-2xl p-1.5 w-full">
          {[
            { id: 'minimal', label: 'Minimalis' },
            { id: 'bold', label: 'Gelap/Bold' },
            { id: 'pastel', label: 'Pastel' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                templateId === t.id 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md mx-auto pb-4 space-y-3">
        <button
          onClick={handleShare}
          disabled={isGenerating}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 font-bold text-white shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {isGenerating ? (
            <span>Sedang memproses...</span>
          ) : (
            <>
              <Share2 size={18} />
              <span>Bagikan Pencapaian</span>
            </>
          )}
        </button>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 font-bold text-slate-350 transition-colors text-sm"
        >
          Kembali ke Dashboard
        </button>
      </div>

      {/* Hidden container for ShareCard rendering */}
      <div 
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          zIndex: -1,
        }}
      >
        <ShareCard habit={habit} templateId={templateId} />
      </div>

    </div>
  );
}
