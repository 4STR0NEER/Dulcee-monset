import { useEffect, useRef } from "react";
import { animate, onScroll, splitText, stagger } from "animejs";

// Copy is the brand book's own: typography sample (p.20), "How" (p.4) and brand traits (p.6).
const TRAITS = [
  ["Warmly Filipino", "Rooted in authentic Filipino hospitality. Always warm, always thoughtful."],
  ["Understated Elegance", "Luxury is never showy. It’s felt in clean design, gracious service, and spaces that feel like home."],
  ["Purposefully Growing", "Not just a hotel, but a homegrown brand with a mission to grow mindfully and meaningfully."],
];

// What Hotel Dulceé is about. The statement lights up word by word as you read down.
export default function About() {
  const statement = useRef(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const split = splitText(statement.current, { words: true });
    split.addEffect(({ words }) =>
      animate(words, {
        opacity: [0.14, 1],
        ease: "linear",
        delay: stagger(40),
        autoplay: onScroll({
          target: statement.current,
          enter: { target: "top", container: "bottom" },
          leave: { target: "bottom", container: "center" },
          sync: 0.5,
        }),
      })
    );
    return () => split.revert();
  }, []);

  return (
    <section id="about" data-bg="#f5f7f7" className="px-6 pt-28 pb-12 sm:px-12 sm:pt-40 sm:pb-16">
      <div className="mx-auto max-w-6xl">
        <p className="reveal font-body text-xs tracking-[0.3em] text-grey-5 uppercase">Welcome to Hotel Dulceé</p>

        <p
          ref={statement}
          className="mt-8 max-w-5xl font-display text-4xl leading-[1.12] font-light text-cerulean sm:text-6xl lg:text-7xl"
        >
          <span className="text-maple">Comfort doesn’t have to be expensive.</span> At Dulcee, it’s personal.
        </p>

        <div className="mt-16 grid gap-10 sm:mt-24 lg:grid-cols-2 lg:gap-20">
          <p className="reveal font-body text-lg leading-[1.85] text-grey-6">
            Tucked in the heart of the city, we offer restful stays with refined simplicity. Every detail, from your
            check-in to your morning coffee, is designed with care. We believe kindness is a luxury everyone deserves.
          </p>
          <p className="reveal font-body text-lg leading-[1.85] text-grey-6" style={{ "--i": 1 }}>
            We make every guest feel at home by delivering family-like care, elegance without excess, and a culture
            you can feel. That’s our kind of luxury, and we share it,{" "}
            <span className="text-cerulean">from our towns to the world.</span>
          </p>
        </div>

        <ul className="mt-20 grid gap-12 sm:mt-28 md:grid-cols-3 md:gap-10">
          {TRAITS.map(([title, text], i) => (
            <li key={title} className="reveal" style={{ "--i": i }}>
              {/* a hairline that draws across as the trait arrives */}
              <span className="draw-line block h-px w-full bg-maple" />
              <p className="mt-6 font-body text-xs tracking-[0.3em] text-maple">0{i + 1}</p>
              <h3 className="mt-3 font-display text-2xl font-normal text-cerulean sm:text-3xl">{title}</h3>
              <p className="mt-3 font-body text-base leading-[1.8] text-grey-6">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
