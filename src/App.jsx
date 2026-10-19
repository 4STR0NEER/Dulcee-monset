import { useCallback, useState } from "react";
import Loader from "./components/Loader";

// What the first frame needs before the curtain lifts. Add the room photo's decode() here once it exists.
const ready = document.fonts.ready;

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const done = useCallback(() => setLoaded(true), []);

  return (
    <>
      {!loaded && <Loader ready={ready} onDone={done} />}

      <main>
        {/* 01 The room. Placeholder until the HD photos from Drive are in resources/photos/ */}
        <section className="relative flex h-svh items-end overflow-hidden bg-grey-2">
          <div
            className={`absolute inset-0 grid place-items-center bg-grey-3/60 transition-transform duration-[1800ms] ease-(--ease-out-strong) motion-reduce:transition-none ${
              loaded ? "scale-100" : "scale-[1.06]"
            }`}
          >
            <p className="font-body text-xs tracking-[0.25em] text-grey-5 uppercase">Room photo goes here</p>
          </div>

          <div className="relative max-w-3xl px-6 pb-16 sm:px-12 sm:pb-24">
            <h1 className="font-display text-4xl leading-[1.1] font-light text-cerulean sm:text-6xl">
              Thoughtful stays, meaningful moments, <span className="text-maple">unforgettable warmth.</span>
            </h1>
          </div>
        </section>
      </main>
    </>
  );
}
