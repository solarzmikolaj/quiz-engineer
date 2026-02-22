const STORAGE_KEY = "flashcard_app";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getDefault() {
  return {
    cards: {},
    archived: [],
    history: {},
    totalReviewed: 0,
    achievements: {},
  };
}

export function getState() {
  return load() || getDefault();
}

export function saveState(state) {
  save(state);
}

export function resetProgress() {
  save(getDefault());
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Spaced repetition intervals (in days)
const INTERVALS = [0, 1, 3, 7, 14, 30, 60];

export function getCardProgress(state, cardId) {
  return state.cards[cardId] || { level: 0, nextReview: 0, lastReview: 0 };
}

export function markKnown(state, cardId) {
  const prog = getCardProgress(state, cardId);
  const newLevel = Math.min(prog.level + 1, INTERVALS.length - 1);
  const intervalDays = INTERVALS[newLevel];
  const nextReview = Date.now() + intervalDays * 86400000;

  return {
    ...state,
    cards: {
      ...state.cards,
      [cardId]: { level: newLevel, nextReview, lastReview: Date.now() },
    },
    totalReviewed: state.totalReviewed + 1,
    history: addToHistory(state.history, { reviewed: 1, correct: 1 }),
  };
}

export function markUnknown(state, cardId) {
  const nextReview = Date.now() + 60000; // show again in ~1 minute

  return {
    ...state,
    cards: {
      ...state.cards,
      [cardId]: { level: 0, nextReview, lastReview: Date.now() },
    },
    totalReviewed: state.totalReviewed + 1,
    history: addToHistory(state.history, { reviewed: 1, correct: 0 }),
  };
}

export function archiveCard(state, cardId) {
  return {
    ...state,
    archived: [...new Set([...state.archived, cardId])],
    totalReviewed: state.totalReviewed + 1,
    history: addToHistory(state.history, { reviewed: 1, correct: 1 }),
  };
}

function addToHistory(history, { reviewed, correct }) {
  const key = todayKey();
  const day = history[key] || { reviewed: 0, correct: 0, startedAt: Date.now() };
  return {
    ...history,
    [key]: {
      ...day,
      reviewed: day.reviewed + reviewed,
      correct: day.correct + correct,
    },
  };
}

export function getDueCards(state, allCards, validIndices) {
  const now = Date.now();
  const archivedSet = new Set(state.archived);

  return allCards
    .map((card, i) => ({ card, index: i }))
    .filter(({ index }) => {
      if (validIndices && !validIndices.has(index)) return false;
      if (archivedSet.has(index)) return false;
      const prog = getCardProgress(state, index);
      return prog.nextReview <= now;
    });
}

export function getStreak(state) {
  const today = new Date();
  let streak = 0;

  for (let d = 0; d < 365; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const key = date.toISOString().slice(0, 10);
    const day = state.history[key];

    if (d === 0 && !day) continue; // today hasn't started yet, that's ok
    if (day && day.reviewed > 0) {
      streak++;
    } else if (d > 0) {
      break;
    }
  }

  return streak;
}

export function getTodayStats(state) {
  const day = state.history[todayKey()];
  return day || { reviewed: 0, correct: 0 };
}

const ACHIEVEMENT_DEFS = [
  { id: "first", label: "Pierwszy krok", desc: "Przejrzyj pierwszą fiszkę", threshold: 1 },
  { id: "ten", label: "Rozgrzewka", desc: "Przejrzyj 10 fiszek", threshold: 10 },
  { id: "fifty", label: "Pół setki", desc: "Przejrzyj 50 fiszek", threshold: 50 },
  { id: "hundred", label: "Setka!", desc: "Przejrzyj 100 fiszek", threshold: 100 },
  { id: "twofifty", label: "Maszyna", desc: "Przejrzyj 250 fiszek", threshold: 250 },
  { id: "fivehundred", label: "Mistrz fiszek", desc: "Przejrzyj 500 fiszek", threshold: 500 },
  { id: "streak3", label: "3 dni z rzędu", desc: "Ucz się 3 dni pod rząd", threshold: 3, type: "streak" },
  { id: "streak7", label: "Tydzień!", desc: "Ucz się 7 dni pod rząd", threshold: 7, type: "streak" },
  { id: "streak30", label: "Miesiąc!", desc: "Ucz się 30 dni pod rząd", threshold: 30, type: "streak" },
];

export function checkAchievements(state) {
  const newAchievements = [];
  const total = state.totalReviewed;
  const streak = getStreak(state);

  for (const def of ACHIEVEMENT_DEFS) {
    if (state.achievements[def.id]) continue;
    const value = def.type === "streak" ? streak : total;
    if (value >= def.threshold) {
      state = {
        ...state,
        achievements: { ...state.achievements, [def.id]: Date.now() },
      };
      newAchievements.push(def);
    }
  }

  return { state, newAchievements };
}

export { ACHIEVEMENT_DEFS };
