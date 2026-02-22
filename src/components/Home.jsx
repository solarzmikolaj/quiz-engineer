import { useState } from "react";

const PRESETS = [5, 10, 15];

export default function Home({ totalQuestions, onStart }) {
  const [custom, setCustom] = useState("");

  const handleCustom = () => {
    const n = parseInt(custom, 10);
    if (n > 0 && n <= totalQuestions) onStart(n);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-fade-in">
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight">
          Quiz Engineer
        </h1>
        <p className="text-slate-500 text-lg max-w-md mx-auto">
          Sprawdź swoją wiedzę z zakresu baz danych. Wybierz liczbę pytań
          i&nbsp;rozpocznij quiz.
        </p>
        <p className="text-sm text-slate-400">
          Dostępnych pytań: <strong className="text-primary">{totalQuestions}</strong>
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {PRESETS.map((n) => (
            <button
              key={n}
              disabled={n > totalQuestions}
              onClick={() => onStart(n)}
              className="py-3 rounded-xl bg-primary text-white font-semibold text-lg
                hover:bg-primary-dark active:scale-95 transition-all
                disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-primary/20"
            >
              {n} pytań
            </button>
          ))}
        </div>

        <div className="relative flex items-center gap-2">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 uppercase tracking-widest">lub</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={totalQuestions}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustom()}
            placeholder={`1 – ${totalQuestions}`}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white
              focus:outline-none focus:ring-2 focus:ring-primary/40 text-center text-lg
              placeholder:text-slate-300"
          />
          <button
            onClick={handleCustom}
            className="px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold
              hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            Start
          </button>
        </div>

        <button
          onClick={() => onStart(totalQuestions)}
          className="w-full py-3 rounded-xl border-2 border-primary text-primary font-semibold
            hover:bg-primary hover:text-white active:scale-95 transition-all cursor-pointer"
        >
          Wszystkie pytania ({totalQuestions})
        </button>
      </div>
    </div>
  );
}
