import { useMemo } from "react";

export default function Results({ questions, answers, onRestart, onHome }) {
  const results = useMemo(() => {
    return questions.map((q, qi) => {
      const userSelected = new Set(answers[qi] || []);
      const correctSet = new Set(
        q.options.map((o, i) => (o.is_correct ? i : -1)).filter((i) => i >= 0)
      );

      const isFullyCorrect =
        correctSet.size === userSelected.size &&
        [...correctSet].every((i) => userSelected.has(i));

      const partialCorrect =
        !isFullyCorrect && [...userSelected].some((i) => correctSet.has(i));

      return { question: q, userSelected, correctSet, isFullyCorrect, partialCorrect };
    });
  }, [questions, answers]);

  const fullyCorrect = results.filter((r) => r.isFullyCorrect).length;
  const partial = results.filter((r) => r.partialCorrect).length;
  const wrong = results.filter((r) => !r.isFullyCorrect && !r.partialCorrect).length;
  const total = questions.length;
  const pct = Math.round((fullyCorrect / total) * 100);

  const grade =
    pct >= 90 ? "Doskonale!" : pct >= 70 ? "Bardzo dobrze!" : pct >= 50 ? "Nieźle!" : "Spróbuj ponownie";

  const ringColor =
    pct >= 70 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-red-500";

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className="stroke-slate-100" />
              <circle
                cx="60" cy="60" r="52" fill="none" strokeWidth="10"
                strokeLinecap="round"
                className={`${ringColor} transition-all duration-1000`}
                strokeDasharray={`${(pct / 100) * 327} 327`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-800">{pct}%</span>
            </div>
          </div>

          <div className="text-center sm:text-left space-y-3 flex-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{grade}</h2>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <StatBadge label="Poprawne" value={fullyCorrect} color="bg-emerald-100 text-emerald-700" />
              <StatBadge label="Częściowe" value={partial} color="bg-amber-100 text-amber-700" />
              <StatBadge label="Błędne" value={wrong} color="bg-red-100 text-red-700" />
            </div>
            <p className="text-sm text-slate-400">
              {fullyCorrect} z {total} pytań w pełni poprawnie
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRestart}
          className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold
            hover:bg-primary-dark active:scale-95 transition-all cursor-pointer
            shadow-md shadow-primary/20"
        >
          Spróbuj ponownie ({total} pytań)
        </button>
        <button
          onClick={onHome}
          className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold
            hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
        >
          Strona główna
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-700">Przegląd odpowiedzi</h3>
        {results.map((r, i) => (
          <ReviewCard key={i} index={i} result={r} />
        ))}
      </div>
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
      {value} {label.toLowerCase()}
    </span>
  );
}

function ReviewCard({ index, result }) {
  const { question, userSelected, correctSet, isFullyCorrect, partialCorrect } = result;

  const borderColor = isFullyCorrect
    ? "border-l-emerald-400"
    : partialCorrect
      ? "border-l-amber-400"
      : "border-l-red-400";

  return (
    <div className={`bg-white rounded-xl border border-slate-100 border-l-4 ${borderColor} overflow-hidden`}>
      <div className="px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-start gap-2 mb-3">
          <span
            className={`shrink-0 w-6 h-6 rounded text-xs font-bold flex items-center justify-center
              ${
                isFullyCorrect
                  ? "bg-emerald-100 text-emerald-700"
                  : partialCorrect
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
              }`}
          >
            {index + 1}
          </span>
          <p className="text-sm sm:text-base font-medium text-slate-700 leading-snug">
            {question.question}
          </p>
        </div>

        <div className="space-y-1.5 ml-8">
          {question.options.map((opt, oi) => {
            const wasSelected = userSelected.has(oi);
            const isCorrect = correctSet.has(oi);

            let icon = "";
            let textColor = "text-slate-400";

            if (isCorrect && wasSelected) {
              icon = "✓";
              textColor = "text-emerald-700 font-medium";
            } else if (isCorrect && !wasSelected) {
              icon = "○";
              textColor = "text-emerald-600";
            } else if (!isCorrect && wasSelected) {
              icon = "✗";
              textColor = "text-red-600 font-medium";
            } else {
              icon = "–";
              textColor = "text-slate-400";
            }

            return (
              <div key={oi} className={`flex items-start gap-2 text-sm ${textColor}`}>
                <span className="w-4 shrink-0 text-center">{icon}</span>
                <span className="leading-relaxed">{opt.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
