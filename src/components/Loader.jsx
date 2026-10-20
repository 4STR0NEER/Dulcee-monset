import { useLayoutEffect, useRef } from "react";
import { animate, createTimeline, createScope, stagger, svg, utils, waapi } from "animejs";
import DulceeMark from "./DulceeMark";

const WORD = "DULCEÉ";

// Ribbons -> DH monogram -> wordmark -> the wave lifts like a curtain into the room.
// `ready` is a promise for whatever the first frame needs (fonts, hero photo).
export default function Loader({ ready, onDone }) {
  const root = useRef(null);
  const scope = useRef(null);

  // layout effect: hidden start states are set before the first paint, so nothing flashes
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.style.overflow = "hidden";
    let finished = false;
    let lifted = false;

    scope.current = createScope({
      root,
      mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" },
    }).add((self) => {
      const finish = () => {
        if (finished) return;
        finished = true;
        html.style.overflow = "";
        onDone();
      };

      // Reduced motion: no drawing or curtain, just a quiet fade once the page is ready.
      if (self.matches.reduceMotion) {
        ready.then(() =>
          animate(root.current, { opacity: 0, duration: 400, ease: "out(2)", onComplete: finish })
        );
        return;
      }

      utils.set("[data-wave-clip]", { width: 0 });

      const lift = () => {
        if (lifted) return;
        lifted = true;
        waapi.animate(".curtain", {
          y: "-100%",
          duration: 1100,
          ease: "inOut(4)",
          onComplete: finish,
        });
      };

      // Transforms and fades run as WAAPI, on the compositor: the page mounting underneath keeps the
      // main thread busy during load, and JS-ticked frames stuttered and jumped. Only the SVG drawing
      // (ribbons, wave) can't move off it, so it stays on anime's timeline.
      const draw = createTimeline({ defaults: { ease: "out(4)" } })
        // two brand ribbons draw in and sweep toward the centre...
        .add(svg.createDrawable(".ribbon"), { draw: ["0 0", "0 1"], duration: 1100, delay: stagger(140) }, 0)
        // ...then retract into it as the monogram rises
        .add(svg.createDrawable(".ribbon"), { draw: "1 1", duration: 700, ease: "inOut(3)", delay: stagger(80) }, 900)
        .add("[data-wave-clip]", { width: 1320, duration: 900, ease: "inOut(4)" }, 1350);
      const fades = [
        waapi.animate("[data-piece]", { opacity: [0, 1], y: [24, 0], duration: 800, delay: stagger(90, { start: 1050 }), ease: "out(4)" }),
        waapi.animate(".hotel", { opacity: [0, 1], duration: 600, delay: 1700, ease: "out(4)" }),
        // the letters close in from wide tracking (transform only, no layout)
        waapi.animate(".letter", {
          opacity: [0, 1],
          x: (_, i) => [(i - (WORD.length - 1) / 2) * 22, 0],
          duration: 1000,
          delay: stagger(40, { start: 1650 }),
          ease: "out(4)",
        }),
        waapi.animate(".skip", { opacity: [0, 1], duration: 400, delay: 600, ease: "out(4)" }),
      ];
      const intro = [draw, ...fades];

      // lift only when both the intro has played and the page is ready
      Promise.all([...intro.map((a) => a.then()), ready]).then(lift);

      self.add("skip", () => {
        intro.forEach((a) => a.complete());
        lift();
      });
    });

    return () => {
      scope.current.revert();
      html.style.overflow = "";
    };
  }, [ready, onDone]);

  return (
    <div ref={root} className="fixed inset-0 z-50" role="status" aria-label="Loading Hotel Dulcee">
      <div className="curtain absolute inset-0 bg-cerulean">
        {/* wave-shaped hem: becomes the curtain's edge as it lifts */}
        <svg
          className="absolute left-0 top-full h-[9vw] min-h-12 w-full -translate-y-px"
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill="var(--color-cerulean)" d="M0 0H100V3C78 10 62 1 44 5C28 8.5 14 9 0 4Z" />
        </svg>

        <svg className="absolute inset-0 h-full w-full motion-reduce:hidden" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="ribbon" fill="none" stroke="var(--color-maple)" strokeWidth="5" vectorEffect="non-scaling-stroke"
            strokeLinecap="round" d="M108 -6C78 18 92 40 72 52C62 58 56 52 50 50" />
          <path className="ribbon" fill="none" stroke="#ffffff" strokeWidth="5" vectorEffect="non-scaling-stroke"
            strokeLinecap="round" d="M-8 106C22 84 12 62 30 50C40 44 46 48 50 50" />
        </svg>

        <div className="relative flex h-full flex-col items-center justify-center gap-5 px-4">
          <DulceeMark tone="light" className="w-40 sm:w-52 [&_[data-piece]]:motion-safe:opacity-0" />
          <div className="flex flex-col items-center gap-1 font-display">
            <span className="hotel text-sm font-normal tracking-[0.55em] text-maple motion-safe:opacity-0 sm:text-base">HOTEL</span>
            <span className="flex text-4xl font-semibold tracking-[0.18em] text-white sm:text-5xl" aria-label="Dulceé">
              {[...WORD].map((ch, i) => (
                <span key={i} className="letter inline-block motion-safe:opacity-0" aria-hidden="true">{ch}</span>
              ))}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => scope.current?.methods.skip?.()}
          className="skip absolute bottom-6 right-6 rounded-full px-4 py-2 font-body text-xs tracking-[0.2em] text-white/70 uppercase opacity-0 motion-reduce:hidden transition-[color,transform] duration-150 ease-out hover:text-white active:scale-[0.97]"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
