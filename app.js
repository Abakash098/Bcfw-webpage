import { createScene } from "./scene.js";
import { LANGUAGES, MANIFESTO, CASES, CAPABILITIES, STATS } from "./data.js";
import { CULTURE_IMAGES } from "./images.js";
import {
  REDUCED, clamp, damp, ease, initReveals, magnetic, scroll, splitLines,
} from "./motion.js";

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ---------- content ---------- */
const shot = (l) => {
  const img = CULTURE_IMAGES[l.name];
  if (!img) return "";
  return `<img class="shot" data-src="${img.url}" alt="" decoding="async"
    title="${img.subject} — ${img.credit} (${img.licence})" />`;
};

function renderContent() {
  $("#manifesto-list").innerHTML = MANIFESTO.map(
    (m) => `<div class="manifesto-row scrim" data-reveal data-stagger="90">
      <div class="num" data-stagger-item>${m.n}</div>
      <div><h3 data-stagger-item>${m.head}</h3><p data-stagger-item>${m.body}</p></div>
    </div>`,
  ).join("");

  $("#arc").innerHTML = LANGUAGES.map(
    (l, i) => `<article class="lang-card" data-i="${i}" data-script="${l.script}"
      role="listitem" aria-label="${l.name}">
      ${shot(l)}
      <span class="idx">${l.n}</span>
      <span class="native">${l.native}</span>
      <span class="roman">${l.name}</span>
    </article>`,
  ).join("");

  $("#lang-column").innerHTML = LANGUAGES.map(
    (l) => `<div class="lang-cell" data-script="${l.script}" data-stagger-item>
      ${shot(l).replace("data-src", 'loading="lazy" src')}
      <span class="native">${l.native}</span>
      <span class="roman">${l.name}</span>
    </div>`,
  ).join("");

  $("#work-grid").innerHTML = CASES.map(
    (c) => `<article class="tile" data-stagger-item tabindex="0">
      <span class="fmt">${c.format}</span>
      <div><h3>${c.n}</h3><p>${c.client}</p></div>
      <p class="metric">Metric — placeholder</p>
    </article>`,
  ).join("");

  $("#caps-grid").innerHTML = CAPABILITIES.map(
    (c) => `<div data-stagger-item><span class="label">${c.n}</span><h3>${c.head}</h3>
      <ul>${c.items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`,
  ).join("");

  $("#stats").innerHTML = STATS.map(
    (s) => `<div class="stat" data-stagger-item>
      <b data-to="${s.value}" data-suffix="${s.suffix}">0${s.suffix}</b>
      <span>${s.label}</span></div>`,
  ).join("");

  $("#credits-list").innerHTML = LANGUAGES.map((l) => {
    const img = CULTURE_IMAGES[l.name];
    if (!img) return "";
    return `<li><b>${l.name}</b> — <a href="${img.source}" target="_blank"
      rel="noopener noreferrer">${img.subject}</a>, ${img.credit}, ${img.licence},
      via Wikimedia Commons</li>`;
  }).join("");
}

/* ---------- nav ---------- */
function bindNav() {
  const nav = $(".nav");
  const drawer = $("#drawer");
  const burger = $("#burger");
  const close = $("#drawer-close");
  let lastFocus = null;

  scroll.onFrame(() => nav.classList.toggle("is-stuck", scroll.raw > 80));

  const open = () => {
    lastFocus = document.activeElement;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    close.focus();
  };
  const shut = () => {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };

  burger.addEventListener("click", open);
  close.addEventListener("click", shut);
  drawer.querySelectorAll("a").forEach((a) => a.addEventListener("click", shut));

  document.addEventListener("keydown", (event) => {
    if (!drawer.classList.contains("is-open")) return;
    if (event.key === "Escape") return shut();
    if (event.key !== "Tab") return;
    const items = [...drawer.querySelectorAll("a, button")];
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
}

/* ---------- counters ---------- */
function bindCounters() {
  const seen = new WeakSet();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      seen.add(entry.target);
      const el = entry.target;
      const to = Number(el.dataset.to);
      const suffix = el.dataset.suffix || "";
      if (REDUCED) { el.textContent = to + suffix; return; }
      const started = performance.now();
      const tick = (now) => {
        const p = Math.min((now - started) / 1400, 1);
        el.textContent = Math.round(to * ease.outExpo(p)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  $$(".stat b").forEach((el) => io.observe(el));
}

/* ---------- the language arc ----------
   Cards sit on a cylinder but counter-rotate to face the viewer, with the
   facing angle capped. Scroll turns it; drag and arrow keys also turn it, and
   when the user lets go it eases to the nearest card rather than stopping
   mid-gap. */
const R = 540;
const MAX_TILT = 25;
const STEP = 360 / LANGUAGES.length;

const arc = {
  base: 0,        // from scroll
  offset: 0,      // from drag / keyboard
  shown: 0,       // smoothed value actually rendered
  velocity: 0,
  dragging: false,
  interacted: false,
};

function layoutArc(rotation) {
  const cards = $$(".lang-card");
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    let angle = i * STEP - rotation;
    angle = ((angle % 360) + 540) % 360 - 180;
    const rad = (angle * Math.PI) / 180;
    const abs = Math.abs(angle);

    if (abs < 120) {
      const img = card.querySelector(".shot[data-src]");
      if (img) { img.src = img.dataset.src; img.removeAttribute("data-src"); }
    }

    const tilt = clamp(angle * 0.28, -MAX_TILT, MAX_TILT);
    const opacity = abs > 95 ? 0 : abs > 65 ? 1 - (abs - 65) / 30 : 1;
    const centre = abs < STEP / 2;

    card.style.transform =
      `translate3d(${Math.sin(rad) * R}px, 0, ${Math.cos(rad) * R - R}px) `
      + `rotateY(${tilt}deg) scale(${centre ? 1.15 : 1})`;
    card.style.opacity = opacity.toFixed(3);
    card.style.zIndex = String(Math.round(1000 - abs));
    card.classList.toggle("is-centre", centre);
    card.setAttribute("aria-current", centre ? "true" : "false");
  }
}

function bindArc() {
  const stage = $(".arc-stage");
  if (!stage) return;

  let pointerId = null;
  let lastX = 0;

  stage.addEventListener("pointerdown", (event) => {
    if (REDUCED) return;
    pointerId = event.pointerId;
    lastX = event.clientX;
    arc.dragging = true;
    arc.interacted = true;
    stage.setPointerCapture(pointerId);
    stage.classList.add("is-dragging");
  });

  stage.addEventListener("pointermove", (event) => {
    if (!arc.dragging || event.pointerId !== pointerId) return;
    const dx = event.clientX - lastX;
    lastX = event.clientX;
    arc.offset -= dx * 0.28;
    arc.velocity = -dx * 0.28;
  });

  const release = () => {
    if (!arc.dragging) return;
    arc.dragging = false;
    stage.classList.remove("is-dragging");
  };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);

  stage.setAttribute("tabindex", "0");
  stage.setAttribute("role", "list");
  stage.setAttribute("aria-label", "Languages we work in — use arrow keys to turn");
  stage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { arc.offset += STEP; arc.interacted = true; event.preventDefault(); }
    if (event.key === "ArrowLeft") { arc.offset -= STEP; arc.interacted = true; event.preventDefault(); }
  });
}

