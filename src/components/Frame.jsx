import { photo } from "@/lib/photo";
import { cn } from "@/lib/utils";

// A photo that is set into the page rather than floating on it: it arrives behind a cerulean and a
// maple panel that wipe away while it settles from a slight zoom, then drifts inside its frame
// as you scroll. Motion lives in lib/scroll-fx.js; this is only the markup.
export default function Frame({ name, alt, sizes = "100vw", className, children }) {
  return (
    <figure className={cn("frame relative z-[1] overflow-hidden bg-cerulean", className)}>
      <div className="frame-drift absolute inset-x-0 -top-[8%] -bottom-[8%] motion-reduce:inset-0">
        <img {...photo(name)} sizes={sizes} alt={alt} loading="lazy" className="frame-img h-full w-full object-cover" />
      </div>
      <span aria-hidden="true" className="frame-panel absolute inset-0 origin-right bg-maple motion-reduce:hidden" />
      <span aria-hidden="true" className="frame-panel absolute inset-0 origin-right bg-cerulean motion-reduce:hidden" />
      {children}
    </figure>
  );
}
