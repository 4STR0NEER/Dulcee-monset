import { lazy, Suspense, useEffect, useRef, useState } from "react";
import TwistingRibbon from "@/components/vengeance/twisting-ribbon";
import DulceeMark from "@/components/DulceeMark";

// The hotel's Cloudbeds booking engine (Facebook tracking param stripped). Every "Book" link reads this.
export const BOOKING_URL = "https://hotels.cloudbeds.com/en/reservation/Efu2Ie?currency=php";

// three.js is heavy: fetch it only when the reader is getting close to this section
const Monogram3D = lazy(() => import("@/components/Monogram3D"));

function Monogram() {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "600px 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const flat = <DulceeMark tone="light" className="mx-auto h-full w-3/5" />;
  return (
    <div ref={ref} className="reveal mx-auto aspect-[4/3] w-[min(78vw,420px)]">
      {near && !failed ? (
        <Suspense fallback={null}>
          <Monogram3D onFail={() => setFailed(true)} />
        </Suspense>
      ) : failed ? flat : null}
    </div>
  );
}

// module-level so the ribbon's effect doesn't restart on every render
const RIBBON = { face: "#b18f59", foldA: "#ffffff", foldB: "#cbdce1", foldC: "#d9c29a" };

// 07 Stay. Copy: brand book messaging page (p.13).
export default function Stay() {
  return (
    <section id="stay" data-bg="#0b3b57" className="relative overflow-hidden text-white">
      <TwistingRibbon
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45"
        lightColors={RIBBON}
        waveSpeed={0.006}
        waveAmplitude={0.8}
        twistCycles={4}
      />

      <div className="relative mx-auto flex min-h-[80svh] max-w-3xl flex-col items-center justify-center px-6 py-28 text-center">
        <Monogram />
        <p className="reveal mt-2 font-body text-xs tracking-[0.3em] text-white/70 uppercase">
          <span className="text-maple">07</span>&ensp;Stay with us
        </p>
        <h2
          className="rise mt-5 font-display text-4xl leading-[1.1] font-light sm:text-6xl"
        >
          Is <span className="ul text-maple">Dulcee</span> worth remembering?
        </h2>
        <p className="reveal mt-6 max-w-lg font-body text-base leading-[1.8] text-white/80" style={{ "--i": 2 }}>
          If you’re someone who values sincerity over spectacle, then Dulcee is the kind of place that stays with you.
        </p>
        <div className="reveal mt-10" style={{ "--i": 3 }}>
          <a
            href={BOOKING_URL}
            data-book
            className="inline-block rounded-full bg-maple px-9 py-4 font-body text-sm font-semibold tracking-[0.2em] text-cerulean uppercase transition-[transform,background-color] duration-150 ease-out hover:bg-[#c2a06a] active:scale-[0.97]"
          >
            Book your stay
          </a>
        </div>
      </div>

      <footer className="relative flex flex-col items-center gap-3 border-t border-white/10 px-6 py-10 text-center font-body text-xs tracking-[0.15em] text-white/60">
        <DulceeMark tone="light" className="w-12" />
        <p>HOTEL DULCEÉ · NAGA CITY, CEBU</p>
        <p>© {new Date().getFullYear()} Dulceé Hospitality</p>
      </footer>
    </section>
  );
}
