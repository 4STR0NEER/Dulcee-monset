import { animate, createTimeline, onScroll, splitText, stagger, utils } from "animejs";

// Page-wide scroll motion. Each effect marks up with a class and is wired here once.
// Returns a cleanup for React's effect.
export function initScrollFx() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const undo = [];

  // fire `fn` once, when `el` comes into view
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.__enter?.();
      }),
    // fire once 15% of the element shows. (A negative bottom margin here once hid the Book button for
    // good: at the very end of the page it can never scroll above the margin line.)
    { threshold: 0.15 }
  );
  const onEnter = (el, fn) => {
    el.__enter = fn;
    io.observe(el);
  };
  undo.push(() => io.disconnect());

  // simple fade-ups: CSS does the motion (index.css), we only mark them shown
  document.querySelectorAll(".reveal").forEach((el) => onEnter(el, () => (el.dataset.shown = "")));

  // background colour flows from chapter to chapter (CSS transition on body). It changes when a chapter
  // reaches a line a quarter of the way down, so the previous chapter's text has mostly scrolled away
  // before its background goes (dark text never sits on cerulean).
  const bgIo = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (document.body.style.backgroundColor = e.target.dataset.bg)),
    { rootMargin: "-25% 0px -75% 0px" }
  );
  document.querySelectorAll("[data-bg]").forEach((el) => bgIo.observe(el));
  undo.push(() => bgIo.disconnect());

  if (reduce) {
    document.querySelectorAll(".rise, .draw-line, .ul").forEach((el) => (el.dataset.shown = ""));
    return () => undo.forEach((f) => f());
  }

  // photos: two panels wipe away while the photo settles, then it drifts inside its frame
  document.querySelectorAll(".frame").forEach((frame) => {
    const [maple, cerulean] = frame.querySelectorAll(".frame-panel");
    const img = frame.querySelector(".frame-img");
    onEnter(frame, () => {
      const tl = createTimeline({ defaults: { ease: "inOut(4)" } })
        .add(cerulean, { scaleX: [1, 0], duration: 900 }, 0)
        .add(maple, { scaleX: [1, 0], duration: 900 }, 160)
        .add(img, { scale: [1.3, 1], duration: 1600, ease: "out(4)" }, 0);
      undo.push(() => tl.revert());
    });
    const drift = animate(frame.querySelector(".frame-drift"), {
      y: ["-6%", "6%"],
      ease: "linear",
      autoplay: onScroll({
        target: frame,
        enter: { target: "top", container: "bottom" },
        leave: { target: "bottom", container: "top" },
        sync: true,
      }),
    });
    undo.push(() => drift.revert());
  });

  // the details grid: tiles open upward one after another, each photo settling as it opens
  document.querySelectorAll(".tiles").forEach((grid) => {
    const tiles = grid.querySelectorAll(".tile");
    tiles.forEach((t) => (t.style.clipPath = "inset(100% 0 0 0)"));
    onEnter(grid, () => {
      animate(tiles, { clipPath: ["inset(100% 0 0 0)", "inset(0% 0 0 0)"], duration: 1000, ease: "inOut(4)", delay: stagger(110) });
      animate(grid.querySelectorAll(".tile img"), { scale: [1.35, 1], duration: 1500, ease: "out(4)", delay: stagger(110) });
    });
  });

  // chapter headlines rise line by line out of their own mask; the gold words get an underline
  document.querySelectorAll(".rise").forEach((h) => {
    onEnter(h, () => {
      h.dataset.shown = "";
      const split = splitText(h, { lines: { wrap: "clip" } });
      split.addEffect(({ lines }) => {
        utils.set(lines, { y: "110%" }); // every line starts hidden, not just the first
        return animate(lines, { y: "0%", duration: 1100, ease: "out(4)", delay: stagger(110) });
      });
      setTimeout(() => h.querySelectorAll(".ul").forEach((u) => (u.dataset.shown = "")), 650);
      undo.push(() => split.revert());
    });
  });

  // hairlines draw across as they arrive
  document.querySelectorAll(".draw-line").forEach((l) => onEnter(l, () => (l.dataset.shown = "")));

  return () => undo.forEach((f) => f());
}
