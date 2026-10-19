import LightboxGrid from "@/components/kokonutui/lightbox-grid";
import { photo } from "@/lib/photo";

const IMAGES = [
  { name: "bedside", alt: "Twin beds either side of a timber nightstand with reading lamps", caption: "The bedside", width: 2240, height: 1493 },
  { name: "desk-lamp", alt: "A writing desk under a warm table lamp", caption: "A desk by lamplight", width: 1507, height: 2240 },
  { name: "sinks", alt: "Twin white basins on a black stone vanity", caption: "Twin vanity", width: 2240, height: 1493 },
  { name: "shower", alt: "A glass-walled rain shower", caption: "Rain shower", width: 2240, height: 1493 },
  { name: "room-twin", alt: "A twin room with blue throws and a lit timber headboard", caption: "Twin room", width: 2240, height: 1493 },
  { name: "suite-lounge", alt: "A large room with a sitting area, timber screen and the bed beyond", caption: "Sitting area", width: 2240, height: 1493 },
].map(({ name, ...rest }) => ({
  ...rest,
  src: photo(name).src,
  full: `/photos/${name}-1920.webp`,
}));

// 02 The details. Copy is the brand book's own core principles (p.7).
export default function Details() {
  return (
    <section id="details" data-bg="#ecf1f2" className="px-6 py-24 sm:px-12 sm:py-36">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="reveal font-body text-xs tracking-[0.3em] text-grey-5 uppercase">
            <span className="text-maple">02</span>&ensp;The details
          </p>
          <h2
            className="rise mt-5 font-display text-3xl leading-[1.15] font-light text-cerulean sm:text-5xl"
          >
            Every small detail, from the scent in the lobby to the lighting in each room,{" "}
            <span className="ul text-maple">matters.</span>
          </h2>
          <p className="reveal mt-6 max-w-md font-body text-base leading-[1.8] text-grey-6" style={{ "--i": 2 }}>
            From our beds to our service, we prioritize our guests’ relaxation and peace of mind.
          </p>
        </div>

        <LightboxGrid images={IMAGES} className="tiles max-w-none" />
      </div>
    </section>
  );
}
