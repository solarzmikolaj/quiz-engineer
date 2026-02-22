import { useMemo } from "react";

export default function Heatmap({ history }) {
  const { weeks, maxReviewed } = useMemo(() => {
    const today = new Date();
    const cells = [];

    for (let d = 0; d < 91; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (90 - d));
      const key = date.toISOString().slice(0, 10);
      const day = history[key];
      cells.push({
        key,
        date,
        reviewed: day?.reviewed || 0,
        dayOfWeek: date.getDay(),
      });
    }

    const max = Math.max(1, ...cells.map((c) => c.reviewed));

    const weeks = [];
    let currentWeek = [];
    for (const cell of cells) {
      if (cell.dayOfWeek === 1 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(cell);
    }
    if (currentWeek.length) weeks.push(currentWeek);

    return { weeks, maxReviewed: max };
  }, [history]);

  const getColor = (reviewed) => {
    if (reviewed === 0) return "bg-white/[0.03]";
    const intensity = reviewed / maxReviewed;
    if (intensity < 0.25) return "bg-neon/20";
    if (intensity < 0.5) return "bg-neon/40";
    if (intensity < 0.75) return "bg-neon/60";
    return "bg-neon/80";
  };

  return (
    <div className="overflow-x-auto pb-2 -mx-2 px-2">
      <div className="flex gap-[3px] min-w-fit">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell) => (
              <div
                key={cell.key}
                title={`${cell.key}: ${cell.reviewed} fiszek`}
                className={`w-3 h-3 rounded-sm ${getColor(cell.reviewed)} transition-colors`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
