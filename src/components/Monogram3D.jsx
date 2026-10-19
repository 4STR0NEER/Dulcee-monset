import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { MARK } from "./DulceeMark";

// The DH monogram in 3D, extruded from the same paths as the flat logo. White-and-maple, the
// brand-approved pairing on cerulean. Spins in on arrival, then sways and leans toward the cursor.
// Lazy-loaded (three.js is heavy) and renders only while on screen.
export default function Monogram3D({ onFail }) {
  const host = useRef(null);

  useEffect(() => {
    const el = host.current;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      onFail?.(); // no WebGL: the caller shows the flat logo instead
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 9);
    const key = new THREE.DirectionalLight(0xfff1dc, 1.6);
    key.position.set(3, 4, 6);
    scene.add(key);

    // materials: pearl white for the D and wave, polished maple metal for the H
    const pearl = new THREE.MeshPhysicalMaterial({ color: 0xf3f5f6, metalness: 0.15, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15 });
    const maple = new THREE.MeshPhysicalMaterial({ color: 0xb18f59, metalness: 0.9, roughness: 0.28, clearcoat: 0.6 });

    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><path d="${MARK.dLeft}"/><path d="${MARK.h}"/><path d="${MARK.dTop}"/><path d="${MARK.wave}"/></svg>`;
    const parts = new THREE.Group();
    const geometries = [];
    new SVGLoader().parse(svg).paths.forEach((path, i) => {
      const geo = new THREE.ExtrudeGeometry(SVGLoader.createShapes(path), {
        depth: i === 3 ? 40 : 70, // the wave sits a little thinner, like a base
        bevelEnabled: true,
        bevelThickness: 8,
        bevelSize: 5,
        bevelSegments: 4,
        curveSegments: 32,
      });
      geometries.push(geo);
      parts.add(new THREE.Mesh(geo, i === 1 ? maple : pearl));
    });
    // svg y points down and the mark is ~1300 units wide: flip, centre and scale to ~3.4 units
    const box = new THREE.Box3().setFromObject(parts);
    const centre = box.getCenter(new THREE.Vector3());
    parts.position.set(-centre.x, -centre.y, -centre.z);
    const mark = new THREE.Group();
    mark.add(parts);
    mark.scale.set(1 / 380, -1 / 380, 1 / 380);
    const rig = new THREE.Group(); // rig carries the motion, so scale and flip stay untouched
    rig.add(mark);
    scene.add(rig);

    const size = () => {
      const { width, height } = el.getBoundingClientRect();
      renderer.setSize(width, height, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    size();
    const ro = new ResizeObserver(() => {
      size();
      if (!running) renderer.render(scene, camera);
    });
    ro.observe(el);

    // pointer lean (desktop): target angles the rig eases toward
    const lean = { x: 0, y: 0 };
    const onPointer = (e) => {
      lean.y = (e.clientX / innerWidth - 0.5) * 0.6;
      lean.x = (e.clientY / innerHeight - 0.5) * 0.35;
    };
    addEventListener("pointermove", onPointer, { passive: true });

    let raf = 0;
    let running = false;
    let born = null; // time the monogram first came into view
    const ease = (t) => 1 - (1 - t) ** 4;

    const frame = (now) => {
      born ??= now;
      const t = (now - born) / 1000;
      const arrive = ease(Math.min(t / 1.8, 1)); // spin in from a quarter turn
      const sway = Math.sin(t * 0.6) * 0.32 * arrive;
      rig.rotation.y += (lean.y + sway - (1 - arrive) * Math.PI * 0.5 - rig.rotation.y) * 0.08;
      rig.rotation.x += (lean.x - rig.rotation.x) * 0.06;
      rig.position.y = Math.sin(t * 0.9) * 0.06 * arrive; // a slow float
      rig.scale.setScalar(0.85 + 0.15 * arrive);
      renderer.render(scene, camera);
      raf = running ? requestAnimationFrame(frame) : 0;
    };

    if (reduce) {
      renderer.render(scene, camera); // one still frame
    } else {
      rig.rotation.y = -Math.PI * 0.5;
    }

    const io = new IntersectionObserver(([entry]) => {
      if (reduce) return;
      running = entry.isIntersecting;
      if (running && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(el);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      removeEventListener("pointermove", onPointer);
      geometries.forEach((g) => g.dispose());
      pearl.dispose();
      maple.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onFail]);

  return <div ref={host} className="h-full w-full" aria-hidden="true" />;
}
