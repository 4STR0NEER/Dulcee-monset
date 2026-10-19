import Frame from "@/components/Frame";

// 04 The terrace. Copy: brand book messaging (p.13).
export default function Terrace() {
  return (
    <section id="terrace" data-bg="#f4efe6">
      <Frame
        name="cafe"
        alt="The café under a ceiling of curving timber ribbons, with rattan seating and glass walls open to the sea"
        className="h-[90svh] min-h-96"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 sm:px-12 sm:py-32 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
        {/* bleeds off the left edge, mirroring the lobby */}
        <Frame
          name="terrace-leaf"
          sizes="(min-width: 1024px) 60vw, 100vw"
          alt="Terrace tables and woven chairs behind glass, with the sea beyond and a banana leaf in the foreground"
          className="order-last -mx-6 aspect-[4/3] sm:-mx-12 lg:order-first lg:mr-0 lg:ml-[calc(-1*max(3rem,(100vw_-_72rem)/2_+_3rem))] lg:aspect-auto lg:h-[75svh]"
        />

        <div>
          <p className="reveal font-body text-xs tracking-[0.3em] text-grey-5 uppercase">
            <span className="text-maple">04</span>&ensp;The terrace
          </p>
          <h2 className="rise mt-5 font-display text-4xl leading-[1.1] font-light text-cerulean sm:text-6xl">
            A quiet corner <span className="ul text-maple">to rest.</span>
          </h2>
          <p className="reveal mt-6 max-w-md font-body text-base leading-[1.8] text-grey-6" style={{ "--i": 2 }}>
            We believe luxury isn’t just about gold-plated everything. It’s about how you’re treated.
          </p>
        </div>
      </div>
    </section>
  );
}
