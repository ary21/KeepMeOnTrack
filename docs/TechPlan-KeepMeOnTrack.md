# Technical Development Plan
# KeepMeOnTrack

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** June 2026  

---

## 1. Tech Stack

### 1.1 Frontend Framework

**Pilihan: React + Vite**

| Alasan | Detail |
|---|---|
| Komponen reusable | Calendar grid, streak counter, progress bar semua bisa jadi reusable components |
| State management ringan | Zustand atau React Context cukup — tidak perlu Redux |
| Ekosistem PWA matang | Vite PWA plugin (vite-plugin-pwa) langsung generate service worker |
| Build size kecil | Tree shaking Vite menghasilkan bundle < 200KB |

### 1.2 Styling

**Pilihan: Tailwind CSS**

- Utility-first, tidak ada CSS overhead yang tidak terpakai
- Dark mode built-in dengan `dark:` prefix
- Custom config untuk warna aksen KeepMeOnTrack (hijau chain, merah missed)

### 1.3 Storage

**Pilihan: localStorage (via wrapper)**

```
localStorage key schema:
  keepmeontrack_habits       → array of Habit objects
  keepmeontrack_active_id    → string (active habit id)
  keepmeontrack_settings     → object (theme, sound, etc)
```

Tidak menggunakan IndexedDB karena data sangat kecil dan tidak perlu query kompleks.

### 1.4 Image Generation (Completion Card)

**Pilihan: html2canvas + Canvas API fallback**

- `html2canvas`: render komponen React ke canvas → export PNG
- Fallback manual Canvas API untuk browser yang tidak support html2canvas dengan sempurna
- Ukuran output: 1080×1080px (optimal untuk Instagram/WhatsApp)

### 1.5 PWA

**Pilihan: vite-plugin-pwa (Workbox)**

- Auto-generate `manifest.json` dan service worker
- Cache strategy: **Cache First** untuk semua aset statis
- Update prompt: toast notifikasi saat ada versi baru

### 1.6 Animasi

**Pilihan: Framer Motion (ringan)**

- Micro-interaction tap: scale + pulse + glow hijau
- Confetti saat milestone: library `canvas-confetti` (< 5KB)
- Page transition: fade sederhana

---

## 2. Project Structure

