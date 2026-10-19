// Turns the client's full-size photos (resources/, not in git) into web sizes in public/photos/.
// Run after adding or swapping a photo: npm run photos
import sharp from "sharp";
import { mkdirSync } from "node:fs";

// web name -> source file in resources/
const PHOTOS = {
  "room-king": "IMG_9275.jpg",
  "bedside": "IMG_1427 - Copy (2) - Copy.jpg",
  "desk-lamp": "IMG_9353.jpg",
  "sinks": "IMG_9306.jpg",
  "shower": "IMG_9264.jpg",
  "room-twin": "IMG_9373.jpg",
  "suite-lounge": "IMG_9249.jpg",
  "lobby-team": "IMG_9465.jpg",
  "lobby-lounge": "IMG_9454.jpg",
};
const WIDTHS = [960, 1920];

mkdirSync("public/photos", { recursive: true });
for (const [name, file] of Object.entries(PHOTOS)) {
  for (const w of WIDTHS) {
    await sharp(`resources/${file}`).rotate().resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78 }).toFile(`public/photos/${name}-${w}.webp`);
  }
  console.log("ok", name);
}
