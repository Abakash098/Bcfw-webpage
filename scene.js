import * as THREE from "three";
import { REDUCED, clamp, damp, ease, pointer } from "./motion.js?v=2";

const MOBILE = window.matchMedia("(max-width: 767px)").matches;
const COUNT = MOBILE ? 9000 : 26000;

const PALETTE = [
  new THREE.Color("#e8650a"), // saffron
  new THREE.Color("#f5a623"), // marigold
  new THREE.Color("#8b1a1a"), // crimson
  new THREE.Color("#ffd27a"), // ember highlight, used sparingly
];

/* The morph runs on the GPU: two position attributes and one mix uniform,
   instead of lerping 26,000 points in JavaScript every frame. That is what
   leaves frame budget for the drift and pointer work below. */
const VERT = `
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute float aScale;
  attribute float aSeed;
  attribute vec3 aColor;

  uniform float uMix;
  uniform float uTime;
  uniform float uSize;
  uniform float uEnergy;
  uniform vec3  uPointer;
  uniform float uPointerStrength;

  varying vec3  vColor;
  varying float vFade;
  varying float vTwinkle;

  void main() {
    vec3 pos = mix(aFrom, aTo, uMix);

    // Organic drift. Cheap trig standing in for curl noise -- at this point
    // count the visual difference does not justify a noise texture fetch.
    float t = uTime * 0.35 + aSeed * 6.2831;
    vec3 drift = vec3(
      sin(t + pos.z * 0.006),
      cos(t * 0.9 + pos.x * 0.006),
      sin(t * 1.1 + pos.y * 0.006)
    );
    pos += drift * (9.0 + uEnergy * 26.0);

    // Pointer pushes the field away, falling off with distance.
    vec3 away = pos - uPointer;
    float dist = length(away);
    pos += normalize(away + 0.0001) * uPointerStrength * 150.0 / (1.0 + dist * dist * 0.0009);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float depth = -mv.z;

    vColor = aColor;
    vTwinkle = 0.65 + 0.35 * sin(uTime * 2.2 + aSeed * 40.0);
    // Fade distant points, and points that swing near the camera plane --
    // without the near fade they balloon into blobs over the copy.
    vFade = smoothstep(-1400.0, -280.0, mv.z) * smoothstep(60.0, 300.0, depth);

    gl_Position = projectionMatrix * mv;
    gl_PointSize = min(uSize * aScale * (300.0 / max(depth, 120.0)), 22.0);
  }
`;

const FRAG = `
  varying vec3  vColor;
  varying float vFade;
  varying float vTwinkle;
  uniform float uOpacity;

  void main() {
    vec2 d = gl_PointCoord - vec2(0.5);
    float r2 = dot(d, d);
    if (r2 > 0.25) discard;
    float glow = 1.0 - smoothstep(0.0, 0.25, r2);
    glow *= glow;
    gl_FragColor = vec4(vColor, glow * uOpacity * vFade * vTwinkle);
  }
`;

