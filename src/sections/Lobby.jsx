import { photo } from "@/lib/photo";

// 03 The lobby. "A warm greeting" is from the brand book's messaging page (p.13).
export default function Lobby() {
  return (
    <section className="bg-white">
      <figure className="reveal-img relative h-[80svh] min-h-96 overflow-hidden">
        <img
          {...photo("lobby-lounge")}
          sizes="100vw"
          alt="The lobby lounge: woven rattan chairs on white marble under a ceiling of flowing timber ribbons"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </figure>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 sm:px-12 sm:py-32 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="reveal font-body text-xs tracking-[0.3em] text-grey-5 uppercase">
            <span className="text-maple">03</span>&ensp;The lobby
          </p>
          <h2
            data-label="The lobby"
            className="reveal mt-5 font-display text-4xl leading-[1.1] font-light text-cerulean sm:text-6xl"
            style={{ "--i": 1 }}
          >
            A warm <span className="text-maple">greeting.</span>
          </h2>
          <p className="reveal mt-6 max-w-md font-body text-base leading-[1.8] text-grey-6" style={{ "--i": 2 }}>
            We embody the uniquely Filipino spirit of hospitality with respect, warmth, and always with a smile.
          </p>
        </div>

        <figure className="reveal-img overflow-hidden rounded-sm">
          <img
            {...photo("lobby-team")}
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="Four members of the front desk team in blue and black uniforms, smiling at reception"
            loading="lazy"
            className="aspect-[3/2] w-full object-cover"
          />
        </figure>
      </div>
    </section>
  );
}
