import { X, Plus, Trash2 } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { useSettingsStore } from '../../store/settingsStore';
import { getTodayISO } from '../../utils/dateUtils';
import { v4 as uuidv4 } from 'uuid';

const PRESET_EMOJIS = ['🎯', '🏃‍♂️', '📚', '💧', '🥦', '🧘‍♂️', '💻', '🛌', '📝', '🚭', '☕', '🎨'];
const PRESET_COLORS = [
  '#22c55e', // Green
  '#6366f1', // Indigo
  '#f43f5e', // Rose
  '#eab308', // Amber
  '#06b6d4', // Cyan
  '#a855f7', // Purple
];

export default function HabitSetup({ onClose, editHabitId = null }) {
  const { habits, addHabit, updateHabit } = useHabitStore();
  const { updateSettings } = useSettingsStore();

  const isEdit = !!editHabitId;
  const existingHabit = habits.find(h => h.id === editHabitId);

  const [name, setName] = useState(existingHabit?.name || '');
  const [targetDays, setTargetDays] = useState(existingHabit?.targetDays || 66);
  const [isCustomDays, setIsCustomDays] = useState(![30, 66, 90, 100].includes(existingHabit?.targetDays || 66));
  const [customDaysValue, setCustomDaysValue] = useState(isCustomDays ? existingHabit?.targetDays : 30);
  const [startDate, setStartDate] = useState(existingHabit?.startDate || getTodayISO());
  const [emoji, setEmoji] = useState(existingHabit?.emoji || '🎯');
  const [accentColor, setAccentColor] = useState(existingHabit?.accentColor || PRESET_COLORS[0]);
  const [actionItems, setActionItems] = useState(existingHabit?.actionItems || []);
  const [newActionText, setNewActionText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalTargetDays = isCustomDays ? parseInt(customDaysValue, 10) : targetDays;

    if (isEdit) {
      updateHabit(editHabitId, {
        name: name.trim(),
        targetDays: finalTargetDays,
        startDate,
        emoji,
        accentColor,
        actionItems,
      });
    } else {
      const newId = uuidv4();
      addHabit({
        id: newId,
        name: name.trim(),
        emoji,
        accentColor,
        targetDays: finalTargetDays,
        startDate,
        createdAt: new Date().toISOString(),
        completedDays: [],
        dailyCompletions: {},
        isArchived: false,
        actionItems,
      });
      updateSettings({ activeHabitId: newId });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            {isEdit ? 'Ubah Target' : 'Buat Target Baru'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Emoji Ikon
            </label>
            <div className="flex flex-wrap gap-2.5 p-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900">
              {PRESET_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-xl w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                    emoji === e 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-110' 
                      : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 scale-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Nama Kebiasaan
            </label>
            <input
              type="text"
              maxLength={40}
              placeholder="Contoh: Olahraga 15 menit, Belajar coding..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Accent Color */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Warna Aksen
            </label>
            <div className="flex gap-4">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccentColor(color)}
                  style={{ backgroundColor: color }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform duration-200 ${
                    accentColor === color 
                      ? 'border-white ring-2 ring-indigo-500 scale-110 shadow-lg' 
                      : 'border-transparent hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Target Days */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Durasi Target
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {[30, 66, 90, 100].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => {
                    setTargetDays(days);
                    setIsCustomDays(false);
                  }}
                  className={`py-2 px-1 text-sm font-semibold rounded-xl border transition-all ${
                    !isCustomDays && targetDays === days
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {days} Hari
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomDays(true)}
                className={`py-2 px-1 text-sm font-semibold rounded-xl border transition-all ${
                  isCustomDays
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                Kustom
              </button>
            </div>

            {isCustomDays && (
              <div className="flex items-center gap-3 mt-2.5 animate-in slide-in-from-top-2 duration-150">
                <input
                  type="number"
                  min={7}
                  max={365}
                  value={customDaysValue}
                  onChange={(e) => setCustomDaysValue(e.target.value)}
                  className="w-24 px-3 py-2 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-500">Hari (min 7, max 365)</span>
              </div>
            )}
          </div>

          {/* Action Items List */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Action Items (Opsional)
            </label>
            <div className="space-y-2 mb-3">
              {actionItems.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-55 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate pr-2">
                    {idx + 1}. {item.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActionItems(actionItems.filter(ai => ai.id !== item.id))}
                    className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tambah sub-target/aktivitas..."
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!newActionText.trim()) return;
                    setActionItems([...actionItems, { id: uuidv4(), text: newActionText.trim() }]);
                    setNewActionText('');
                  }
                }}
                className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newActionText.trim()) return;
                  setActionItems([...actionItems, { id: uuidv4(), text: newActionText.trim() }]);
                  setNewActionText('');
                }}
                className="p-2 bg-indigo-50 hover:bg-indigo-105 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-semibold rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-sm font-semibold rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-lg shadow-indigo-600/20"
            >
              {isEdit ? 'Simpan' : 'Mulai Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
