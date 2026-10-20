import { useCallback, useEffect, useState } from "react";
import { initScrollFx } from "./lib/scroll-fx";
import { initSmooth } from "./lib/smooth";
import Loader from "./components/Loader";
import Header from "./components/Header";
import RibbonThread from "./components/RibbonThread";
import Room from "./sections/Room";
import About from "./sections/About";
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

  // headlines, photo wipes, fade-ups and the flowing background (lib/scroll-fx.js)
  useEffect(initScrollFx, []);
  // weighted scrolling, and the one-nudge glide through the opening (lib/smooth.js)
  useEffect(initSmooth, []);

  return (
    <>
      {!loaded && <Loader ready={ready} onDone={done} />}

      <Header loaded={loaded} />
      <main className="relative">
        <Room loaded={loaded} />
        <About />
        <Details />
        <Lobby />
        <Terrace />
        <Outside />
        <Stay />
        <RibbonThread />
      </main>
    </>
  );
}
