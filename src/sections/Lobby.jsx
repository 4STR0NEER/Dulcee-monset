import Frame from "@/components/Frame";

// 03 The lobby. "A warm greeting" is from the brand book's messaging page (p.13).
export default function Lobby() {
  return (
    <section id="lobby" data-bg="#ffffff">
      <Frame
        name="lobby-lounge"
        alt="The lobby lounge: woven rattan chairs on white marble under a ceiling of flowing timber ribbons"
        className="h-[85svh] min-h-96"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 sm:px-12 sm:py-32 lg:grid-cols-[1fr_1.25fr] lg:gap-20">
        <div>
          <p className="reveal font-body text-xs tracking-[0.3em] text-grey-5 uppercase">
            <span className="text-maple">03</span>&ensp;The lobby
          </p>
          <h2 className="rise mt-5 font-display text-4xl leading-[1.1] font-light text-cerulean sm:text-6xl">
            A warm <span className="ul text-maple">greeting.</span>
          </h2>
          <p className="reveal mt-6 max-w-md font-body text-base leading-[1.8] text-grey-6" style={{ "--i": 2 }}>
            We embody the uniquely Filipino spirit of hospitality with respect, warmth, and always with a smile.
          </p>
        </div>

        {/* bleeds off the right edge of the page so it sits in the layout rather than floating on it */}
        <Frame
          name="lobby-team"
          sizes="(min-width: 1024px) 60vw, 100vw"
          alt="Four members of the front desk team in blue and black uniforms, smiling at reception"
          className="-mx-6 aspect-[4/3] sm:-mx-12 lg:ml-0 lg:mr-[calc(-1*max(3rem,(100vw_-_72rem)/2_+_3rem))] lg:aspect-auto lg:h-[75svh]"
        />
      </div>
    </section>
  );
}
