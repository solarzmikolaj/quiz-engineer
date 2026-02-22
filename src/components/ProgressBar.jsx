export default function ProgressBar({ current, total, answered }) {
  const pct = ((current + 1) / total) * 100;
  const answeredPct = (answered / total) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-slate-400">
        <span>
          Pytanie <strong className="text-slate-600">{current + 1}</strong> z{" "}
          {total}
        </span>
        <span>
          Odpowiedziano:{" "}
          <strong className="text-emerald-600">{answered}</strong> / {total}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
        <div
          className="absolute inset-y-0 left-0 bg-emerald-200 rounded-full transition-all duration-500"
          style={{ width: `${answeredPct}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
