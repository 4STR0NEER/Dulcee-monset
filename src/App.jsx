import { useCallback, useEffect, useState } from "react";
import Loader from "./components/Loader";
import ScrollIndex from "./components/kokonutui/scroll-index";
import Room from "./sections/Room";
import Details from "./sections/Details";
import Lobby from "./sections/Lobby";
import Terrace from "./sections/Terrace";
import Outside from "./sections/Outside";
import Stay from "./sections/Stay";
import { photo } from "./lib/photo";

// The curtain lifts only once the fonts and the first photo are ready, so the room never appears half-loaded.
const hero = new Image();
hero.sizes = "100vw";
hero.srcset = photo("room-king").srcSet;
hero.src = photo("room-king").src;
const ready = Promise.all([document.fonts.ready, hero.decode().catch(() => {})]);

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const done = useCallback(() => setLoaded(true), []);

  // One-shot reveals: CSS does the motion (index.css), this only marks elements as they come into view.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.dataset.shown = "";
          io.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -12% 0px" }
    );
    document.querySelectorAll(".reveal, .reveal-img").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {!loaded && <Loader ready={ready} onDone={done} />}

      <ScrollIndex scroller="window" selector="[data-label]">
        <main>
          <Room loaded={loaded} />
          <Details />
          <Lobby />
          <Terrace />
          <Outside />
          <Stay />
        </main>
      </ScrollIndex>
    </>
  );
}
