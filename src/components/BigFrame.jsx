import { useId } from "react";
import { photo } from "@/lib/photo";

// A full-width photo revealed sideways by a cerulean block as you scroll. The block slides back to
// the photo's left third (bottom band on phones) and stays there, with its title cut out of it so
// the photo shows through the letters, and a line explaining the picture. Motion in lib/scroll-fx.js.
export default function BigFrame({ name, alt, title, sub, className = "" }) {
  const mask = useId();
  const [first, second] = title;
  const fs = "clamp(54px, 8vw, 150px)";
  const fsPhone = "clamp(44px, 14vw, 72px)";
  return (
    <figure className={`bigframe relative z-[1] overflow-hidden bg-cerulean ${className}`}>
      <div className="frame-drift absolute inset-x-0 -top-[8%] -bottom-[8%] motion-reduce:inset-0">
        <img {...photo(name)} sizes="100vw" alt={alt} loading="lazy" className="h-full w-full object-cover" />
      </div>

      <div className="block-panel absolute inset-0 [clip-path:inset(62%_0%_0%_0%)] md:[clip-path:inset(0%_66.6%_0%_0%)]">
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <mask id={mask}>
            <rect width="100%" height="100%" fill="white" />
            {/* desktop: title stacked in the left third */}
            <text className="hidden font-display md:inline" fill="black" fontWeight="600" style={{ fontSize: fs }}>
              <tspan x="5%" y="42%">{first}</tspan>
              <tspan x="5%" dy="0.95em">{second}</tspan>
            </text>
            {/* phone: one line in the bottom band */}
            <text className="font-display md:hidden" fill="black" fontWeight="600" x="6%" y="76%" style={{ fontSize: fsPhone }}>
              {first} {second}
            </text>
          </mask>
          <rect width="100%" height="100%" fill="var(--color-cerulean)" mask={`url(#${mask})`} />
        </svg>
        <p className="block-sub absolute right-[6%] bottom-[7%] left-[6%] max-w-md font-body text-sm leading-[1.7] text-white/85 md:top-[66%] md:right-auto md:bottom-auto md:left-[5%] md:max-w-[24vw] md:text-base">
          {sub}
        </p>
      </div>
    </figure>
  );
}