function buildTargets(count) {
  const sphere = new Float32Array(count * 3);
  const helix = new Float32Array(count * 3);
  const disperse = new Float32Array(count * 3);
  const embers = new Float32Array(count * 3);
  const core = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const j = i * 3;

    const u = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const rad = 120 + 210 * Math.cbrt(Math.random()) * 0.55;
    sphere[j] = Math.cos(theta) * s * rad;
    sphere[j + 1] = u * rad;
    sphere[j + 2] = Math.sin(theta) * s * rad;

    const t = i / count;
    const turns = t * Math.PI * 2 * 7;
    const hr = 165 + Math.sin(t * 26) * 22;
    helix[j] = Math.cos(turns) * hr + (Math.random() - 0.5) * 24;
    helix[j + 1] = (0.5 - t) * 900;
    helix[j + 2] = Math.sin(turns) * hr + (Math.random() - 0.5) * 24;

    // Symmetric both sides, pushed behind the card arc.
    const side = i % 2 === 0 ? 1 : -1;
    disperse[j] = side * (400 + Math.random() * 280);
    disperse[j + 1] = (Math.random() - 0.5) * 780;
    disperse[j + 2] = (Math.random() - 0.5) * 300 - 340;

    embers[j] = (Math.random() - 0.5) * 1150;
    embers[j + 1] = (Math.random() - 0.5) * 920;
    embers[j + 2] = (Math.random() - 0.5) * 380 - 120;

    core[j] = (Math.random() - 0.5) * 22;
    core[j + 1] = (Math.random() - 0.5) * 22;
    core[j + 2] = (Math.random() - 0.5) * 22;
  }
  return [core, sphere, helix, disperse, embers];
}

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: false, alpha: true, powerPreference: "high-performance",
  });
  // A full-screen particle canvas at DPR 3 drains a phone battery for no
  // visible gain, so phones render a little softer.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MOBILE ? 1.75 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 1, 3000);
  camera.position.set(0, 0, 620);

  const SHAPES = buildTargets(COUNT);
  const scales = new Float32Array(COUNT);
  const seeds = new Float32Array(COUNT);
  const colors = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    scales[i] = 0.4 + Math.random() * 1.5;
    seeds[i] = Math.random();
    // The ember highlight is rare, so the field stays saffron not yellow.
    const c = PALETTE[Math.random() < 0.08 ? 3 : (Math.random() * 3) | 0];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
  geometry.setAttribute("aFrom", new THREE.BufferAttribute(new Float32Array(SHAPES[0]), 3));
  geometry.setAttribute("aTo", new THREE.BufferAttribute(new Float32Array(SHAPES[1]), 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  // Positions live in the shader, so the computed bounds would be wrong.
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2200);

  const uniforms = {
    uMix: { value: 0 },
    uTime: { value: 0 },
    uSize: { value: MOBILE ? 13 : 17 },
    uEnergy: { value: 0 },
    uOpacity: { value: 0 },
    uPointer: { value: new THREE.Vector3(0, 0, 9999) },
    uPointerStrength: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, uniforms,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const state = { shape: 1, mix: 1, opacity: 1, running: true, energy: 0, spin: 0.05 };

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  /** Swap the morph endpoints once, then animate the single mix uniform. */
  function goTo(index) {
    const next = clamp(index, 0, SHAPES.length - 1);
    if (next === state.shape) return;
    geometry.attributes.aFrom.array.set(geometry.attributes.aTo.array);
    geometry.attributes.aFrom.needsUpdate = true;
    geometry.attributes.aTo.array.set(SHAPES[next]);
    geometry.attributes.aTo.needsUpdate = true;
    state.mix = 0;
    state.shape = next;
  }

  const clock = new THREE.Clock();
  const pointerWorld = new THREE.Vector3();

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    uniforms.uTime.value += dt;

    state.mix = damp(state.mix, 1, 3.4, dt);
    uniforms.uMix.value = ease.outQuint(clamp(state.mix, 0, 1));
    uniforms.uOpacity.value = damp(uniforms.uOpacity.value, state.opacity, 4, dt);
    uniforms.uEnergy.value = damp(uniforms.uEnergy.value, state.energy, 2.6, dt);

    if (pointer.active && !MOBILE) {
      pointerWorld.set(pointer.nx * 520, -pointer.ny * 360, 120);
      uniforms.uPointer.value.copy(pointerWorld);
      uniforms.uPointerStrength.value = damp(uniforms.uPointerStrength.value, 1, 3, dt);
    } else {
      uniforms.uPointerStrength.value = damp(uniforms.uPointerStrength.value, 0, 3, dt);
    }

    points.rotation.y += dt * state.spin;
    renderer.render(scene, camera);
  }

  function loop() {
    if (!state.running) return;
    frame();
    requestAnimationFrame(loop);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      state.running = false;
    } else if (!REDUCED) {
      state.running = true;
      clock.getDelta();
      loop();
    }
  });

  if (REDUCED) {
    // One composed static frame. No loop, no choreography.
    uniforms.uMix.value = 1;
    uniforms.uOpacity.value = 1;
    renderer.render(scene, camera);
    state.running = false;
  } else {
    loop();
  }

  return {
    /** Ignition: held in the core, then burst out to the shell. */
    ignite() {
      if (REDUCED) return;
      geometry.attributes.aFrom.array.set(SHAPES[0]);
      geometry.attributes.aFrom.needsUpdate = true;
      geometry.attributes.aTo.array.set(SHAPES[1]);
      geometry.attributes.aTo.needsUpdate = true;
      state.shape = 1;
      state.mix = 0;
      state.opacity = 1;
    },
    setBeat(beat) { goTo(beat + 1); },
    setOpacity(v) { state.opacity = v; },
    setEnergy(v) { state.energy = clamp(v, 0, 1); },
    setSpin(v) { state.spin = v; },
    get reduced() { return REDUCED; },
    get count() { return COUNT; },
  };
}
