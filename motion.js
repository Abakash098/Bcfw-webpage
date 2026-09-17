/* Motion primitives: easing, a smoothed scroll signal, and reveal choreography.
 *
 * Deliberately NOT a scroll hijacker. The page keeps native scrolling -- the
 * scrollbar, keyboard paging, find-in-page and momentum all behave normally.
 * What is smoothed is the *value animations read*, which buys the silky feel
 * without taking the scroll away from the user.
 */

export const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- easing ---------- */
export const ease = {
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  outQuint: (t) => 1 - Math.pow(1 - t, 5),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outBack: (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2),
};

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/** Frame-rate independent smoothing: same feel at 60Hz and 144Hz. */
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));

/* ---------- smoothed scroll signal ---------- */
class ScrollSignal {
  constructor() {
    this.raw = window.scrollY;
    this.smooth = this.raw;
    this.velocity = 0;
    this.progress = 0;
    this._subs = new Set();
    this._last = performance.now();

    window.addEventListener("scroll", () => { this.raw = window.scrollY; }, { passive: true });
    if (!REDUCED) requestAnimationFrame(this._tick);
    else this._emitStatic();
  }

  _emitStatic() {
    this.smooth = this.raw;
    this._subs.forEach((fn) => fn(this));
  }

  _tick = (now) => {
    const dt = Math.min((now - this._last) / 1000, 0.05);
    this._last = now;
    const previous = this.smooth;
    // lambda ~9 reads as weighty without feeling laggy
    this.smooth = damp(this.smooth, this.raw, 9, dt);
    this.velocity = (this.smooth - previous) / Math.max(dt, 0.001);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    this.progress = max > 0 ? clamp(this.smooth / max, 0, 1) : 0;
    this._subs.forEach((fn) => fn(this, dt));
    requestAnimationFrame(this._tick);
  };

  onFrame(fn) { this._subs.add(fn); return () => this._subs.delete(fn); }
}

export const scroll = new ScrollSignal();

/* ---------- reveal choreography ----------
   Elements marked [data-reveal] animate in once. Children marked
   [data-stagger] cascade. Under reduced motion everything is simply visible. */
export function initReveals() {
  const targets = document.querySelectorAll("[data-reveal]");

  if (REDUCED) {
    targets.forEach((el) => {
      el.classList.add("is-revealed");
      el.querySelectorAll("[data-stagger] > *, .line-inner").forEach((c) => {
        c.style.transitionDelay = "0ms";
      });
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const step = Number(el.dataset.stagger || 70);
        el.querySelectorAll(":scope [data-stagger-item], :scope .line-inner").forEach((child, i) => {
          child.style.transitionDelay = `${i * step}ms`;
        });
        el.classList.add("is-revealed");
        io.unobserve(el);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );

  targets.forEach((el) => io.observe(el));
}

/** Wrap each line of a heading so it can rise out of a mask. */
export function splitLines(el) {
  const html = el.innerHTML;
  const parts = html.split(/<br\s*\/?>/i);
  el.innerHTML = parts
    .map((part) => `<span class="line"><span class="line-inner">${part.trim()}</span></span>`)
    .join("");
}

/* ---------- pointer ---------- */
export const pointer = { x: 0, y: 0, nx: 0, ny: 0, active: false };

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  pointer.nx = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.ny = (event.clientY / window.innerHeight) * 2 - 1;
  pointer.active = true;
}, { passive: true });

window.addEventListener("pointerleave", () => { pointer.active = false; });

/** Cursor-reactive nudge on a button. Pointer-device only. */
export function magnetic(el, strength = 0.32) {
  if (REDUCED || !window.matchMedia("(hover: hover)").matches) return;
  let raf = null;
  const reset = () => {
    el.style.transform = "";
  };
  el.addEventListener("pointermove", (event) => {
    const rect = el.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      el.style.transform = `translate(${dx * strength}px, ${dy * strength * 0.6}px)`;
    });
  });
  el.addEventListener("pointerleave", reset);
  el.addEventListener("blur", reset);
}
