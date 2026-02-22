import { useState, useEffect, useCallback, useMemo } from "react";
import FlashCard from "./FlashCard";
import QuizMode from "./QuizMode";
import { useToast } from "./Toast";
import {
  getState,
  saveState,
  markKnown,
  markUnknown,
  archiveCard,
  getDueCards,
  checkAchievements,
  getTodayStats,
} from "../lib/storage";
import { vibrate, vibrateSuccess, vibrateError } from "../lib/haptics";

export default function StudyView({ allCards, filteredIndices, filteredCards, categoryName, onBack }) {
  const [appState, setAppState] = useState(getState);
  const [queue, setQueue] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flyDirection, setFlyDirection] = useState(null);
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const due = getDueCards(appState, allCards, filteredIndices);
    if (due.length === 0) {
      const archivedSet = new Set(appState.archived);
      const remaining = allCards
        .map((card, i) => ({ card, index: i }))
        .filter(({ index }) => filteredIndices.has(index) && !archivedSet.has(index));

      if (remaining.length === 0) {
        setQueue([]);
      } else {
        const shuffled = [...remaining].sort(() => Math.random() - 0.5);
        setQueue(shuffled);
      }
    } else {
      const shuffled = [...due].sort(() => Math.random() - 0.5);
      setQueue(shuffled);
    }
    setCurrentIdx(0);
  }, []);

  const currentCard = queue[currentIdx];
  const todayStats = getTodayStats(appState);

  const persistAndCheck = useCallback(
    (newState) => {
      const { state: checked, newAchievements } = checkAchievements(newState);
      saveState(checked);
      setAppState(checked);
      for (const a of newAchievements) {
        toast({ title: a.label, desc: a.desc, icon: "🏆" });
      }
      return checked;
    },
    [toast]
  );

  const advance = useCallback(() => {
    setFlyDirection(null);
    setSessionReviewed((s) => {
      const next = s + 1;
      if (next > 0 && next % 10 === 0 && filteredCards.length >= 4) {
        setShowQuiz(true);
      }
      return next;
    });
    setCurrentIdx((i) => i + 1);
  }, [filteredCards.length]);

  const handleSwipeRight = useCallback(() => {
    if (!currentCard) return;
    vibrateSuccess();
    setFlyDirection("right");
    const newState = markKnown(appState, currentCard.index);
    persistAndCheck(newState);
    setTimeout(advance, 400);
  }, [currentCard, appState, persistAndCheck, advance]);

  const handleSwipeLeft = useCallback(() => {
    if (!currentCard) return;
    vibrateError();
    setFlyDirection("left");
    const newState = markUnknown(appState, currentCard.index);
    persistAndCheck(newState);

    setQueue((q) => [...q, currentCard]);
    setTimeout(advance, 400);
  }, [currentCard, appState, persistAndCheck, advance]);

  const handleSwipeUp = useCallback(() => {
    if (!currentCard) return;
    vibrate([5, 20, 5, 20, 5]);
    setFlyDirection("up");
    const newState = archiveCard(appState, currentCard.index);
    persistAndCheck(newState);
    setTimeout(advance, 400);
  }, [currentCard, appState, persistAndCheck, advance]);

  useEffect(() => {
    const handleKey = (e) => {
      if (showQuiz) return;
      if (e.key === "ArrowRight") handleSwipeRight();
      else if (e.key === "ArrowLeft") handleSwipeLeft();
      else if (e.key === "ArrowUp") handleSwipeUp();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleSwipeRight, handleSwipeLeft, handleSwipeUp, showQuiz]);

  const handleQuizComplete = (correct) => {
    if (correct) toast({ title: "Brawo!", desc: "Poprawna odpowiedź", icon: "✅" });
    setTimeout(() => setShowQuiz(false), 200);
  };

  if (showQuiz) {
    return (
      <div className="h-full flex flex-col">
        <StudyHeader
          sessionReviewed={sessionReviewed}
          todayReviewed={todayStats.reviewed}
          total={queue.length}
          currentIdx={currentIdx}
          onBack={onBack}
        />
        <div className="flex-1">
          <QuizMode allCards={filteredCards} onComplete={handleQuizComplete} />
        </div>
      </div>
    );
  }

  if (!currentCard || currentIdx >= queue.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 animate-fade-in px-4">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-center">Wszystko na dziś!</h2>
        <p className="text-white/50 text-center max-w-xs">
          Przejrzałeś wszystkie fiszki w tej sesji. Wróć jutro, aby powtórzyć materiał.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl glass text-neon-bright font-semibold
              hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  const remaining = queue.length - currentIdx;

  return (
    <div className="h-full flex flex-col">
      <StudyHeader
        sessionReviewed={sessionReviewed}
        todayReviewed={todayStats.reviewed}
        total={queue.length}
        currentIdx={currentIdx}
        onBack={onBack}
      />

      <div className="flex-1 flex items-center justify-center px-4 py-2">
        <div className="w-full max-w-sm">
          <FlashCard
            key={currentCard.index}
            card={currentCard.card}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onSwipeUp={handleSwipeUp}
            flyDirection={flyDirection}
          />
        </div>
      </div>

      <div className="px-4 pb-6 pt-2 space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs text-white/30">
          <span>Pozostało: {remaining}</span>
          <span>·</span>
          <span>Sesja: {sessionReviewed}</span>
        </div>

        <div className="flex gap-3 max-w-sm mx-auto w-full">
          <button
            onClick={handleSwipeLeft}
            className="flex-1 py-3.5 rounded-xl bg-wrong/10 border border-wrong/20 text-wrong
              font-semibold active:scale-95 transition-all cursor-pointer text-sm"
          >
            ← Nie wiem
          </button>
          <button
            onClick={handleSwipeUp}
            className="py-3.5 px-4 rounded-xl bg-archive/10 border border-archive/20 text-archive
              font-semibold active:scale-95 transition-all cursor-pointer text-sm"
          >
            ↑ Łatwe
          </button>
          <button
            onClick={handleSwipeRight}
            className="flex-1 py-3.5 rounded-xl bg-correct/10 border border-correct/20 text-correct
              font-semibold active:scale-95 transition-all cursor-pointer text-sm"
          >
            Znam →
          </button>
        </div>
      </div>
    </div>
  );
}

function StudyHeader({ sessionReviewed, todayReviewed, total, currentIdx, onBack }) {
  const pct = total > 0 ? Math.min(((currentIdx) / total) * 100, 100) : 0;

  return (
    <div className="px-4 pt-3 pb-2 space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-white/40 hover:text-white/70 transition-colors cursor-pointer text-sm flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Wróć
        </button>
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span>Dziś: <strong className="text-neon-bright">{todayReviewed}</strong></span>
          <span>Sesja: <strong className="text-white/70">{sessionReviewed}</strong></span>
        </div>
      </div>

      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-neon-dim to-neon-bright rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
