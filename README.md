# BCF 3D Homepage

Scroll-driven 3D homepage for BCF — Bharat Content Fireworks. Vanilla
Three.js + ES modules, no build step, so it deploys by copying the folder.

## Run

```bash
python -m http.server 8097
```

Then open <http://localhost:8097>. Registered in `.claude/launch.json` as
**BCF 3D v2**.

## Files

| File | Role |
| --- | --- |
| `index.html` | Markup, SEO/social meta, JSON-LD, inline SVG favicon |
| `styles.css` | Brand tokens, layout, reveal + interaction motion |
| `motion.js` | Easing, smoothed scroll signal, reveal choreography, pointer |
| `scene.js` | Three.js particle field — GPU morph, drift, pointer repulsion |
| `app.js` | Content render, arc interaction, nav, counters, form |
| `data.js` | Copy: languages, manifesto, cases, capabilities, stats |
| `images.js` | Wikimedia image URLs + attribution (generated) |

## How the animation works

**The particle field morphs on the GPU.** Two position attributes (`aFrom`,
`aTo`) and one `uMix` uniform, rather than lerping 26,000 points in JS every
frame. Changing beat copies one buffer and restarts the mix. That is what
leaves budget for per-particle drift, twinkle and pointer repulsion while
holding 60fps.

**Scroll is never hijacked.** Native scrolling is untouched — scrollbar,
keyboard paging and find-in-page all behave. What is smoothed is the *value
animations read* (`motion.js` → `ScrollSignal`), which buys the silky feel
without taking scroll away from the user.

**The language arc** places 22 cards on a cylinder but counter-rotates each so
it faces the viewer, with tilt capped at 25°. Without that cap the deck
collapses edge-on and only one card is readable. Scroll turns it one full
revolution; drag and arrow keys also turn it, and it eases to the nearest card
on release. Under 768px the arc is dropped entirely for a plain column.

**Reduced motion** is honoured throughout: no reveals, no choreography, no
loop — one composed static frame and the column instead of the arc.

## Performance

- 26,000 points desktop / 11,000 mobile, DPR capped at 2
- 60fps measured on both
- Render loop stops on `visibilitychange`
- Card images attach on approach; native `loading="lazy"` does **not** fire
  inside a 3D-transformed container, which is why the arc uses `data-src`

## Before launch

Everything below is deliberately unfinished — it needs a real decision, not a
guess.

- [ ] **Wire the contact form.** It validates, has a honeypot and an
      `aria-live` status, but no endpoint. It currently says so out loud
      rather than pretending to send.
- [ ] **Replace placeholder client names, metrics and contact details.**
- [ ] **Swap the Wikimedia photographs for BCF's own film stills.** Then drop
      the credits block, which only exists because CC BY-SA requires it.
- [ ] **Add an `og:image` share card** (1200×630). The tag is intentionally
      absent — a broken image URL previews worse than none.
- [ ] Confirm the canonical URL and JSON-LD `url` match the live domain.

## Images

Hot-linked from Wikimedia Commons via `Special:FilePath`, never downloaded, so
licensing and attribution stay intact. Regenerating the set: the Commons
search API rate-limits at roughly a dozen rapid calls — pace requests ~1.5s
apart, and strip any `NNNpx-` thumbnail prefix or `Special:FilePath` 404s.
Strip HTML tags from `extmetadata` **before** truncating; a half-cut `<a>` tag
breaks whatever you inject it into.
