import { useEffect, useRef, useState } from "react";
import { animate, onScroll, svg } from "animejs";

// Builds the path from where things actually are, so it fits any screen. It starts where the hero ends,
// waves down the left margin (content never sits there), and only crosses the page once, in the open
// space of the Stay section, to curl in to the Book button. Coordinates are relative to the svg.
function buildPath(main) {
  const box = main.getBoundingClientRect();
  const W = main.clientWidth;
  const first = document.getElementById("about");
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

// Sparks shed by the glowing tip, drawn on one small screen-sized canvas (cheap, unlike a blur
// filter over a 9,000px line). Positions are kept in page coordinates so sparks scroll with the page.
function createSparks(canvas) {
  const ctx = canvas.getContext("2d");
  const sparks = [];
  const tip = { x: 0, y: 0, on: false, moved: 0 };
  let raf = 0;
  let last = performance.now();

  const size = () => {
    const dpr = Math.min(devicePixelRatio, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener("resize", size);

  const spawn = (n, x, y, speed) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = (0.2 + Math.random()) * speed;
      sparks.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 0.25, // a slight rise, like embers
        life: 0,
        max: 900 + Math.random() * 900,
        r: 0.6 + Math.random() * 1.6,
        warm: Math.random() < 0.7, // mostly maple, some near-white
      });
    }
  };

  const frame = (now) => {
    const dt = Math.min(now - last, 50);
    last = now;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const sy = scrollY;

    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.life += dt;
      if (p.life > p.max) { sparks.splice(i, 1); continue; }
      p.x += p.vx * dt * 0.06;
      p.y += p.vy * dt * 0.06;
      p.vx *= 0.985;
      p.vy *= 0.985;
      const fade = 1 - p.life / p.max;
      ctx.globalAlpha = fade * 0.9;
      ctx.fillStyle = p.warm ? "#d9b77f" : "#fff6e6";
      ctx.beginPath();
      ctx.arc(p.x, p.y - sy, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // the comet head: a soft glow that brightens while the ribbon is being drawn
    if (tip.on) {
      const moving = Math.max(0, 1 - (now - tip.moved) / 900);
      const r = 16 + moving * 10;
      const g = ctx.createRadialGradient(tip.x, tip.y - sy, 0, tip.x, tip.y - sy, r);
      g.addColorStop(0, `rgba(255, 236, 200, ${0.55 + moving * 0.4})`);
      g.addColorStop(0.35, `rgba(217, 183, 127, ${0.35 + moving * 0.3})`);
      g.addColorStop(1, "rgba(177, 143, 89, 0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y - sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // keep running while anything is alive or the tip moved recently; otherwise rest
    raf = sparks.length || now - tip.moved < 1200 ? requestAnimationFrame(frame) : 0;
  };
  const wake = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  return {
    // called by the ribbon's scroll animation with the tip's page position
    move(x, y, on) {
      const dist = Math.hypot(x - tip.x, y - tip.y);
      if (on && dist > 0.5) {
        spawn(Math.min(4, 1 + Math.floor(dist / 6)), x, y, 0.6);
        tip.moved = performance.now();
      }
      Object.assign(tip, { x, y, on });
      wake();
    },
    burst(x, y) {
      spawn(innerWidth < 768 ? 22 : 40, x, y, 2.2);
      wake();
    },
    destroy() {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
    },
  };
}

// One maple ribbon (with a thin cerulean twin, like the brand book's swooshes) that draws itself
// down the page as you read, from the room to the Book button. It glows, and its tip sheds sparks.
export default function RibbonThread() {
  const ref = useRef(null);
  const canvas = useRef(null);
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
    const line = ref.current.querySelector(".line");
    const length = line.getTotalLength();
    const sparks = createSparks(canvas.current);
    let burst = false;

    const anim = animate(svg.createDrawable(ref.current.querySelectorAll("path")), {
      draw: ["0 0", "0 1"],
      ease: "linear",
      // the drawing tip stays near the middle of the screen as you scroll
      autoplay: onScroll({
        target: ref.current,
        enter: { target: "top", container: "center" },
        leave: { target: "bottom", container: "bottom" }, // done as the Book button comes into view
        sync: 0.85, // anime: higher = tighter; per frame it moves lerp(0.01, 0.2, sync) of the way
      }),
      onUpdate: (self) => {
        const p = self.progress;
        const pt = line.getPointAtLength(p * length);
        const box = ref.current.getBoundingClientRect();
        const x = box.left + pt.x;
        const y = box.top + pt.y + scrollY;
        sparks.move(x, y, p > 0.002 && p < 0.998);
        // the ribbon arrives at Book your stay: one burst, re-armed if you scroll back up
        if (p >= 0.998 && !burst) {
          burst = true;
          sparks.burst(x, y);
        } else if (p < 0.95) burst = false;
      },
    });
    return () => {
      anim.revert();
      sparks.destroy();
    };
  }, [geo]);

  return (
    <>
      <svg
        ref={ref}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 z-0 overflow-visible"
        style={geo ? { top: geo.start, width: geo.width, height: geo.height } : { display: "none" }}
        viewBox={geo ? `0 0 ${geo.width} ${geo.height}` : undefined}
        fill="none"
      >
        <defs>
          <filter id="ribbon-glow" x="-50%" y="-1%" width="200%" height="102%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        {geo && (
          <>
            {/* halo: a wide, softly blurred stroke under the line */}
            <path d={geo.d} stroke="#d9b77f" strokeOpacity="0.55" strokeWidth="7" strokeLinecap="round" filter="url(#ribbon-glow)" />
            <path d={geo.d} stroke="var(--color-cerulean)" strokeOpacity="0.35" strokeWidth="1" transform="translate(7 9)" />
            <path className="line" d={geo.d} stroke="var(--color-maple)" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
      </svg>
      {/* sparks and the glowing tip; fixed to the screen, behind photos like the ribbon */}
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full motion-reduce:hidden" />
    </>
  );
}
