import { useEffect, useRef, useState } from "react";
import { animate, motion } from "motion/react";
import { cn } from "@/lib/utils";
import TextRoll from "@/components/skiper/text-roll";

// SpotlightNavbar from VengeanceUI (MIT, github.com/Ashutoshx7/VengeanceUI). Adapted:
// active item is controlled (scroll-spy), brand colours instead of theme switching,
// `start` / `end` slots for the logo and Book button, Skiper TextRoll labels.
const SPRING = { type: "spring", stiffness: 200, damping: 24 };

export function SpotlightNavbar({ items, activeIndex = -1, onItemClick, start, end, className }) {
  const navRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const spotlightX = useRef(0);
  const ambienceX = useRef(0);

  const centreOf = (index) => {
    const nav = navRef.current;
    const item = nav?.querySelector(`[data-index="${index}"]`);
    if (!item) return null;
    const navRect = nav.getBoundingClientRect();
    const r = item.getBoundingClientRect();
    return r.left - navRect.left + r.width / 2;
  };

  // the spotlight follows the pointer, then springs back to the active item
  useEffect(() => {
    const nav = navRef.current;
    const onMove = (e) => {
      setHovering(true);
      spotlightX.current = e.clientX - nav.getBoundingClientRect().left;
      nav.style.setProperty("--spotlight-x", `${spotlightX.current}px`);
    };
    const onLeave = () => {
      setHovering(false);
      const x = centreOf(activeIndex);
      if (x === null) return;
      animate(spotlightX.current, x, {
        ...SPRING,
        onUpdate: (v) => {
          spotlightX.current = v;
          nav.style.setProperty("--spotlight-x", `${v}px`);
        },
      });
    };
    nav.addEventListener("pointermove", onMove);
    nav.addEventListener("pointerleave", onLeave);
    return () => {
      nav.removeEventListener("pointermove", onMove);
      nav.removeEventListener("pointerleave", onLeave);
    };
  }, [activeIndex]);

  // the maple glow under the active chapter glides to its new home
  useEffect(() => {
    const nav = navRef.current;
    const x = centreOf(activeIndex);
    if (x === null) return;
    const controls = animate(ambienceX.current, x, {
      ...SPRING,
      onUpdate: (v) => {
        ambienceX.current = v;
        nav.style.setProperty("--ambience-x", `${v}px`);
      },
    });
    return () => controls.stop();
  }, [activeIndex]);

  return (
    <nav
      ref={navRef}
      aria-label="Chapters"
      className={cn(
        "relative flex h-12 items-center gap-1 overflow-hidden rounded-full border border-white/60 bg-white/75 px-2 shadow-[0_8px_30px_rgba(15,74,108,0.14)] backdrop-blur-md",
        className
      )}
      style={{ "--spotlight-color": "rgba(177,143,89,0.22)", "--ambience-color": "#b18f59" }}
    >
      {start}
      <ul className="relative z-10 hidden h-full items-center md:flex">
        {items.map((item, idx) => (
          <li key={item.href} className="flex h-full items-center">
            <motion.a
              href={item.href}
              data-index={idx}
              aria-current={activeIndex === idx ? "true" : undefined}
              initial="initial"
              whileHover="hovered"
              onClick={(e) => {
                e.preventDefault();
                onItemClick?.(item, idx);
              }}
              className={cn(
                "rounded-full px-3.5 py-2 font-body text-[13px] font-medium tracking-wide transition-colors duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-maple lg:px-4",
                activeIndex === idx ? "text-cerulean" : "text-grey-5 hover:text-cerulean"
              )}
            >
              <TextRoll>{item.label}</TextRoll>
            </motion.a>
          </li>
        ))}
      </ul>
      {end}

      {/* 1. soft light under the pointer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-300 ease-out"
        style={{
          opacity: hovering ? 1 : 0,
          background: "radial-gradient(120px circle at var(--spotlight-x) 100%, var(--spotlight-color) 0%, transparent 50%)",
        }}
      />
      {/* 2. maple line under the active chapter */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-[2] h-[2px] w-full transition-opacity duration-300 ease-out"
        style={{
          opacity: activeIndex >= 0 ? 1 : 0,
          background: "radial-gradient(60px circle at var(--ambience-x) 0%, var(--ambience-color) 0%, transparent 100%)",
        }}
      />
    </nav>
  );
}

export default SpotlightNavbar;
