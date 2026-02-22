import { useRef, useCallback } from "react";

const THRESHOLD_X = 100;
const THRESHOLD_Y = -80;
const MAX_ROTATION = 15;

export default function useSwipe({ onSwipeRight, onSwipeLeft, onSwipeUp, enabled = true }) {
  const stateRef = useRef({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    dragging: false,
  });
  const elRef = useRef(null);

  const getCoords = (e) => {
    if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  };

  const updateVisual = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    const s = stateRef.current;
    const dx = s.currentX - s.startX;
    const dy = s.currentY - s.startY;
    const rotation = (dx / window.innerWidth) * MAX_ROTATION;

    el.style.transition = "none";
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`;

    const rightPct = Math.min(Math.max(dx / THRESHOLD_X, 0), 1);
    const leftPct = Math.min(Math.max(-dx / THRESHOLD_X, 0), 1);
    const upPct = Math.min(Math.max(-dy / -THRESHOLD_Y, 0), 1);

    el.dataset.swipeRight = rightPct.toFixed(2);
    el.dataset.swipeLeft = leftPct.toFixed(2);
    el.dataset.swipeUp = upPct.toFixed(2);

    el.dispatchEvent(new CustomEvent("swipemove", { detail: { dx, dy, rightPct, leftPct, upPct } }));
  }, []);

  const resetVisual = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    el.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
    el.style.transform = "translate(0, 0) rotate(0deg)";
    el.dataset.swipeRight = "0";
    el.dataset.swipeLeft = "0";
    el.dataset.swipeUp = "0";
  }, []);

  const handleStart = useCallback(
    (e) => {
      if (!enabled) return;
      const { x, y } = getCoords(e);
      stateRef.current = { startX: x, startY: y, currentX: x, currentY: y, dragging: true };
    },
    [enabled]
  );

  const handleMove = useCallback(
    (e) => {
      if (!stateRef.current.dragging || !enabled) return;
      e.preventDefault();
      const { x, y } = getCoords(e);
      stateRef.current.currentX = x;
      stateRef.current.currentY = y;
      updateVisual();
    },
    [enabled, updateVisual]
  );

  const handleEnd = useCallback(() => {
    if (!stateRef.current.dragging) return;
    stateRef.current.dragging = false;
    const s = stateRef.current;
    const dx = s.currentX - s.startX;
    const dy = s.currentY - s.startY;

    if (dx > THRESHOLD_X) {
      onSwipeRight?.();
    } else if (dx < -THRESHOLD_X) {
      onSwipeLeft?.();
    } else if (dy < THRESHOLD_Y) {
      onSwipeUp?.();
    } else {
      resetVisual();
    }
  }, [onSwipeRight, onSwipeLeft, onSwipeUp, resetVisual]);

  const bindSwipe = useCallback(
    (el) => {
      elRef.current = el;
      if (!el) return;

      el.addEventListener("touchstart", handleStart, { passive: true });
      el.addEventListener("touchmove", handleMove, { passive: false });
      el.addEventListener("touchend", handleEnd);
      el.addEventListener("mousedown", handleStart);
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);

      return () => {
        el.removeEventListener("touchstart", handleStart);
        el.removeEventListener("touchmove", handleMove);
        el.removeEventListener("touchend", handleEnd);
        el.removeEventListener("mousedown", handleStart);
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleEnd);
      };
    },
    [handleStart, handleMove, handleEnd]
  );

  return { bindSwipe, elRef };
}
