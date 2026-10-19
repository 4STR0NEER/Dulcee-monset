import { useEffect, useId, useRef, useState } from "react";
import { animate, createTimeline, onScroll, stagger } from "animejs";
import { photo } from "@/lib/photo";

const WORD = "DULCEÉ";
const FS = 200; // font size in svg units; the word is centred on 0,0 (baseline)
const FONT = '"Source Sans 3 Variable", "Myriad Pro", sans-serif';
const DIVE = 2; // fly through the stem of the L
const LINE = FS * 0.95; // line height when the name stacks as DUL / CEÉ on narrow screens

// letters as tspans; on narrow screens "C" starts a second line (x=0 restarts the centred chunk)
const word = (narrow, props = {}) =>
  [...WORD].map((ch, i) => (
    <tspan key={i} {...props} {...(narrow && i === 3 ? { x: 0, dy: LINE } : {})}>
      {ch}
    </tspan>
  ));

function useNarrow() {
  const query = "(max-width: 640px)";
  const [narrow, setNarrow] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return narrow;
}

// Where to fly to: the middle of the L's stem, found by drawing the letter on a canvas and scanning
// for ink. Exact for whatever font actually loaded, so the camera never clips an edge of the letter.
function stemTarget(text) {
  const c = document.createElement("canvas");
  c.width = c.height = FS * 2;
  const ctx = c.getContext("2d");
  ctx.font = `700 ${FS}px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("L", FS * 0.5, FS * 1.5);
  const cap = ctx.measureText("L").actualBoundingBoxAscent;
  const row = Math.round(FS * 1.5 - cap * 0.55);
  const px = ctx.getImageData(0, row, c.width, 1).data;
  let x0 = -1, x1 = -1;
  for (let x = 0; x < c.width; x++) {
    if (px[x * 4 + 3] > 128) { if (x0 < 0) x0 = x; x1 = x; }
    else if (x0 >= 0) break; // end of the stem
  }
  const stem = x1 - x0;
  const origin = text.getStartPositionOfChar(DIVE);
  const cx = origin.x + (x0 + x1) / 2 - FS * 0.5;
  const cy = origin.y - cap * 0.55;
  const s = stem * 0.5; // a square half the stem wide: fully inside the letter at any screen shape
  return `${cx - s / 2} ${cy - s / 2} ${s} ${s}`;
}

// Linear easing makes a zoom crawl then lunge. A camera zoom feels steady when the scale grows
// geometrically, so map progress onto width(t) = from * (to/from)^t.
function zoomEase(from, to) {
  const r = Number(to.split(" ")[2]) / Number(from.split(" ")[2]);
  return (t) => (1 - r ** t) / (1 - r);
}

// 01 The room. The name, cut out of cerulean, with the room showing through its letters.
// Scrolling flies the camera into the L until the room fills the screen, then keeps pulling back.
export default function Room({ loaded }) {
  const root = useRef(null);
  const mask = useId();
  const narrow = useNarrow();
  const below = narrow ? LINE + FS * 0.42 : FS * 0.42; // where the caption sits under the name

  // scroll: fly through the name, then the pull-back and the headline
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tl;
    let gone = false;
    document.fonts.ready.then(() => {
      if (gone) return;
      const svg = root.current.querySelector(".name");
      const word = svg.querySelector(".word");
      const b = svg.querySelector(".frame").getBBox();
      const pad = 40;
      const from = `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`;
      const to = stemTarget(word);
      svg.setAttribute("viewBox", from);
      tl = createTimeline({
        defaults: { ease: "linear" },
        autoplay: onScroll({
          target: root.current,
          enter: { target: "top", container: "top" },
          leave: { target: "bottom", container: "bottom" },
          sync: true,
        }),
      })
        .add(svg.querySelector(".fadeout"), { opacity: [1, 0], duration: 120 }, 0)
        .add(svg, { viewBox: [from, to], duration: 520, ease: zoomEase(from, to) }, 0)
        .add(svg, { opacity: [1, 0], duration: 30 }, 500)
        .add(".pull", { scale: [1.6, 1], duration: 1000 }, 0)
        .add(".scrim", { opacity: [0, 1], duration: 150 }, 520)
        .add(".headline", { opacity: [0, 1], y: [40, 0], duration: 220, ease: "out(3)" }, 600);
    });
    return () => {
      gone = true;
      tl?.revert();
    };
  }, [narrow]);

  // after the curtain: the letters open one by one, the outline and captions follow
  useEffect(() => {
    if (!loaded || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const svg = root.current.querySelector(".name");
    const a = animate(svg.querySelectorAll(".hole"), { fillOpacity: [0, 1], duration: 900, ease: "out(3)", delay: stagger(90) });
    const b = animate(svg.querySelectorAll(".around"), { opacity: [0, 1], duration: 900, ease: "out(3)", delay: 500 });
    return () => {
      a.revert();
      b.revert();
    };
  }, [loaded]);

  return (
    <section id="room" ref={root} className="relative h-svh motion-safe:h-[300svh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-cerulean">
        <div
          className={`absolute inset-0 transition-transform duration-[2200ms] ease-(--ease-out-strong) motion-reduce:transition-none ${
            loaded ? "scale-100" : "motion-safe:scale-110"
          }`}
        >
          <img
            {...photo("room-king")}
            sizes="100vw"
            alt="A king room with a blue headboard wall, white linen and a soft blue sofa by the window"
            className="pull absolute inset-0 h-full w-full origin-[50%_58%] object-cover"
            fetchPriority="high"
          />
        </div>

        {/* the name: cerulean everywhere except the letters, which are holes onto the room */}
        <svg
          className="name absolute inset-0 h-full w-full motion-reduce:hidden"
          viewBox="-700 -260 1400 420"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <mask id={mask} maskUnits="userSpaceOnUse" x="-50000" y="-50000" width="100000" height="100000">
            <rect x="-50000" y="-50000" width="100000" height="100000" fill="white" />
            <text className="word" x="0" y="0" textAnchor="middle" fill="black" fontFamily={FONT} fontWeight="700" fontSize={FS} letterSpacing="14">
              {word(narrow, { className: "hole", fillOpacity: 0 })}
            </text>
          </mask>
          <rect x="-50000" y="-50000" width="100000" height="100000" fill="var(--color-cerulean)" mask={`url(#${mask})`} />
          {/* captions and outline: faded in after the curtain (.around), faded out by scroll (.fadeout) */}
          <g className="fadeout">
          {/* hairline outline of the letters, so the name still reads before the photo resolves */}
          <text className="around" x="0" y="0" textAnchor="middle" fill="none" stroke="var(--color-maple)" strokeOpacity="0.7" strokeWidth="1" vectorEffect="non-scaling-stroke" fontFamily={FONT} fontWeight="700" fontSize={FS} letterSpacing="14" opacity="0">
            {word(narrow)}
          </text>
          <g className="frame">
            <text className="around" x="0" y={-FS * 0.95} textAnchor="middle" fill="var(--color-maple)" fontFamily={FONT} fontSize="34" letterSpacing="22" opacity="0">HOTEL</text>
            <text className="around" x="0" y={below} textAnchor="middle" fill="#ffffff" fillOpacity="0.8" fontFamily='"Mulish Variable", sans-serif' fontSize="22" letterSpacing="9" opacity="0">NAGA CITY · CEBU</text>
            {/* invisible stand-in for the word, so the frame's bounding box includes it */}
            <text x="0" y="0" textAnchor="middle" fill="none" fontFamily={FONT} fontWeight="700" fontSize={FS} letterSpacing="14">{word(narrow)}</text>
          </g>
          </g>
        </svg>

        <div className="scrim absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-cerulean/85 via-cerulean/40 to-transparent motion-safe:opacity-0" />
        <div className="headline absolute inset-x-0 bottom-0 max-w-4xl px-6 pb-14 motion-safe:opacity-0 sm:px-12 sm:pb-20">
          <p className="font-body text-xs tracking-[0.3em] text-white/80 uppercase">
            <span className="text-maple">01</span>&ensp;The room
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.08] font-light text-white sm:text-6xl lg:text-7xl">
            Thoughtful stays, meaningful moments, <span className="text-maple">unforgettable warmth.</span>
          </h1>
        </div>
      </div>
    </section>
  );
}
