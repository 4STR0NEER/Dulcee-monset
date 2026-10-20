import { useEffect, useState } from "react";
import SpotlightNavbar from "@/components/vengeance/spotlight-navbar";
import DulceeMark from "@/components/DulceeMark";
import { BOOKING_URL } from "@/sections/Stay";
import { scrollToTarget } from "@/lib/smooth";

const CHAPTERS = [
  { label: "The room", href: "#room" },
  { label: "About", href: "#about" },
  { label: "Details", href: "#details" },
  { label: "Lobby", href: "#lobby" },
  { label: "Terrace", href: "#terrace" },
  { label: "Naga City", href: "#naga" },
];

const go = (href) => scrollToTarget(document.querySelector(href));

// Floating glass bar: drops in once the curtain has lifted, tucks away while you read down, returns on the way up.
export default function Header({ loaded }) {
  const [active, setActive] = useState(-1);
  const [tucked, setTucked] = useState(false);

  // scroll-spy: the chapter crossing the middle of the screen is the active one
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(CHAPTERS.findIndex((c) => c.href === `#${e.target.id}`));
        }),
      { rootMargin: "-50% 0px -50% 0px" }
    );
    [...CHAPTERS.map((c) => c.href), "#stay"].forEach((h) => {
      const el = document.querySelector(h);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let last = scrollY;
    const onScroll = () => {
      const y = scrollY;
      if (Math.abs(y - last) < 8) return; // ignore jitter
      setTucked(y > last && y > innerHeight * 0.6);
      last = y;
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  const hidden = !loaded || tucked;

  return (
    <header
      className={`fixed inset-x-0 top-4 z-40 flex justify-center px-4 transition-[transform,opacity] duration-500 ease-(--ease-out-strong) motion-reduce:transition-opacity ${
        hidden ? "pointer-events-none -translate-y-[160%] opacity-0 motion-reduce:translate-y-0" : ""
      }`}
    >
      <SpotlightNavbar
        items={CHAPTERS}
        activeIndex={active}
        onItemClick={(item) => go(item.href)}
        className="w-full max-w-fit"
        start={
          <a
            href="#room"
            onClick={(e) => {
              e.preventDefault();
              scrollToTarget(0);
            }}
            aria-label="Hotel Dulceé, back to top"
            className="relative z-10 flex items-center gap-2 rounded-full py-1 pr-3 pl-2 outline-none focus-visible:ring-2 focus-visible:ring-maple md:mr-1 md:border-r md:border-grey-3 md:pr-4"
          >
            <DulceeMark className="w-8" />
            <span className="font-display text-sm font-semibold tracking-[0.25em] text-cerulean">DULCEÉ</span>
          </a>
        }
        end={
          <a
            href={BOOKING_URL}
            className="relative z-10 ml-auto rounded-full bg-cerulean px-4 py-2 font-body text-xs font-semibold tracking-[0.18em] text-white uppercase transition-[transform,background-color] duration-150 ease-out hover:bg-[#0b3a55] active:scale-[0.97] md:ml-2"
          >
            Book
          </a>
        }
      />
    </header>
  );
}
