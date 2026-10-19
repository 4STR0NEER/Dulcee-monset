import { photo } from "@/lib/photo";

// 04 The terrace. Copy: brand book traits, "Understated Elegance" (p.6) and messaging (p.13).
export default function Terrace() {
  return (
    <section id="terrace" className="bg-grey-1">
      <figure className="reveal-img relative h-[85svh] min-h-96 overflow-hidden">
        <img
          {...photo("cafe")}
          sizes="100vw"
          alt="The café under a ceiling of curving timber ribbons, with rattan seating and glass walls open to the sea"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </figure>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 sm:px-12 sm:py-32 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <figure className="reveal-img order-last overflow-hidden rounded-sm lg:order-first">
          <img
            {...photo("terrace-leaf")}
            sizes="(min-width: 1024px) 55vw, 100vw"
            alt="Terrace tables and woven chairs behind glass, with the sea beyond and a banana leaf in the foreground"
            loading="lazy"
            className="aspect-[3/2] w-full object-cover"
          />
        </figure>

        <div>
          <p className="reveal font-body text-xs tracking-[0.3em] text-grey-5 uppercase">
            <span className="text-maple">04</span>&ensp;The terrace
          </p>
          <h2
            className="reveal mt-5 font-display text-4xl leading-[1.1] font-light text-cerulean sm:text-6xl"
            style={{ "--i": 1 }}
          >
            A quiet corner <span className="text-maple">to rest.</span>
          </h2>
          <p className="reveal mt-6 max-w-md font-body text-base leading-[1.8] text-grey-6" style={{ "--i": 2 }}>
            At Dulcee, luxury is never showy. It’s felt in the calm confidence of clean design, gracious service, and
            spaces that feel like home.
          </p>
        </div>
      </div>
    </section>
  );
}
