import { useEffect, useRef, useState } from "react";
import { createTimeline } from "animejs";

// Resolves to the hotel's own Google listing (checked: same pin as the listing link, with its name card)
const PLACE = "Hotel+Dulcee,+Naga+City,+Cebu";
const EMBED = `https://www.google.com/maps?q=${PLACE}&z=16&output=embed`;
const ROUTE = `https://www.google.com/maps/dir/?api=1&destination=${PLACE}`;

// The map arrives like the site's photos: a cerulean and a maple panel wipe away to show it.
// The iframe is only created once the card is close, so Google loads nothing for readers who never get here.
export default function MapCard({ listing }) {
  const card = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = card.current;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tl;
    // start loading a little before it scrolls in
    const load = new IntersectionObserver(([e]) => e.isIntersecting && (setNear(true), load.disconnect()), { rootMargin: "400px 0px" });
    // wipe once it's properly in view
    const wipe = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        wipe.disconnect();
        if (reduce) return;
        const [maple, cerulean] = el.querySelectorAll(".map-panel");
        tl = createTimeline({ defaults: { ease: "inOut(4)" } })
          .add(cerulean, { scaleX: [1, 0], duration: 900 }, 0)
          .add(maple, { scaleX: [1, 0], duration: 900 }, 160);
      },
      { threshold: 0.3 }
    );
    load.observe(el);
    wipe.observe(el);
    return () => {
      load.disconnect();
      wipe.disconnect();
      tl?.revert();
    };
  }, []);

  return (
    <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-24 sm:px-12 sm:pb-32 md:grid-cols-[1.4fr_1fr] md:gap-16">
      <div ref={card} className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[#0b3b57] md:aspect-[16/11]">
        {near && (
          <iframe
            src={EMBED}
            title="Map: Hotel Dulceé in Naga City, Cebu"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full border-0"
          />
        )}
        <span aria-hidden="true" className="map-panel pointer-events-none absolute inset-0 origin-right bg-maple motion-reduce:hidden" />
        <span aria-hidden="true" className="map-panel pointer-events-none absolute inset-0 origin-right bg-cerulean motion-reduce:hidden" />
      </div>

      <div className="reveal">
        <p className="font-body text-xs tracking-[0.3em] text-white/70 uppercase">Find us</p>
        <p className="mt-4 font-display text-3xl leading-[1.15] font-light text-white sm:text-4xl">
          Hotel Dulceé <span className="block text-maple">Naga City, Cebu</span>
        </p>
        <span className="draw-line mt-8 block h-px w-full bg-white/20" />
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
          <a
            href={ROUTE}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded-full bg-maple px-7 py-3.5 font-body text-xs font-semibold tracking-[0.2em] text-cerulean uppercase transition-[transform,background-color] duration-150 ease-out hover:bg-[#c2a06a] active:scale-[0.97]"
          >
            Get directions
          </a>
          <a
            href={listing}
            target="_blank"
            rel="noreferrer"
            className="inline-block border-b border-maple pb-1 font-body text-xs tracking-[0.2em] text-white uppercase transition-colors duration-150 ease-out hover:text-maple"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
