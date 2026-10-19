import { useEffect, useRef } from "react";
import { animate, createScope, onScroll } from "animejs";
import { photo } from "@/lib/photo";

// 01 The room. The page opens close on the pillows; scrolling pulls the camera back to the whole room.
export default function Room({ loaded }) {
  const root = useRef(null);

  useEffect(() => {
    const scope = createScope({
      root,
      mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)" },
    }).add((self) => {
      if (self.matches.reduceMotion) return;
      animate(".pull", {
        scale: [1.35, 1],
        ease: "linear",
        autoplay: onScroll({
          target: root.current,
          enter: { target: "top", container: "top" },
          leave: { target: "bottom", container: "bottom" },
          sync: true,
        }),
      });
    });
    return () => scope.revert();
  }, []);

  return (
    <section ref={root} className="relative h-svh motion-safe:h-[220svh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-grey-3">
        {/* outer layer settles as the curtain lifts; inner layer is scroll-driven (one engine per element) */}
        <div
          className={`absolute inset-0 transition-transform duration-[1800ms] ease-(--ease-out-strong) motion-reduce:transition-none ${
            loaded ? "scale-100" : "motion-safe:scale-[1.05]"
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
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-cerulean/85 via-cerulean/40 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 max-w-4xl px-6 pb-14 sm:px-12 sm:pb-20">
          <p className="font-body text-xs tracking-[0.3em] text-white/80 uppercase">
            <span className="text-maple">01</span>&ensp;The room
          </p>
          <h1
            data-label="The room"
            className="mt-4 font-display text-4xl leading-[1.08] font-light text-white sm:text-6xl lg:text-7xl"
          >
            Thoughtful stays, meaningful moments, <span className="text-maple">unforgettable warmth.</span>
          </h1>
        </div>
      </div>
    </section>
  );
}
