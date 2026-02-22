import { useState, useEffect, useRef, useCallback } from "react";
import useSwipe from "../hooks/useSwipe";

export default function FlashCard({
  card,
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
  flyDirection,
}) {
  const [flipped, setFlipped] = useState(false);
  const [overlayState, setOverlayState] = useState({ right: 0, left: 0, up: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    setFlipped(false);
    setOverlayState({ right: 0, left: 0, up: 0 });
  }, [card]);

  const { bindSwipe, elRef } = useSwipe({
    onSwipeRight,
    onSwipeLeft,
    onSwipeUp,
    enabled: !flyDirection,
  });

  const cardRef = useCallback(
    (node) => {
      if (!node) return;
      const cleanup = bindSwipe(node);

      const handleSwipeMove = (e) => {
        const { rightPct, leftPct, upPct } = e.detail;
        setOverlayState({ right: rightPct, left: leftPct, up: upPct });
      };

      node.addEventListener("swipemove", handleSwipeMove);
      return () => {
        cleanup?.();
        node.removeEventListener("swipemove", handleSwipeMove);
      };
    },
    [bindSwipe]
  );

  const handleFlip = (e) => {
    if (flyDirection) return;
    const el = elRef.current;
    if (el) {
      const right = parseFloat(el.dataset.swipeRight || 0);
      const left = parseFloat(el.dataset.swipeLeft || 0);
      const up = parseFloat(el.dataset.swipeUp || 0);
      if (right > 0.1 || left > 0.1 || up > 0.1) return;
    }
    setFlipped((f) => !f);
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const flyClass = flyDirection === "right"
    ? "fly-right"
    : flyDirection === "left"
      ? "fly-left"
      : flyDirection === "up"
        ? "fly-up"
        : "";

  const glowClass = overlayState.right > 0.5
    ? "neon-glow-green"
    : overlayState.left > 0.5
      ? "neon-glow-red"
      : overlayState.up > 0.5
        ? "neon-glow-blue"
        : "neon-shadow";

  return (
    <div ref={containerRef} className="relative w-full" style={{ aspectRatio: "3/4", maxHeight: "65vh" }}>
      <div
        ref={cardRef}
        onClick={handleFlip}
        className={`absolute inset-0 cursor-pointer touch-none ${flyClass}`}
        style={{ willChange: "transform" }}
      >
        <div className={`card-perspective w-full h-full ${glowClass} rounded-2xl transition-shadow duration-300`}>
          <div className={`card-inner w-full h-full ${flipped ? "flipped" : ""}`}>
            {/* Front */}
            <div className="card-face absolute inset-0 glass rounded-2xl flex flex-col items-center justify-center p-6 sm:p-8">
              <SwipeOverlays overlayState={overlayState} />
              <span className="text-xs uppercase tracking-widest text-neon/50 mb-4">Pytanie</span>
              <h2 className="text-xl sm:text-2xl font-bold text-center leading-relaxed text-white/90">
                {card.front}
              </h2>
              <span className="absolute bottom-4 text-xs text-white/20">tapnij aby obrócić</span>
            </div>

            {/* Back */}
            <div className="card-face card-back absolute inset-0 glass rounded-2xl flex flex-col items-center justify-center p-6 sm:p-8">
              <SwipeOverlays overlayState={overlayState} />
              <span className="text-xs uppercase tracking-widest text-neon-bright/50 mb-4">Odpowiedź</span>
              <p className="text-base sm:text-lg text-center leading-relaxed text-white/80">
                {card.back}
              </p>
              <span className="absolute bottom-4 text-xs text-white/20">tapnij aby obrócić</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SwipeOverlays({ overlayState }) {
  return (
    <>
      {overlayState.right > 0.15 && (
        <div
          className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 pointer-events-none"
          style={{
            background: `rgba(52, 211, 153, ${overlayState.right * 0.25})`,
            border: `2px solid rgba(52, 211, 153, ${overlayState.right * 0.6})`,
            borderRadius: "1rem",
          }}
        >
          <span
            className="text-5xl font-black text-correct"
            style={{ opacity: overlayState.right }}
          >
            ZNAM
          </span>
        </div>
      )}
      {overlayState.left > 0.15 && (
        <div
          className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 pointer-events-none"
          style={{
            background: `rgba(248, 113, 113, ${overlayState.left * 0.25})`,
            border: `2px solid rgba(248, 113, 113, ${overlayState.left * 0.6})`,
            borderRadius: "1rem",
          }}
        >
          <span
            className="text-5xl font-black text-wrong"
            style={{ opacity: overlayState.left }}
          >
            NIE
          </span>
        </div>
      )}
      {overlayState.up > 0.15 && (
        <div
          className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 pointer-events-none"
          style={{
            background: `rgba(96, 165, 250, ${overlayState.up * 0.25})`,
            border: `2px solid rgba(96, 165, 250, ${overlayState.up * 0.6})`,
            borderRadius: "1rem",
          }}
        >
          <span
            className="text-5xl font-black text-archive"
            style={{ opacity: overlayState.up }}
          >
            ŁATWE
          </span>
        </div>
      )}
    </>
  );
}
