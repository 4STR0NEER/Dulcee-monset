import { useEffect, useRef } from "react";
import { animate, createScope, createTimeline, onScroll, splitText, stagger, utils } from "animejs";
import { photo } from "@/lib/photo";

// The doorway: an arch standing on the floor (big elliptical top corners), as a clip-path.
// Mask technique after Skiper UI's skiper66 clip shapes. Both strings share one shape so anime can tween them.
const ARCH_WIDE = "inset(9% 33% 0% 33% round 50% 50% 0% 0% / 26% 26% 0% 0%)";
const ARCH_NARROW = "inset(12% 10% 0% 10% round 50% 50% 0% 0% / 20% 20% 0% 0%)";
const OPEN = "inset(0% 0% 0% 0% round 0% 0% 0% 0% / 0% 0% 0% 0%)";

// 01 The room. You look in through an arched doorway; scrolling walks you through it,
// then the camera keeps pulling back from the pillows to the whole room.
export default function Room({ loaded }) {
  const root = useRef(null);

  // scroll: doorway opens to full-bleed, photo pulls back
  useEffect(() => {
    const scope = createScope({
      root,
      mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)", wide: "(min-width: 768px)" },
    }).add((self) => {
      if (self.matches.reduceMotion) return;
      const arch = self.matches.wide ? ARCH_WIDE : ARCH_NARROW;
      utils.set(".doorway", { clipPath: arch });
      createTimeline({
        defaults: { ease: "linear" },
        autoplay: onScroll({
          target: root.current,
          enter: { target: "top", container: "top" },
          leave: { target: "bottom", container: "bottom" },
          sync: true,
        }),
      })
        .add(".doorway", { clipPath: [arch, OPEN], duration: 450, ease: "inOut(3)" }, 0)
        .add(".pull", { scale: [1.35, 1], duration: 1000 }, 0)
        .add(".scrim", { opacity: [0.6, 1], duration: 300 }, 250);
    });
    return () => scope.revert();
  }, []);

  // after the curtain: the headline rises line by line out of its own mask
  useEffect(() => {
    if (!loaded || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const h1 = root.current.querySelector("h1");
    h1.style.opacity = 1;
    const split = splitText(h1, { lines: { wrap: "clip" } });
    split.addEffect(({ lines }) =>
      animate(lines, { y: ["105%", "0%"], duration: 1100, ease: "out(4)", delay: stagger(120) })
    );
    const eyebrow = animate(".eyebrow", { opacity: [0, 1], y: [10, 0], duration: 700, ease: "out(3)" });
    return () => {
      split.revert();
      eyebrow.revert();
    };
  }, [loaded]);

  return (
    <section id="room" ref={root} className="relative h-svh motion-safe:h-[240svh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-cerulean">
        {/* outer layer: CSS settle as the curtain lifts + the scroll-driven doorway clip (different properties) */}
        <div
          className={`doorway absolute inset-0 transition-transform duration-[1800ms] ease-(--ease-out-strong) motion-reduce:transition-none ${
            loaded ? "scale-100" : "motion-safe:scale-[1.04]"
          }`}
        >
          <img
            {...photo("room-king")}
            sizes="100vw"
            alt="A king room with a blue headboard wall, white linen and a soft blue sofa by the window"
            className="pull absolute inset-0 h-full w-full origin-[50%_62%] object-cover"
            fetchPriority="high"
          />
        </div>
        {/* scrim: partly on from the start so the headline holds over the arch on phones, full once the photo fills the screen */}
        <div className="scrim absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-cerulean/85 via-cerulean/40 to-transparent motion-safe:opacity-60" />

        <div className="absolute inset-x-0 bottom-0 max-w-4xl px-6 pb-14 sm:px-12 sm:pb-20">
          <p className="eyebrow font-body text-xs tracking-[0.3em] text-white/80 uppercase motion-safe:opacity-0">
            <span className="text-maple">01</span>&ensp;The room
          </p>
          <h1
            className="mt-4 font-display text-4xl leading-[1.08] font-light text-white [text-shadow:0_2px_24px_rgba(15,74,108,0.45)] motion-safe:opacity-0 sm:text-6xl lg:text-7xl"
          >
            Thoughtful stays, meaningful moments, <span className="text-maple">unforgettable warmth.</span>
          </h1>
        </div>
      </div>
    </section>
  );
}
