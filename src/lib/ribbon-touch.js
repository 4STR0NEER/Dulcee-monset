import { useEffect } from "react";

// Run `fn` once, when the ribbon thread reaches this element (RibbonThread dispatches "ribbon:touch").
// If the ribbon isn't drawing (no `data-ribbon` on <html>), fall back to when the element is mid-screen,
// so nothing stays closed for good.
export function useRibbonTouch(ref, fn) {
  useEffect(() => {
    const el = ref.current;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      fn();
    };
    el.addEventListener("ribbon:touch", go);
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && !document.documentElement.dataset.ribbon && go(),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    io.observe(el);
    return () => {
      el.removeEventListener("ribbon:touch", go);
      io.disconnect();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- fn is read once on purpose
}
