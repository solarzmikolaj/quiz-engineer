import { useMemo, useState } from "react";
import Heatmap from "./Heatmap";
import {
  getState,
  getDueCards,
  getStreak,
  getTodayStats,
  resetProgress,
  ACHIEVEMENT_DEFS,
} from "../lib/storage";

export default function Dashboard({
  allCards,
  categories,
  selectedCategory,
  onSelectCategory,
  filteredIndices,
  filteredCards,
  onStartStudy,
}) {
  const state = getState();
  const streak = getStreak(state);
  const todayStats = getTodayStats(state);

  const dueCount = useMemo(
    () => getDueCards(state, allCards, filteredIndices).length,
    [state, allCards, filteredIndices]
  );

  const archivedCount = state.archived.filter((i) => filteredIndices.has(i)).length;
  const masteredCount = Object.entries(state.cards)
    .filter(([id, c]) => filteredIndices.has(Number(id)) && c.level >= 4).length;
  const unlockedCount = Object.keys(state.achievements).length;

  const remainingActive = filteredCards.length - archivedCount;
  const categoryLabel = selectedCategory
    ? categories.find((c) => c.id === selectedCategory)?.name
    : "Wszystkie kategorie";

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Header */}
        <div className="text-center space-y-1 pt-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            <span className="text-neon-bright">Flash</span>
            <span className="text-white/90">Cards</span>
          </h1>
          <p className="text-sm text-white/40">{categoryLabel} · {filteredCards.length} fiszek</p>
        </div>

        {/* Category selector */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Kategoria</h3>
          <div className="flex flex-wrap gap-2">
            <CategoryChip
              icon="🎯"
              name="Wszystkie"
              count={allCards.length}
              active={!selectedCategory}
              onClick={() => onSelectCategory(null)}
            />
            {categories.map((cat) => {
              const catCount = allCards.filter((c) => c.category === cat.id).length;
              return (
                <CategoryChip
                  key={cat.id}
                  icon={cat.icon}
                  name={cat.name}
                  count={catCount}
                  active={selectedCategory === cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Streak badge */}
        {streak > 0 && (
          <div className="flex justify-center animate-pop">
            <div className="glass rounded-full px-5 py-2 flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span className="text-sm font-bold text-neon-bright">{streak} dni z rzędu!</span>
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Do powtórki" value={dueCount} icon="📚" highlight />
          <StatCard label="Dziś przejrzane" value={todayStats.reviewed} icon="✅" />
          <StatCard label="Opanowane" value={masteredCount} icon="🧠" />
          <StatCard label="Zarchiwizowane" value={archivedCount} icon="📦" />
        </div>

        {/* Heatmap */}
        <div className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/70">Aktywność (90 dni)</h3>
            <span className="text-xs text-white/30">{state.totalReviewed} łącznie</span>
          </div>
          <Heatmap history={state.history} />
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span>Mniej</span>
            <div className="flex gap-[2px]">
              <div className="w-3 h-3 rounded-sm bg-white/[0.03]" />
              <div className="w-3 h-3 rounded-sm bg-neon/20" />
              <div className="w-3 h-3 rounded-sm bg-neon/40" />
              <div className="w-3 h-3 rounded-sm bg-neon/60" />
              <div className="w-3 h-3 rounded-sm bg-neon/80" />
            </div>
            <span>Więcej</span>
          </div>
        </div>

        {/* Achievements */}
        <div className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/70">Osiągnięcia</h3>
            <span className="text-xs text-white/30">{unlockedCount}/{ACHIEVEMENT_DEFS.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ACHIEVEMENT_DEFS.map((a) => {
              const unlocked = !!state.achievements[a.id];
              return (
                <div
                  key={a.id}
                  className={`rounded-lg p-2 text-center transition-all ${
                    unlocked ? "glass-light" : "bg-white/[0.02] opacity-40"
                  }`}
                >
                  <span className="text-lg">{unlocked ? "🏆" : "🔒"}</span>
                  <p className="text-[10px] font-medium text-white/60 mt-1 leading-tight truncate">
                    {a.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div className="glass-light rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white/60 mb-2">Jak korzystać?</h3>
          <div className="space-y-1.5 text-xs text-white/40 leading-relaxed">
            <p><span className="text-correct">→ Swipe prawo</span> = Znam to!</p>
            <p><span className="text-wrong">← Swipe lewo</span> = Nie pamiętam</p>
            <p><span className="text-archive">↑ Swipe góra</span> = Za łatwe (archiwizuj)</p>
            <p><span className="text-neon-bright">Spacja</span> = Obróć kartę</p>
            <p className="text-white/30 pt-1">Co 10 fiszek pojawia się szybki quiz ABCD!</p>
          </div>
        </div>

        {/* Reset */}
        <ResetButton />
      </div>

      {/* Bottom CTA */}
      <div className="px-4 pb-6 pt-3">
        <button
          onClick={onStartStudy}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-neon-dim to-neon font-bold text-lg
            active:scale-[0.97] transition-all cursor-pointer neon-shadow text-white"
        >
          {dueCount > 0
            ? `Rozpocznij naukę (${dueCount} fiszek)`
            : remainingActive > 0
              ? `Powtórz wszystkie (${remainingActive})`
              : "Wszystko opanowane! 🎉"}
        </button>
      </div>
    </div>
  );
}

function CategoryChip({ icon, name, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium
        transition-all cursor-pointer active:scale-95
        ${active
          ? "glass border-neon/40 text-neon-bright neon-shadow"
          : "glass-light text-white/50 hover:text-white/70 hover:border-white/10"
        }`}
    >
      <span>{icon}</span>
      <span>{name}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded-md ${active ? "bg-neon/20 text-neon-bright" : "bg-white/5 text-white/30"}`}>
        {count}
      </span>
    </button>
  );
}

function ResetButton() {
  const [confirming, setConfirming] = useState(false);

  const handleReset = () => {
    resetProgress();
    window.location.reload();
  };

  if (confirming) {
    return (
      <div className="glass rounded-xl p-4 space-y-3 border border-wrong/30 animate-fade-in">
        <p className="text-sm text-white/70 text-center">
          Na pewno chcesz zresetować cały postęp?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm font-medium
              hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
          >
            Anuluj
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-xl bg-wrong/20 border border-wrong/40 text-wrong text-sm font-semibold
              hover:bg-wrong/30 active:scale-95 transition-all cursor-pointer"
          >
            Resetuj
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="w-full py-2.5 rounded-xl border border-white/5 text-white/25 text-sm
        hover:border-wrong/20 hover:text-wrong/50 active:scale-[0.98] transition-all cursor-pointer"
    >
      Resetuj postęp
    </button>
  );
}

function StatCard({ label, value, icon, highlight }) {
  return (
    <div className={`glass rounded-xl p-3 flex items-center gap-3 ${highlight && value > 0 ? "border-neon/30" : ""}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xl font-bold text-white/90">{value}</p>
        <p className="text-[11px] text-white/40">{label}</p>
      </div>
    </div>
  );
}
