// ===== The Sterling Club — 3D silver monogram in the hero =====
// The crowned SC monogram is extruded into polished silver and lit like a
// chrome product shot: a dark room with a few bright strip lights. The flat SVG logo stays visible until this is ready, and
// is what visitors see if WebGL is unavailable.

import * as THREE from "../vendor/three.module.min.js";
import { MONO } from "./mono-data.js";

const canvas = document.getElementById("medallion");
const hero = document.querySelector(".hero");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Dark studio with bright softboxes. Silver only looks like silver when it has dark
// surroundings to reflect between the highlights.
function studio() {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x030303);
  const plane = new THREE.PlaneGeometry(1, 1);
  const softbox = (w, h, x, y, z, power) => {
    const m = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(power), side: THREE.DoubleSide }));
    m.scale.set(w, h, 1);
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    env.add(m);
  };
  softbox(1.1, 7, -3.2, 0.4, 2.2, 7);   // tall strip, front left
  softbox(0.8, 7, 3.4, -0.2, 1.6, 4);   // tall strip, front right
  softbox(9, 0.7, 0, 3.6, 0.6, 6);      // long strip overhead
  softbox(7, 2.2, 0, -0.6, -4.5, 1.4);  // soft fill behind
  // Large board behind the camera, bright at the top left and falling off to dark,
  // so the faces of the letters read as brushed silver and change as the logo turns.
  const board = new THREE.PlaneGeometry(1, 1, 16, 16);
  const pos = board.attributes.position, colors = [];
  for (let i = 0; i < pos.count; i++) {
    const g = Math.max(0, 0.15 + 2.6 * (0.5 + pos.getY(i)) * (0.75 - 0.5 * pos.getX(i)));
    colors.push(g, g, g * 1.02);
  }
  board.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const front = new THREE.Mesh(board, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  front.scale.set(9, 6, 1);
  front.position.set(0, 0.6, 5);
  front.lookAt(0, 0, 0);
  env.add(front);
  return env;
}

const polygon = (pts) => new THREE.Shape(pts.map(([px, py]) => new THREE.Vector2(px, -py)));

function buildMonogram() {
  const silver = new THREE.MeshStandardMaterial({ color: 0xf0f0f3, metalness: 1, roughness: 0.13 });
  // The monogram is one interwoven piece, so it is extruded as a single silver relief.
  // A fine chamfer (kept inside the outline) catches light without closing the thin gaps and highlight lines.
  const shapes = MONO.shapes.map((s) => {
    const shape = polygon(s.outer);
    s.holes.forEach((h) => shape.holes.push(new THREE.Path(h.map(([px, py]) => new THREE.Vector2(px, -py)))));
    return shape;
  });
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: 34, curveSegments: 1, bevelEnabled: true, bevelThickness: 3.5, bevelSize: 1.3, bevelOffset: -1.3, bevelSegments: 1,
  });
  geometry.center();
  const mesh = new THREE.Mesh(geometry, silver);
  const pivot = new THREE.Group();
  pivot.add(mesh);
  pivot.scale.setScalar(1 / MONO.H);
  return pivot;
}

function start() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return; // No WebGL: the flat logo stays.
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studio(), 0.02).texture;

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 0, 3.1);

  const logo = buildMonogram();
  scene.add(logo);

  // A key light that drifts across the face, so highlights slide over the silver.
  const key = new THREE.DirectionalLight(0xffffff, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2);
  rim.position.set(-2, 1.5, -2);
  scene.add(rim);

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the whole logo in view at any canvas shape.
    const fitH = 1.18 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    camera.position.z = Math.max(fitH, fitH * 0.62 / camera.aspect);
    camera.updateProjectionMatrix();
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const t0 = performance.now();
  let last = "";
  function frame(now) {
    const t = (now - t0) / 1000;
    const intro = ease(Math.min(t / 2.2, 1));
    // The gentle sway and drifting light settle after about 5 seconds; after that the logo
    // only moves when the visitor moves the pointer or scrolls.
    const settle = 1 - ease(Math.min(Math.max((t - 3.5) / 2, 0), 1));
    const lt = Math.min(t, 5.5);
    // Scrolling past the first screen spins the logo one full turn (eased), so it faces forward again as it leaves.
    const sp = Math.min(Math.max(window.scrollY / (window.innerHeight * 0.6), 0), 1);
    const spin = sp * sp * (3 - 2 * sp) * Math.PI * 2;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;

    logo.rotation.y = (1 - intro) * -1.4 + Math.sin(t * 0.45) * 0.3 * intro * settle + pointer.x * 0.35 + spin;
    logo.rotation.x = -pointer.y * 0.16 + Math.sin(sp * Math.PI) * 0.28;
    logo.position.y = Math.sin(t * 0.9) * 0.012 * settle;
    key.position.set(Math.sin(lt * 0.6) * 3, 1.6 + Math.cos(lt * 0.4) * 0.6, 2.4);
    // Skip drawing when nothing has visibly changed.
    const state = [logo.rotation.y, logo.rotation.x, logo.position.y, key.position.x].map((v) => v.toFixed(4)).join();
    if (state !== last) { renderer.render(scene, camera); last = state; }
  }

  hero.classList.add("is-3d");
  if (reduceMotion) {
    // One still frame, already facing forward.
    key.position.set(1.6, 1.8, 2.4);
    renderer.render(scene, camera);
    new ResizeObserver(() => renderer.render(scene, camera)).observe(canvas);
    return;
  }

  // Only animate while the hero is on screen.
  let running = false;
  const loop = (now) => { if (!running) return; frame(now); requestAnimationFrame(loop); };
  new IntersectionObserver(([entry]) => {
    const visible = entry.isIntersecting;
    if (visible && !running) { running = true; requestAnimationFrame(loop); }
    if (!visible) running = false;
  }).observe(hero);
}

start();
