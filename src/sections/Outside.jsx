import { useEffect, useRef } from "react";
import { createScope, createTimeline, onScroll, utils } from "animejs";
import { photo } from "@/lib/photo";

// Google Maps search, not a pinned address: the client hasn't supplied one yet. Check it resolves to the hotel.
const DIRECTIONS = "https://www.google.com/maps/search/?api=1&query=Hotel+Dulcee+Naga+City+Cebu";

// 05 Naga City, Cebu. The second pull-back: the terrace view shrinks into a frame around the sea
// and the building it belongs to comes into view. Final layout lives in CSS; scroll animates *into* it.
export default function Outside() {
  const root = useRef(null);

  useEffect(() => {
    const scope = createScope({
      root,
      mediaQueries: { reduceMotion: "(prefers-reduced-motion: reduce)", wide: "(min-width: 768px)" },
    }).add((self) => {
      if (self.matches.reduceMotion) return;
      const view = root.current.querySelector(".view");
      // the CSS end state for this breakpoint, e.g. "inset(46% 58% 10% 6%)"
      const framed = getComputedStyle(view).clipPath;
      utils.set(view, { clipPath: "inset(0% 0% 0% 0%)" });
      utils.set(".building", { opacity: 0, y: 40 });
      utils.set(".words", { opacity: 0, y: 24 });
      createTimeline({
        defaults: { ease: "linear" },
        autoplay: onScroll({
          target: root.current,
          enter: { target: "top", container: "top" },
          leave: { target: "bottom", container: "bottom" },
          sync: true,
        }),
      })
        .add(view, { clipPath: ["inset(0% 0% 0% 0%)", framed], duration: 600, ease: "inOut(2)" }, 100)
        .add(".building", { opacity: [0, 1], y: [40, 0], duration: 400, ease: "out(3)" }, 350)
        .add(".words", { opacity: [0, 1], y: [24, 0], duration: 300, ease: "out(3)" }, 600)
        .add({ duration: 100 }); // a short hold at the end before the section scrolls away
    });
    return () => scope.revert();
  }, []);

  return (
    <section className="bg-cerulean">
      <div ref={root} className="relative h-svh motion-safe:h-[260svh]">
        <div className="sticky top-0 h-svh overflow-hidden">
          {/* the building: left card (desktop) / lower card (phone) */}
          <figure className="building absolute top-[54%] right-[6%] bottom-[6%] left-[6%] overflow-hidden rounded-sm md:top-[10%] md:right-[46%] md:bottom-[10%]">
            <img
              {...photo("facade")}
              sizes="(min-width: 768px) 48vw, 88vw"
              alt="Hotel Dulceé: a white tower with timber soffits and glass balconies, palms and green hills behind"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </figure>

          {/* the terrace view: starts full-bleed, ends as a small card framing the sea (the horizon sits ~35% down the photo) */}
          <img
            {...photo("terrace-sea")}
            sizes="100vw"
            alt="The terrace looking out over the sea"
            loading="lazy"
            className="view absolute inset-0 h-full w-full object-cover [clip-path:inset(26%_6%_50%_6%)] md:[clip-path:inset(14%_6%_46%_60%)]"
          />

          <div className="words absolute top-[6%] right-[6%] left-[6%] md:top-[60%] md:left-[60%]">
            <p className="font-body text-xs tracking-[0.3em] text-white/70 uppercase">
              <span className="text-maple">05</span>&ensp;Naga City, Cebu
            </p>
            <h2
              data-label="Naga City"
              className="mt-4 font-display text-3xl leading-[1.1] font-light text-white sm:text-5xl"
            >
              From our town <span className="text-maple">to the world.</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Copy: brand book messaging (p.13) and core principles (p.7) */}
      <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <p className="reveal font-display text-2xl leading-[1.3] font-light text-white sm:text-4xl">
          Whether it’s a warm greeting, a quiet corner to rest, or{" "}
          <span className="text-maple">the gentle pace of local life,</span> we’re offering something real.
        </p>
        <p className="reveal mx-auto mt-8 max-w-md font-body text-base leading-[1.8] text-white/75" style={{ "--i": 1 }}>
          We source local and hire local. We are supporting our community at every step.
        </p>
        <div className="reveal mt-10" style={{ "--i": 2 }}>
          <a
            href={DIRECTIONS}
            target="_blank"
            rel="noreferrer"
            className="inline-block border-b border-maple pb-1 font-body text-sm tracking-[0.2em] text-white uppercase transition-colors duration-150 ease-out hover:text-maple"
          >
            Get directions
          </a>
        </div>
      </div>
    </section>
  );
}