```
keepmeontrack/
├── public/
│   ├── icons/                  # PWA icons (192, 512, maskable)
│   ├── manifest.json           # PWA manifest
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── calendar/
│   │   │   ├── CalendarGrid.jsx        # Grid bulan utama
│   │   │   ├── DayCell.jsx             # Satu kotak hari
│   │   │   └── ChainConnector.jsx      # SVG garis antar hari hijau
│   │   ├── progress/
│   │   │   ├── ProgressView.jsx        # Halaman progress
│   │   │   ├── ProgressBar.jsx         # Bar dengan milestone markers
│   │   │   ├── WeekStrip.jsx           # 7-kotak minggu ini
│   │   │   └── StatsPanel.jsx          # Current streak, longest, dll
│   │   ├── habit/
│   │   │   ├── HabitSetup.jsx          # Form create/edit target
│   │   │   ├── HabitSwitcher.jsx       # Dropdown switch antar habit
│   │   │   └── HabitCard.jsx           # Summary card habit
│   │   ├── completion/
│   │   │   ├── CompletionScreen.jsx    # Layar celebrasi
│   │   │   ├── ShareCard.jsx           # Komponen kartu yang di-render ke PNG
│   │   │   └── CardTemplates.jsx       # 3 template visual kartu
│   │   ├── ui/
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── StreakCounter.jsx
│   │   └── layout/
│   │       ├── AppShell.jsx            # Shell utama dengan bottom nav
│   │       └── BottomNav.jsx           # Tab: Hari Ini | Kalender | Progress
│   ├── store/
│   │   ├── habitStore.js               # Zustand store untuk habits
│   │   └── settingsStore.js            # Zustand store untuk settings
│   ├── hooks/
│   │   ├── useHabit.js                 # Custom hook operasi habit
│   │   ├── useStreak.js                # Kalkulasi streak logic
│   │   └── useShareCard.js             # html2canvas logic
│   ├── utils/
│   │   ├── dateUtils.js                # Helper tanggal (format, compare, dll)
│   │   ├── storageUtils.js             # localStorage read/write wrapper
│   │   ├── exportUtils.js              # Export/import JSON
│   │   └── streakCalculator.js         # Pure functions kalkulasi streak
│   ├── pages/
│   │   ├── Today.jsx                   # Halaman utama — tap hari ini
│   │   ├── Calendar.jsx                # Calendar chain view
│   │   ├── Progress.jsx                # Progress & stats view
│   │   └── Settings.jsx                # Export, import, reset, theme
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 3. Data Models

### 3.1 Habit Object

```typescript
interface Habit {
  id: string;                    // UUID v4
  name: string;                  // Max 40 karakter
  emoji: string;                 // Default: "🎯"
  accentColor: string;           // Hex color, default: "#22c55e"
  targetDays: number;            // 30 | 66 | 90 | 100 | custom
  startDate: string;             // ISO 8601: "2026-06-01"
  createdAt: string;             // ISO 8601 timestamp
  completedDays: string[];       // Array of ISO date strings: ["2026-06-01", "2026-06-02"]
  isArchived: boolean;           // false = aktif, true = selesai/diarsip
  completedAt?: string;          // ISO timestamp, set saat target selesai
}
```

### 3.2 Settings Object

```typescript
interface Settings {
  theme: "dark" | "light" | "system";
  soundEnabled: boolean;
  activeHabitId: string | null;
  onboardingDone: boolean;
  lastExportDate: string | null;
}
```

### 3.3 localStorage Schema

```javascript
// Key: "keepmeontrack_habits"
// Value: JSON.stringify(Habit[])

// Key: "keepmeontrack_settings"  
// Value: JSON.stringify(Settings)
```

---

## 4. Core Logic

### 4.1 Streak Calculator

```javascript
// streakCalculator.js

/**
 * Hitung current streak dari array completedDays
 * Current streak = hari berturut-turut SAMPAI hari ini atau kemarin
 */
