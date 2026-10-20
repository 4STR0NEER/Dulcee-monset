import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Smooth, weighted scrolling for the whole page, plus the hero glide: one nudge inside the opening
// fly-through carries you smoothly through it (or back to the start). Off for reduced motion.
export let lenis = null;
let auto = false; // true while we are scrolling for the reader (glide or a header jump)

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// where the hero's pinned fly-through ends
const heroEnd = () => {
  const room = document.getElementById("room");
  return room ? room.offsetTop + room.offsetHeight - innerHeight : 0;
};

// scroll for the reader to an element or a y position; used by the header too
export function scrollToTarget(target, duration = 1.6) {
  if (!lenis) {
    if (typeof target === "number") scrollTo({ top: target });
    else target?.scrollIntoView();
    return;
  }
  auto = true;
  lenis.scrollTo(target, { duration, easing: easeInOut, lock: true, onComplete: () => (auto = false) });
}

export function initSmooth() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  lenis = new Lenis({ autoRaf: true, lerp: 0.09 });

  lenis.on("scroll", ({ scroll, direction }) => {
    if (auto) return;
    const end = heroEnd();
    if (scroll <= 2 || scroll >= end - 40) return; // only inside the fly-through
    // the reader nudged: take over and glide to the far end of the hero in that direction
    scrollToTarget(direction === 1 ? end : 0, direction === 1 ? 3.6 : 2.2);
  });

  return () => {
    lenis.destroy();
    lenis = null;
    auto = false;
  };
}
