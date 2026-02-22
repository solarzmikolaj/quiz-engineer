import { useState, useMemo } from "react";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";

export default function Quiz({ questions, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(() => questions.map(() => new Set()));
  const [confirmed, setConfirmed] = useState(() => questions.map(() => false));

  const question = questions[current];
  const selected = answers[current];
  const isConfirmed = confirmed[current];

  const correctSet = useMemo(
    () =>
      new Set(
        question.options
          .map((o, i) => (o.is_correct ? i : -1))
          .filter((i) => i >= 0)
      ),
    [question]
  );

  const toggle = (idx) => {
    if (isConfirmed) return;
    setAnswers((prev) => {
      const copy = [...prev];
      const s = new Set(copy[current]);
      s.has(idx) ? s.delete(idx) : s.add(idx);
      copy[current] = s;
      return copy;
    });
  };

  const confirm = () => {
    setConfirmed((prev) => {
      const copy = [...prev];
      copy[current] = true;
      return copy;
    });
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    }
  };

  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const finish = () => {
    onFinish(
      answers.map((set) => [...set])
    );
  };

  const answeredCount = confirmed.filter(Boolean).length;
  const isLast = current === questions.length - 1;
  const allConfirmed = confirmed.every(Boolean);

  return (
    <div className="space-y-6 animate-fade-in">
      <ProgressBar
        current={current}
        total={questions.length}
        answered={answeredCount}
      />

      <QuestionCard
        question={question}
        index={current}
        total={questions.length}
        selected={selected}
        confirmed={isConfirmed}
        correctSet={correctSet}
        onToggle={toggle}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          onClick={prev}
          disabled={current === 0}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium
            hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-30
            disabled:cursor-not-allowed cursor-pointer order-2 sm:order-1"
        >
          Poprzednie
        </button>

        <div className="flex-1 order-1 sm:order-2">
          {!isConfirmed ? (
            <button
              onClick={confirm}
              disabled={selected.size === 0}
              className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold
                hover:bg-primary-dark active:scale-95 transition-all
                disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
                shadow-md shadow-primary/20"
            >
              Sprawdź odpowiedź
            </button>
          ) : isLast ? (
            <button
              onClick={finish}
              disabled={!allConfirmed}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-semibold
                hover:bg-emerald-600 active:scale-95 transition-all cursor-pointer
                disabled:opacity-40 disabled:cursor-not-allowed
                shadow-md shadow-emerald-500/20"
            >
              {allConfirmed
                ? "Zakończ quiz"
                : `Odpowiedz na wszystkie (${answeredCount}/${questions.length})`}
            </button>
          ) : (
            <button
              onClick={next}
              className="w-full py-2.5 rounded-xl bg-primary text-white font-semibold
                hover:bg-primary-dark active:scale-95 transition-all cursor-pointer
                shadow-md shadow-primary/20"
            >
              Następne pytanie
            </button>
          )}
        </div>

        <button
          onClick={next}
          disabled={isLast}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium
            hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-30
            disabled:cursor-not-allowed cursor-pointer order-3"
        >
          Następne
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 justify-center pt-2">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer
              ${
                i === current
                  ? "bg-primary text-white scale-110 shadow-md shadow-primary/30"
                  : confirmed[i]
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-white text-slate-400 border border-slate-200 hover:border-primary/40"
              }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
