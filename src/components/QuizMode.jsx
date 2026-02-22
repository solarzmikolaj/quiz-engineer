import { useState, useMemo } from "react";
import { vibrate, vibrateSuccess, vibrateError } from "../lib/haptics";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizMode({ allCards, onComplete }) {
  const quiz = useMemo(() => {
    const shuffled = shuffleArray(allCards);
    const correct = shuffled[0];
    const wrongs = shuffled.slice(1, 4);
    const options = shuffleArray([
      { text: correct.back, isCorrect: true },
      ...wrongs.map((c) => ({ text: c.back, isCorrect: false })),
    ]);
    return { question: correct.front, options };
  }, [allCards]);

  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);

    const isCorrect = quiz.options[idx].isCorrect;
    if (isCorrect) vibrateSuccess();
    else vibrateError();

    setTimeout(() => onComplete(isCorrect), 1200);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-neon/20 text-neon-bright text-xs font-bold uppercase tracking-widest">
            Szybki Quiz
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white/90 leading-relaxed">
            {quiz.question}
          </h2>
          <p className="text-sm text-white/30">Wybierz poprawną odpowiedź</p>
        </div>

        <div className="w-full max-w-lg space-y-3">
          {quiz.options.map((opt, i) => {
            let style = "glass-light hover:border-neon/40";

            if (answered) {
              if (opt.isCorrect) {
                style = "bg-correct/20 border-correct/60";
              } else if (i === selected) {
                style = "bg-wrong/20 border-wrong/60";
              } else {
                style = "glass-light opacity-40";
              }
            } else if (i === selected) {
              style = "glass border-neon/60";
            }

            const label = String.fromCharCode(65 + i);

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={answered}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all
                  flex items-start gap-3 cursor-pointer disabled:cursor-default ${style}`}
              >
                <span className="shrink-0 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold text-neon-bright">
                  {label}
                </span>
                <span className="text-sm sm:text-base leading-relaxed text-white/80">
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
