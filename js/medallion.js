// ===== The Sterling Club — 3D silver monogram in the hero =====
// It turns continuously and glints like polished sterling; the hero's pause button stops it.
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

  // A key light that keeps circling the logo, so reflections slide across the silver as it turns.
  const key = new THREE.DirectionalLight(0xffffff, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2);
  rim.position.set(-2, 1.5, -2);
  scene.add(rim);

  // Glints: small four-point stars that flash on the logo's edges, like light catching polished sterling.
  const glintTexture = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const core = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    core.addColorStop(0, "rgba(255,255,255,1)");
    core.addColorStop(0.12, "rgba(255,255,255,.85)");
    core.addColorStop(0.35, "rgba(255,255,255,.12)");
    core.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = core;
    g.fillRect(0, 0, 128, 128);
    g.globalCompositeOperation = "lighter";
    for (const [w, h] of [[128, 4], [4, 128]]) {
      const ray = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      ray.addColorStop(0, "rgba(255,255,255,.95)");
      ray.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = ray;
      g.fillRect(64 - w / 2, 64 - h / 2, w, h);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  })();
  // Candidate spots: points on the front face's outlines.
  const mesh = logo.children[0];
  const pos = mesh.geometry.attributes.position;
  let maxZ = -Infinity;
  for (let i = 0; i < pos.count; i++) maxZ = Math.max(maxZ, pos.getZ(i));
  const spots = [];
  for (let i = 0; i < pos.count; i += 3) if (pos.getZ(i) > maxZ - 0.5) spots.push(new THREE.Vector3(pos.getX(i), pos.getY(i), maxZ + 3));
  const glints = Array.from({ length: 4 }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glintTexture, color: 0xfff8ee, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    s.userData.born = -1;
    mesh.add(s);
    return s;
  });
  let nextGlint = 1.2;
  function updateGlints(t, facing) {
    if (t > nextGlint && facing > 0.35 && spots.length) {
      const g = glints.find((s) => s.userData.born < 0);
      if (g) {
        g.position.copy(spots[Math.floor(Math.random() * spots.length)]);
        g.position.z *= mesh.scale.x; // on whichever face is toward the viewer
        g.userData.born = t;
        g.userData.size = 170 + Math.random() * 110;
      }
      nextGlint = t + 0.3 + Math.random() * 0.7;
    }
    for (const g of glints) {
      if (g.userData.born < 0) continue;
      const life = (t - g.userData.born) / 0.9;
      if (life >= 1) { g.userData.born = -1; g.material.opacity = 0; continue; }
      const k = Math.sin(life * Math.PI);
      g.material.opacity = k * Math.max(facing, 0);
      g.material.rotation = life * 1.2;
      g.scale.setScalar(g.userData.size * (0.4 + 0.6 * k));
    }
  }

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
  let lastNow = t0, turn = 0, paused = false;
  function frame(now) {
    const t = (now - t0) / 1000;
    const dt = Math.min((now - lastNow) / 1000, 0.1);
    lastNow = now;
    const intro = ease(Math.min(t / 2.2, 1));
    // A slow, continuous turn: one full revolution about every 10 seconds (stops while paused).
    if (!paused) turn += dt * ((Math.PI * 2) / 10) * intro;
    // Scrolling past the first screen adds one extra full turn (eased).
    const sp = Math.min(Math.max(window.scrollY / (window.innerHeight * 0.6), 0), 1);
    const spin = sp * sp * (3 - 2 * sp) * Math.PI * 2;
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;

    logo.rotation.y = (1 - intro) * -1.4 + turn + pointer.x * 0.35 + spin;
    logo.rotation.x = -pointer.y * 0.16 + Math.sin(sp * Math.PI) * 0.28;
    logo.position.y = paused ? 0 : Math.sin(t * 0.9) * 0.012;
    const lt = paused ? 0 : t;
    key.position.set(Math.sin(lt * 0.8) * 3, 1.6 + Math.cos(lt * 0.5) * 0.8, 2.4 + Math.cos(lt * 0.8) * 0.8);
    // Both faces read as "SC": while the back faces the viewer the model is mirrored. The swap happens
    // when the logo is edge-on and paper-thin, so it can't be seen.
    const facing = Math.cos(logo.rotation.y);
    const side = facing < 0 ? -1 : 1;
    if (mesh.scale.x !== side) {
      mesh.scale.x = side;
      glints.forEach((g) => { g.userData.born = -1; g.material.opacity = 0; });
    }
    if (!paused) updateGlints(t, Math.abs(facing));
    renderer.render(scene, camera);
  }

  // Pause button: anything that moves on its own for more than 5 seconds needs one (WCAG 2.2.2).
  const pauseBtn = document.querySelector(".hero-pause");
  if (pauseBtn && !reduceMotion) {
    pauseBtn.hidden = false;
    pauseBtn.addEventListener("click", () => {
      paused = !paused;
      pauseBtn.setAttribute("aria-pressed", String(paused));
      pauseBtn.setAttribute("aria-label", paused ? "Play logo animation" : "Pause logo animation");
      glints.forEach((g) => { g.userData.born = -1; g.material.opacity = 0; });
    });
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
