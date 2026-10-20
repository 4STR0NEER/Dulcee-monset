import { useRef, useState } from "react";
import BigFrame from "@/components/BigFrame";
import { photo } from "@/lib/photo";
import { useRibbonTouch } from "@/lib/ribbon-touch";

// 03 The lobby. "A warm greeting" is from the brand book's messaging page (p.13).
// The ribbon runs under the heading; when it touches, the heading glows and the team appears
// out of the light below it (index.css, .greet).
export default function Lobby() {
  const head = useRef(null);
  const [lit, setLit] = useState(false);
  useRibbonTouch(head, () => setLit(true));
  return (
    <section id="lobby" data-bg="#ffffff">
      <BigFrame
        name="lobby-lounge"
        alt="The lobby lounge: woven rattan chairs on white marble under a ceiling of flowing timber ribbons"
        title={["The", "Lobby"]}
        sub="Woven rattan chairs on white marble, under a ceiling of flowing timber ribbons."
        className="h-[85svh] min-h-96"
      />

      <div data-lit={lit || undefined} className="greet mx-auto max-w-5xl px-6 py-24 text-center sm:px-12 sm:py-32">
        <p className="reveal font-body text-xs tracking-[0.3em] text-grey-5 uppercase">
          <span className="text-maple">03</span>&ensp;The lobby
        </p>
        <div ref={head} data-ribbon-touch className="relative mx-auto mt-5 w-fit">
          <span aria-hidden="true" className="greet-bloom" />
          <h2 className="rise relative font-display text-4xl leading-[1.1] font-light sm:text-6xl">
            A warm <span className="ul text-maple">greeting.</span>
          </h2>
        </div>
        <p className="reveal mx-auto mt-8 max-w-md font-body text-base leading-[1.8] text-ink/80" style={{ "--i": 2 }}>
          We embody the uniquely Filipino spirit of hospitality with respect, warmth, and always with a smile.
        </p>

        <figure className="greet-photo mt-14 aspect-[4/3] overflow-hidden sm:aspect-[16/9]">
          <img
            {...photo("lobby-team")}
            sizes="(min-width: 1024px) 64rem, 100vw"
            alt="Four members of the front desk team in blue and black uniforms, smiling at reception"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </figure>
      </div>
    </section>
  );
}
