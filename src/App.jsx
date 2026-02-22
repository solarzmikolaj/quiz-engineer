import { useState, useMemo } from "react";
import Dashboard from "./components/Dashboard";
import StudyView from "./components/StudyView";
import { ToastProvider } from "./components/Toast";
import data from "../questions.json";

const allCards = data.flashcards;
const categories = data.categories;

export default function App() {
  const [view, setView] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredEntries = useMemo(() => {
    return allCards
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => !selectedCategory || card.category === selectedCategory);
  }, [selectedCategory]);

  const filteredCards = useMemo(
    () => filteredEntries.map(({ card }) => card),
    [filteredEntries]
  );

  const filteredIndices = useMemo(
    () => new Set(filteredEntries.map(({ index }) => index)),
    [filteredEntries]
  );

  return (
    <ToastProvider>
      <div className="h-full flex flex-col bg-[#0f0f1a]">
        {view === "dashboard" && (
          <Dashboard
            allCards={allCards}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            filteredIndices={filteredIndices}
            filteredCards={filteredCards}
            onStartStudy={() => setView("study")}
          />
        )}
        {view === "study" && (
          <StudyView
            allCards={allCards}
            filteredIndices={filteredIndices}
            filteredCards={filteredCards}
            categoryName={
              selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name
                : "Wszystkie"
            }
            onBack={() => setView("dashboard")}
          />
        )}
      </div>
    </ToastProvider>
  );
}
