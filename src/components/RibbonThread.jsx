import { useEffect, useRef, useState } from "react";
import { animate, onScroll, svg } from "animejs";

// Builds the path from where things actually are, so it fits any screen. It starts where the hero ends,
// waves down the left margin (content never sits there), and only crosses the page once, in the open
// space of the Stay section, to curl in to the Book button. Coordinates are relative to the svg.
function buildPath(main) {
  const box = main.getBoundingClientRect();
  const W = main.clientWidth;
  const first = document.getElementById("details");
  const book = document.querySelector("[data-book]");
  if (!first || !book) return null;

  const start = first.getBoundingClientRect().top - box.top;
  const b = book.getBoundingClientRect();
  const end = { x: b.left - box.left - 14, y: b.top - box.top + b.height / 2 - start };

  const g = W < 768 ? 10 : Math.round(W * 0.035); // the margin the ribbon lives in
  const sway = W < 768 ? 5 : 18;
  let y = 160;
  let d = `M${W / 2} 0 C${W / 2} 90 ${g} 60 ${g} ${y}`; // out of the room, into the margin

  // equal bows of roughly 640px that alternate sides, so it reads as a ribbon, not a rule
  const stop = end.y - 260;
  const bows = Math.max(1, Math.round((stop - y) / 640));
  const step = (stop - y) / bows;
  for (let i = 0; i < bows; i++) {
    const bow = i % 2 ? -sway : sway;
    d += ` C${g + bow} ${y + step / 3} ${g + bow} ${y + (2 * step) / 3} ${g} ${y + step}`;
    y += step;
  }
  // the one crossing: a long, low sweep to the button
  d += ` C${g} ${end.y - 60} ${end.x - 220} ${end.y + 10} ${end.x} ${end.y}`;

  return { d, start, height: end.y + 40, width: W };
}

// One maple ribbon (with a thin cerulean twin, like the brand book's swooshes) that draws itself
// down the page as you read, from the room to the Book button.
export default function RibbonThread() {
  const ref = useRef(null);
  const [geo, setGeo] = useState(null);

  useEffect(() => {
    const main = ref.current.parentElement;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setGeo(buildPath(main)));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(main);
    measure();
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!geo || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const anim = animate(svg.createDrawable(ref.current.querySelectorAll("path")), {
      draw: ["0 0", "0 1"],
      ease: "linear",
      // the drawing tip stays near the middle of the screen as you scroll
      autoplay: onScroll({
        target: ref.current,
        enter: { target: "top", container: "center" },
        leave: { target: "bottom", container: "bottom" }, // done as the Book button comes into view
        sync: 0.4,
      }),
    });
    return () => anim.revert();
  }, [geo]);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 z-20"
      style={geo ? { top: geo.start, width: geo.width, height: geo.height } : { display: "none" }}
      viewBox={geo ? `0 0 ${geo.width} ${geo.height}` : undefined}
      fill="none"
    >
      {geo && (
        <>
          <path d={geo.d} stroke="var(--color-cerulean)" strokeOpacity="0.35" strokeWidth="1" transform="translate(7 9)" />
          <path d={geo.d} stroke="var(--color-maple)" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