/* ---------- work tiles ---------- */
function bindTiles() {
  if (REDUCED || !window.matchMedia("(hover: hover)").matches) return;
  $$(".tile").forEach((tile) => {
    tile.addEventListener("pointermove", (event) => {
      const rect = tile.getBoundingClientRect();
      tile.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      tile.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    });
  });
}

/* ---------- contact form ---------- */
function bindForm() {
  const form = $("#contact-form");
  const status = $("#form-status");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Honeypot: real people leave this hidden field empty.
    if (form.querySelector('[name="company_website"]').value) return;

    const invalid = [...form.querySelectorAll("[required]")].filter((f) => !f.value.trim());
    form.querySelectorAll("[required]").forEach((f) => {
      f.setAttribute("aria-invalid", f.value.trim() ? "false" : "true");
    });

    if (invalid.length) {
      status.textContent = "Add your name and brand so we know who is asking.";
      status.className = "form-status is-bad";
      invalid[0].focus();
      return;
    }

    // No endpoint is wired yet, and inventing one would silently drop enquiries.
    status.textContent =
      "Form is not connected yet — point it at your form handler before launch.";
    status.className = "form-status is-warn";
  });
}

/* ---------- beats ---------- */
function bindBeats(scene) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      scene.setBeat(Number(el.dataset.beat));
      // Copy-heavy sections drop the field so Garamond stays readable.
      scene.setOpacity(el.dataset.dim === "true" ? 0.35 : 1);
      scene.setSpin(Number(el.dataset.spin ?? 0.05));
    });
  }, { threshold: 0.35 });
  $$("[data-beat]").forEach((b) => io.observe(b));
}

/* ---------- boot ---------- */
renderContent();
$$("[data-split]").forEach(splitLines);
bindNav();
bindCounters();
bindArc();
bindTiles();
bindForm();
initReveals();
$$(".cta").forEach((el) => magnetic(el));

const scene = createScene($("#scene"));
bindBeats(scene);

/* Hero choreography: ignite the field, then let the masked lines rise.
 *
 * This must NOT hang off requestAnimationFrame alone. A page opened in a
 * background tab never gets a frame, so the hero would stay blank until the
 * user switched to it -- and with the loop paused, forever after. setTimeout
 * still fires when hidden, and the visibility handler covers the rest. */
let heroReleased = false;
function releaseHero() {
  if (heroReleased) return;
  heroReleased = true;
  scene.ignite();
  document.body.classList.add("is-ready");
}

if (document.hidden) {
  document.addEventListener("visibilitychange", releaseHero, { once: true });
  // Reveal the copy immediately even while hidden; only the burst waits.
  document.body.classList.add("is-ready");
} else {
  setTimeout(releaseHero, 60);
}

const progress = $("#progress");
const stage = $(".arc-stage");
layoutArc(0);

scroll.onFrame((signal, dt = 0.016) => {
  progress.style.transform = `scaleX(${signal.progress})`;

  // Scroll speed pumps energy into the field, so fast scrolling feels alive.
  scene.setEnergy(clamp(Math.abs(signal.velocity) / 2600, 0, 1));

  if (!stage || REDUCED) return;
  const rect = stage.getBoundingClientRect();
  if (rect.top > window.innerHeight || rect.bottom < 0) return;

  // One full turn across the section: all 22 scripts pass the centre once.
  const through = 1 - (rect.top + rect.height) / (window.innerHeight + rect.height);
  arc.base = through * 360;

  if (!arc.dragging) {
    arc.offset += arc.velocity;
    arc.velocity = damp(arc.velocity, 0, 6, dt);
    // Once the throw has died down, settle on a card instead of a gap.
    if (arc.interacted && Math.abs(arc.velocity) < 0.35) {
      const total = arc.base + arc.offset;
      const snapped = Math.round(total / STEP) * STEP;
      arc.offset = damp(arc.offset, snapped - arc.base, 4.5, dt);
    }
  }

  arc.shown = damp(arc.shown, arc.base + arc.offset, 11, dt);
  layoutArc(arc.shown);
});

window.__bcf = { scene, layoutArc, arc, get rotation() { return arc.shown; } };
