import { useEffect, useRef, useState } from "react";
import { svg, utils } from "animejs";

// Builds the path from where things actually are, so it fits any screen. It starts where the hero
// ends and waves down the left margin, then:
//   1. sweeps left to right just above the Details photos (they develop as the light passes),
//   2. waves down the right margin and sweeps back under the "A warm greeting." heading,
//   3. waves down the left margin and curls in to the Book button.
// It reports the points where it touches something (`touches`), so they can react.
// Coordinates are relative to the svg, which starts at the top of #about.
function buildPath(main) {
  const box = main.getBoundingClientRect();
  const W = main.clientWidth;
  const first = document.getElementById("about");
  const book = document.querySelector("[data-book]");
  const gridEl = document.querySelector("[data-ribbon-sweep]");
  const headEl = document.querySelector("[data-ribbon-touch]");
  if (!first || !book || !gridEl || !headEl) return null;

  const start = first.getBoundingClientRect().top - box.top;
  const at = (el) => {
    const r = el.getBoundingClientRect();
    return { left: r.left - box.left, right: r.right - box.left, top: r.top - box.top - start, bottom: r.bottom - box.top - start };
  };
  const grid = at(gridEl);
  const head = at(headEl);
  const b = at(book);

  const g = W < 768 ? 10 : Math.round(W * 0.035); // the margins the ribbon lives in
  const sway = W < 768 ? 5 : 18;
  const L = g;
  const R = W - g;
  let x = L;
  let y = 160;
  let d = `M${W / 2} 0 C${W / 2} 90 ${L} 60 ${L} ${y}`; // out of the room, into the left margin

  // equal gentle bows down the current margin, alternating sides, so it reads as a ribbon
  const run = (toY) => {
    if (toY <= y) return;
    const bows = Math.max(1, Math.round((toY - y) / 640));
    const step = (toY - y) / bows;
    for (let i = 0; i < bows; i++) {
      const bow = i % 2 ? -sway : sway;
      d += ` C${x + bow} ${y + step / 3} ${x + bow} ${y + (2 * step) / 3} ${x} ${y + step}`;
      y += step;
    }
  };
  // a level sweep across the page at `sy`, over the span a..b, from this margin to the other one
  const cross = (sy, a, z) => {
    const to = x === L ? R : L;
    const s = Math.sign(to - x);
    run(sy - 150);
    d += ` C${x} ${sy - 60} ${a - s * 120} ${sy} ${a} ${sy}`;
    d += ` L${z} ${sy}`;
    d += ` C${z + s * 120} ${sy} ${to} ${sy + 60} ${to} ${sy + 150}`;
    x = to;
    y = sy + 150;
  };

  // 1. just above the details photos, left to right
  const gy = grid.top - 28;
  cross(gy, Math.max(L + 30, grid.left - 20), Math.min(R - 30, grid.right + 20));
  // 2. under the greeting heading, right to left
  const uy = head.bottom + 10;
  cross(uy, Math.min(R - 30, head.right + 20), Math.max(L + 30, head.left - 20));
  // 3. down the left margin, then one long, low sweep in to the Book button
  const end = { x: b.left - 14, y: (b.top + b.bottom) / 2 };
  run(end.y - 260);
  d += ` C${L} ${end.y - 60} ${end.x - 220} ${end.y + 10} ${end.x} ${end.y}`;

  return {
    d,
    start,
    height: end.y + 40,
    width: W,
    touches: [
      { el: gridEl, x: grid.left, y: gy },
      { el: headEl, x: head.right, y: uy },
    ],
  };
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
    const drawables = svg.createDrawable(ref.current.querySelectorAll("path"));
    let burst = false;
    // one walk along the line: how far down it has reached at each length (the sideways sweeps add
    // length without depth), and the length at which it passes closest to each touch point
    const STEP = 4;
    const depth = [];
    const touches = geo.touches.map(({ el }) => ({ el, len: 0, best: Infinity, fired: false }));
    for (let l = 0, deepest = 0; l <= length; l += STEP) {
      const p = line.getPointAtLength(l);
      depth.push((deepest = Math.max(deepest, p.y)));
      geo.touches.forEach(({ x, y }, i) => {
        const dd = (p.x - x) ** 2 + (p.y - y) ** 2;
        if (dd < touches[i].best) Object.assign(touches[i], { len: l, best: dd });
      });
    }
    let shown = 0; // drawn fraction on screen, eased toward the scroll position
    let raf = 0;

    // the tip follows a line across the screen, from its live position (not cached offsets, which go
    // stale as reveals and the 3D section settle). The line sits mid-screen, and slides to the bottom
    // over the last screen of the page so the ribbon can still reach the Book button.
    const target = () => {
      const r = ref.current.getBoundingClientRect();
      const left = document.documentElement.scrollHeight - innerHeight - scrollY;
      const probe = innerHeight * (1 - 0.5 * Math.min(1, left / innerHeight)) - r.top;
      let lo = 0;
      let hi = depth.length - 1;
      if (probe >= depth[hi]) return 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (depth[mid] < probe) lo = mid + 1;
        else hi = mid;
      }
      return (lo * STEP) / length;
    };

    const frame = () => {
      const goal = target();
      shown += (goal - shown) * 0.18;
      if (Math.abs(goal - shown) < 0.0004) shown = goal;
      utils.set(drawables, { draw: `0 ${shown}` });

      const pt = line.getPointAtLength(shown * length);
      const box = ref.current.getBoundingClientRect();
      const x = box.left + pt.x;
      const y = box.top + pt.y + scrollY;
      sparks.move(x, y, shown > 0.002 && shown < 0.998);
      // the ribbon reaches the details photos / the greeting: let them react (once), with a burst of sparks
      for (const t of touches) {
        if (!t.fired && shown * length >= t.len) {
          t.fired = true;
          t.el.dispatchEvent(new CustomEvent("ribbon:touch"));
          sparks.burst(x, y);
        }
      }
      // the ribbon arrives at Book your stay: one burst, re-armed if you scroll back up
      if (shown >= 0.998 && !burst) {
        burst = true;
        sparks.burst(x, y);
      } else if (shown < 0.95) burst = false;

      raf = shown === goal ? 0 : requestAnimationFrame(frame);
    };
    const wake = () => raf || (raf = requestAnimationFrame(frame));
    document.documentElement.dataset.ribbon = "on"; // touch points wait for the ribbon (lib/ribbon-touch.js)
    addEventListener("scroll", wake, { passive: true });
    addEventListener("resize", wake);
    shown = target(); // start where the page already is (e.g. after a reload mid-page)
    wake();

    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", wake);
      removeEventListener("resize", wake);
      utils.set(drawables, { draw: "0 1" });
      delete document.documentElement.dataset.ribbon;
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
