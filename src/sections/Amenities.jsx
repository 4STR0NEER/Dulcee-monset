import { useEffect, useRef, useState } from "react";
import { photo } from "@/lib/photo";
import DulceeMark from "@/components/DulceeMark";

// PLACEHOLDERS. Copy rule: only brand-book lines, so the names and lines below wait for the client's list.
// photo: a name from public/photos (run `npm run photos`); leave it "" and the frame shows a "Photo to come" panel.
const AMENITIES = [
  { name: "Amenity name", line: "One line about this amenity, from the client.", photo: "" },
  { name: "Amenity name", line: "One line about this amenity, from the client.", photo: "" },
  { name: "Amenity name", line: "One line about this amenity, from the client.", photo: "" },
  { name: "Amenity name", line: "One line about this amenity, from the client.", photo: "" },
  { name: "Amenity name", line: "One line about this amenity, from the client.", photo: "" },
  { name: "Amenity name", line: "One line about this amenity, from the client.", photo: "" },
];

// placeholder panels take turns between the brand colours, so a change of amenity still reads as a change
const TONES = ["bg-cerulean text-white", "bg-[#f4efe6] text-cerulean", "bg-[#0b3b57] text-white"];

// 05 Amenities. A list beside a frame: the amenity crossing the middle of the screen (or under the mouse)
// is the active one, and its picture rises into the frame like a curtain going up (index.css, .amenity-shot).
export default function Amenities() {
  const list = useRef(null);
  const [{ active, prev }, setShown] = useState({ active: 0, prev: -1 });
  const show = (i) => setShown((s) => (s.active === i ? s : { active: i, prev: s.active }));

  useEffect(() => {
    const rows = [...list.current.children];
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && show(rows.indexOf(e.target))), {
      rootMargin: "-50% 0px -50% 0px",
    });
    rows.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, []);

  const state = (i) => (i === active ? "active" : i === prev ? "prev" : undefined);
  const num = (i) => String(i + 1).padStart(2, "0");

  return (
    <section id="amenities" data-bg="#f5f7f7" className="px-6 py-24 sm:px-12 sm:py-36">
      <div className="mx-auto max-w-6xl">
        <p className="reveal font-body text-xs tracking-[0.3em] text-grey-5 uppercase">
          <span className="text-maple">05</span>&ensp;Amenities
        </p>
        {/* TODO: placeholder headline; swap for a brand-book line */}
        <h2 className="rise mt-5 max-w-3xl font-display text-4xl leading-[1.1] font-light text-cerulean sm:text-6xl">
          Made for <span className="ul text-maple">your stay.</span>
        </h2>

        <div className="mt-14 grid items-start gap-2 sm:mt-20 md:grid-cols-[1fr_1fr] md:gap-16 lg:gap-24">
          {/* the names are in the list beside it, so the frame is decoration for screen readers */}
          <div
            aria-hidden="true"
            className="amenity-frame sticky top-20 z-[1] aspect-[16/10] overflow-hidden rounded-sm bg-cerulean md:top-28 md:aspect-[4/5]"
          >
            {AMENITIES.map((a, i) => (
              <figure key={i} className="amenity-shot absolute inset-0 m-0" data-state={state(i)}>
                {a.photo ? (
                  <img {...photo(a.photo)} sizes="(min-width: 768px) 45vw, 90vw" alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className={`flex h-full w-full flex-col items-center justify-center gap-4 ${TONES[i % TONES.length]}`}>
                    <DulceeMark tone={i % TONES.length === 1 ? undefined : "light"} className="w-14 opacity-80" />
                    <span className="font-display text-5xl font-light sm:text-6xl">{num(i)}</span>
                    <span className="font-body text-[11px] tracking-[0.35em] uppercase opacity-70">Photo to come</span>
                  </div>
                )}
              </figure>
            ))}
          </div>

          <ol ref={list} className="pb-[30svh] md:pb-0">
            {AMENITIES.map((a, i) => (
              <li
                key={i}
                data-active={i === active || undefined}
                onPointerEnter={(e) => e.pointerType === "mouse" && show(i)}
                className="amenity-row reveal relative py-7 sm:py-9"
                style={{ "--i": i }}
              >
                <span className="draw-line absolute inset-x-0 top-0 block h-px bg-grey-3" />
                <div className="flex items-baseline gap-5">
                  <span className="font-body text-xs tracking-[0.3em] text-maple">{num(i)}</span>
                  <div>
                    <h3 className="amenity-name font-display text-3xl leading-[1.1] font-light sm:text-4xl">{a.name}</h3>
                    <p className="amenity-line mt-2 max-w-sm font-body text-sm leading-[1.7] sm:text-base">{a.line}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