function calculateCurrentStreak(completedDays, today) {
  const sorted = [...completedDays].sort().reverse(); // descending
  if (!sorted.length) return 0;

  let streak = 0;
  let checkDate = today;

  // Boleh mulai dari hari ini ATAU kemarin (user belum tap hari ini)
  if (sorted[0] !== today) {
    const yesterday = subtractDays(today, 1);
    if (sorted[0] !== yesterday) return 0;
    checkDate = yesterday;
  }

  for (const day of sorted) {
    if (day === checkDate) {
      streak++;
      checkDate = subtractDays(checkDate, 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Hitung longest streak dari seluruh riwayat
 */
function calculateLongestStreak(completedDays) {
  if (!completedDays.length) return 0;
  const sorted = [...completedDays].sort(); // ascending
  let longest = 1, current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const diff = daysBetween(sorted[i - 1], sorted[i]);
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}
```

### 4.2 Today Check Logic

```javascript
// useHabit.js

function isTodayCompleted(habit) {
  const today = getTodayISO(); // "2026-06-23"
  return habit.completedDays.includes(today);
}

function toggleToday(habit) {
  const today = getTodayISO();
  const isCompleted = habit.completedDays.includes(today);
  
  if (isCompleted) {
    // Undo: remove today
    return {
      ...habit,
      completedDays: habit.completedDays.filter(d => d !== today)
    };
  } else {
    // Mark done: add today
    const updated = {
      ...habit,
      completedDays: [...habit.completedDays, today]
    };
    // Cek apakah target selesai
    if (updated.completedDays.length >= habit.targetDays) {
      updated.isArchived = true;
      updated.completedAt = new Date().toISOString();
    }
    return updated;
  }
}
```

### 4.3 Calendar Grid Generation

```javascript
// dateUtils.js

function generateCalendarMonth(year, month, completedDays, startDate) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = getTodayISO();
  
  const days = [];
  
  // Padding awal (hari sebelum tanggal 1)
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({ type: "padding" });
  }
  
  // Isi hari dalam bulan
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = formatISO(year, month, d);
    const isBeforeStart = dateStr < startDate;
    const isFuture = dateStr > today;
    const isToday = dateStr === today;
    const isDone = completedDays.includes(dateStr);
    const isMissed = !isFuture && !isDone && !isBeforeStart && dateStr !== today;
    
    days.push({
      type: "day",
      date: dateStr,
      day: d,
      isToday,
      isDone,
      isMissed,
      isFuture,
      isBeforeStart,
    });
  }
  
  return days;
}
```

---

## 5. Share Card Generation

```javascript
// useShareCard.js

async function generateShareCard(habit, templateId) {
  // 1. Render komponen ShareCard ke DOM (hidden div)
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1080px;height:1080px;";
  document.body.appendChild(container);
  
  // Render React component ke container
  const root = createRoot(container);
  root.render(<ShareCard habit={habit} templateId={templateId} />);
  
  // 2. Tunggu render selesai
  await new Promise(r => setTimeout(r, 200));
  
  // 3. html2canvas
  const canvas = await html2canvas(container, {
    width: 1080,
    height: 1080,
    scale: 1,
    useCORS: true,
    backgroundColor: null,
  });
  
  // 4. Cleanup
  root.unmount();
  document.body.removeChild(container);
  
  // 5. Return blob
  return new Promise(resolve => canvas.toBlob(resolve, "image/png"));
}

async function shareCard(blob, habitName) {
  const file = new File([blob], "keepmeontrack.png", { type: "image/png" });
  
  // Web Share API (mobile-friendly)
  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "KeepMeOnTrack",
      text: `Saya berhasil menyelesaikan target: ${habitName}! #KeepMeOnTrack`,
    });
  } else {
    // Fallback: download PNG
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keepmeontrack-achievement.png";
    a.click();
    URL.revokeObjectURL(url);
  }
}
```

---

## 6. PWA Configuration

### 6.1 vite.config.js

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",  // Tanya user sebelum update (tidak auto)
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [], // Semua dari cache; tidak ada network call
      },
      manifest: {
        name: "KeepMeOnTrack",
        short_name: "OnTrack",
        description: "Satu habit. Satu rantai. Jangan putus.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
});
```

---

## 7. Development Phases

### Phase 1 — Core MVP (Target: 2 minggu)

**Sprint 1 (Minggu 1):**
- [ ] Setup project: Vite + React + Tailwind + Zustand
- [ ] Data model & localStorage utils
- [ ] Streak calculator (unit tested)
- [ ] HabitSetup form (create target baru)
- [ ] Calendar grid component (static dulu)

**Sprint 2 (Minggu 2):**
- [ ] DayCell interaktif (tap toggle, state hijau/merah)
- [ ] ChainConnector SVG
- [ ] StreakCounter component
- [ ] Today page (tombol besar log hari ini)
- [ ] Micro-animation tap (Framer Motion)

### Phase 2 — Progress & Polish (Target: 1 minggu)

- [ ] Progress View: ProgressBar + milestone markers
- [ ] WeekStrip + StatsPanel
- [ ] Bottom navigation (Today | Calendar | Progress)
- [ ] Dark mode / light mode toggle
- [ ] Responsiveness: mobile & desktop

### Phase 3 — PWA + Share (Target: 1 minggu)

- [ ] PWA manifest & service worker (vite-plugin-pwa)
- [ ] Offline mode testing
- [ ] CompletionScreen & animasi celebrasi
- [ ] ShareCard 3 template
- [ ] html2canvas integration + Web Share API
- [ ] Export/import JSON

