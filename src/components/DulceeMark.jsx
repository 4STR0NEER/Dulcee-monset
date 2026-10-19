import { useId } from "react";

// The DH monogram, traced from resources/852243083_…_n.png (no vector file was supplied).
// Swap in the official SVG paths when the client sends them; the 3D monogram reads these too.
export const MARK = {
  viewBox: "340 0 1320 810",
  dLeft: "M615 17H802V148H757V588H930C1000 585 1060 530 1081 465H1236C1220 535 1195 580 1153 615C1060 618 1010 628 960 640C850 665 740 680 615 683Z",
  h: "M845 17H987V298H1283V17H1425V640Q1355 624 1283 618V427H987V518Q960 545 905 547H845Z",
  dTop: "M1025 44C1130 75 1215 160 1240 260H1087C1070 225 1050 205 1025 190Z",
  wave: "M355 710C600 735 850 712 1000 676C1090 655 1150 652 1210 654C1400 660 1540 705 1645 783C1420 728 1220 722 1050 762C850 810 600 805 355 710Z",
};

// tone="light" is the brand-approved white + maple version for cerulean backgrounds.
export default function DulceeMark({ tone = "brand", className = "" }) {
  const d = tone === "light" ? "#ffffff" : "var(--color-cerulean)";
  const h = "var(--color-maple)";
  const clip = useId(); // unique per instance: the loader and footer marks are on screen together
  return (
    <svg viewBox={MARK.viewBox} className={className} aria-hidden="true">
      <g data-piece>
        {/* D: left stem and lower bowl */}
        <path fill={d} d={MARK.dLeft} />
      </g>
      <g data-piece>
        {/* H in maple */}
        <path fill={h} d={MARK.h} />
      </g>
      <g data-piece>
        {/* D: upper bowl */}
        <path fill={d} d={MARK.dTop} />
      </g>
      <clipPath id={clip}>
        <rect data-wave-clip x="340" y="600" width="1320" height="210" />
      </clipPath>
      {/* the wave under the letters */}
      <path clipPath={`url(#${clip})`} fill={d} d={MARK.wave} />
    </svg>
  );
}
