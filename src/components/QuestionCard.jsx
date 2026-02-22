export default function QuestionCard({
  question,
  index,
  total,
  selected,
  confirmed,
  correctSet,
  onToggle,
}) {
  const correctCount = correctSet.size;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <div className="space-y-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800 leading-snug">
              {question.question}
            </h2>
            <p className="text-xs text-slate-400">
              Pytanie {index + 1} z {total} &middot; Poprawnych
              odpowiedzi: {correctCount}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-2.5">
        {question.options.map((opt, i) => {
          const isSelected = selected.has(i);
          const isCorrect = correctSet.has(i);

          let style =
            "bg-white border-slate-200 hover:border-primary/50 hover:bg-primary/[0.02]";

          if (confirmed) {
            if (isCorrect && isSelected) {
              style = "bg-correct-light border-correct ring-1 ring-correct/30";
            } else if (isCorrect && !isSelected) {
              style = "bg-correct-light/50 border-correct/50";
            } else if (!isCorrect && isSelected) {
              style = "bg-wrong-light border-wrong ring-1 ring-wrong/30";
            } else {
              style = "bg-white border-slate-100 opacity-60";
            }
          } else if (isSelected) {
            style = "bg-primary/5 border-primary ring-1 ring-primary/30";
          }

          return (
            <button
              key={i}
              onClick={() => onToggle(i)}
              disabled={confirmed}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all
                flex items-start gap-3 cursor-pointer disabled:cursor-default ${style}`}
            >
              <span
                className={`shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-all
                  ${
                    confirmed
                      ? isCorrect
                        ? "bg-correct border-correct text-white"
                        : isSelected
                          ? "bg-wrong border-wrong text-white"
                          : "border-slate-300"
                      : isSelected
                        ? "bg-primary border-primary text-white"
                        : "border-slate-300"
                  }`}
              >
                {(confirmed && isCorrect) || (!confirmed && isSelected) ? (
                  <CheckIcon />
                ) : confirmed && isSelected && !isCorrect ? (
                  <XIcon />
                ) : null}
              </span>
              <span className="text-sm sm:text-base leading-relaxed">
                {opt.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