### Phase 4 — QA & Launch (Target: 3 hari)

- [ ] Cross-browser testing (Chrome, Safari, Firefox, Samsung Internet)
- [ ] Cross-device testing (Android, iOS, Desktop)
- [ ] Lighthouse audit: PWA score > 90, Performance > 85
- [ ] Edge case: undo tap, timezone change, bulan ganti
- [ ] Deploy ke Vercel / Netlify / Cloudflare Pages

---

## 8. Testing Strategy

### 8.1 Unit Tests (Vitest)

Fokus pada pure functions yang kritikal:

```
streakCalculator.test.js
  ✓ Hitung streak 0 saat belum ada completedDays
  ✓ Hitung streak = 1 saat hanya hari ini
  ✓ Hitung streak berturut-turut benar
  ✓ Streak tidak hitungkan hari yang terlewat di tengah
  ✓ Longest streak benar meski ada gap
  ✓ Hitung streak mulai dari kemarin jika hari ini belum di-tap

dateUtils.test.js
  ✓ formatISO menghasilkan format benar
  ✓ daysBetween akurat
  ✓ generateCalendarMonth padding benar di awal bulan
  ✓ Hari future tidak bisa di-tap
```

### 8.2 Manual QA Checklist

- [ ] Install sebagai PWA di Android (Chrome) dan iOS (Safari)
- [ ] Tap hari ini → chain terhubung secara visual
- [ ] Streak counter update realtime
- [ ] Undo tap hari ini bekerja dengan benar
- [ ] Ganti bulan → navigasi kalender mulus
- [ ] Selesaikan target → muncul completion screen
- [ ] Share card → gambar benar ter-generate
- [ ] Export JSON → bisa di-import ulang tanpa kehilangan data
- [ ] Matikan internet → app masih berfungsi penuh
- [ ] Kill app dan buka lagi → semua data masih ada

### 8.3 Lighthouse Targets

| Metrik | Target |
|---|---|
| Performance | ≥ 85 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 90 |
| SEO | ≥ 80 |
| PWA | ≥ 90 |

---

## 9. Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "zustand": "^4.x",
    "framer-motion": "^11.x",
    "html2canvas": "^1.x",
    "canvas-confetti": "^1.x",
    "uuid": "^9.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "vite-plugin-pwa": "^0.x",
    "tailwindcss": "^3.x",
    "autoprefixer": "^10.x",
    "vitest": "^1.x",
    "@testing-library/react": "^14.x"
  }
}
```

**Estimated bundle size (gzipped):**

| Chunk | Size |
|---|---|
| React + ReactDOM | ~45 KB |
| Framer Motion | ~18 KB |
| Zustand | ~3 KB |
| html2canvas | ~35 KB (lazy loaded) |
| canvas-confetti | ~5 KB (lazy loaded) |
| App code | ~30 KB |
| **Total (initial load)** | **~96 KB** |

---

## 10. Deployment

**Rekomendasi: Cloudflare Pages** (gratis, CDN global, mendukung PWA header)

```
# Headers yang wajib di-set untuk PWA
Cache-Control: public, max-age=31536000, immutable  # untuk /assets/*
Cache-Control: no-cache                              # untuk index.html
```

**CI/CD:**
- GitHub Actions → auto deploy ke Cloudflare Pages pada push ke `main`
- Preview deploy otomatis untuk setiap pull request

---

## 11. Future Considerations (v2)

| Feature | Tech Approach |
|---|---|
| Cloud sync | Supabase (PostgreSQL + Auth) atau PocketBase (self-hosted) |
| Push notifications | Web Push API + VAPID keys |
| Multiple habit dashboard | Grid view semua habit sekaligus |
| Widget (Android) | Tidak mungkin via PWA; butuh native app (React Native) |
| Apple Watch complication | Butuh native iOS app |

---

*Dokumen ini akan diperbarui seiring progress development.*
