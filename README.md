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

## Phone

The phone build is not the desktop build with things switched off.

The arc is the signature moment of the languages section, and it does not
survive a 375px screen — the desktop fallback was a static 11-row grid, which
threw the whole gesture away. Under 768px the section becomes a **snap-scrolling
gallery**: one card at a time, photograph full bleed, script large, with the
neighbouring cards peeking so it reads as swipeable. A counter and rail show
position, so "22 languages" still lands. Scrolling is native `overflow-x`, so
momentum, accessibility and the scrollbar are the browser's, not ours.

Mobile-specific things that were wrong and are now fixed:

- **Form inputs were 15.2px.** iOS Safari zooms the page whenever a focused
  input is under 16px, and the user has to pinch back out. Now exactly 16px.
- **No safe-area insets.** The wordmark sat under the notch in landscape and
  the footer under the home indicator. Nav, drawer and footer now use
  `env(safe-area-inset-*)`.
- **Default blue tap flash** on every touch, badly off-brand. Now saffron.
- **The drawer scroll chained to the page** behind it. `overscroll-behavior:
  contain`.
- **Touch targets under 44px**, the hamburger worst at 32px. Now 44px.
  The attribution links stay at 27px, which clears the WCAG 2.5.8 minimum of
  24px — bringing a 22-item reference list to 44px each would bloat it.
- Phones render at **9,000 points and DPR 1.75**. A full-screen particle
  canvas at DPR 3 drains a battery for no visible gain.

## Cache busting

Asset URLs carry `?v=N`, **including the ES module imports inside app.js and
scene.js**. Versioning only the entry point is not enough: the browser will
happily pair a fresh `app.js` with a cached `scene.js`, which is exactly how a
deploy ships half-new code. Bump every `?v=` together when deploying.

**Reduced motion** is honoured throughout: no reveals, no choreography, no
loop — one composed static frame and the column instead of the arc.


## Festival mode

The site re-skins itself around the festival the country is actually in —
17 of them, covering all 22 languages and every month except May and June.
A strip under the nav names it, links to the languages it touches, and the
particle field takes its palette. Brand tokens are untouched: a festival
tints the fireworks, it does not repaint the company.

Preview any of them out of season with `?festival=<id>`, e.g.
`?festival=diwali`. `?festival=none` turns it off.

**The dates are a maintenance contract, not a computation.** Most Indian
festivals are lunar or luni-solar and move by up to a month between Gregorian
years; the Islamic ones shift ~11 days earlier annually. `festivals.js` holds
one table of explicit `from`/`to` windows, currently **verified for 2026 only**.
Check them against a panchang before each year and edit that table — nothing
else needs touching.

## Language pages

`/languages/<slug>/` for all 22, plus an index at `/languages/`. These exist
to rank: someone searching "bhojpuri ad film agency" is a qualified lead, and
one homepage cannot rank for 22 different things.

Generated — do not hand-edit:

```bash
node build-languages.mjs
```

It also writes `sitemap.xml` and `robots.txt`. Regenerate after touching
`data.js`, `images.js`, `langdata.js` or `festivals.js`.

They carry **no WebGL** on purpose. 22 pages each booting a 26,000-point
particle system would wreck Core Web Vitals on exactly the pages whose job is
to be found; the culture photograph carries the brand instead.

Speaker figures are first-language speakers from the **2011 Census of India**,
the last published one, and each page says so. Where a figure is contested the
field is left null and simply not printed — an omitted number beats a
confident wrong one. No page claims BCF work that does not exist; the work
section asks for the reel instead.

## Particle shapes

Shapes are **named, not indexed** (`sphere`, `helix`, `disperse`, `embers`,
`mark`), selected per section by `data-shape`. An earlier positional version
used `beat + 1` arithmetic, so appending the wordmark silently re-pointed the
contact section at it. Named shapes make that class of bug impossible.

`mark` is the BCF wordmark, sampled off a 2D canvas by rasterising the real
typeface — change the text or the font and the shape follows. It sets spin to
zero and unwinds accumulated rotation, because a wordmark read at an angle is
not a wordmark. 

Four things keep the letterforms readable, and all four matter:

- **Even distribution, not random sampling.** Sampling lit pixels *with
  replacement* clumps: some collect five points while their neighbours get
  none, and the glyphs turn to mush. The hit list is shuffled and walked.
- **Shallow depth.** Perspective inflates near points, so a wide z-spread
  blurs the shape on its own. It is ±4.5 units, not ±40.
- **Smaller, dimmer points.** Additive blending saturates to white at
  density. The section carries `data-size="0.5"`, halving point size through
  a `uSizeScale` uniform so the mark reads as a shape, not a glow.
- **Letter spacing.** Rendered as clouds rather than solids, B, C and F bleed
  together without it.

Scale is derived from the visible frustum and rebuilt on resize rather than
hardcoded — about 34% of height in landscape, 78% of width in portrait where
width binds instead. Zero-size containers are guarded: otherwise the aspect
goes NaN and permanently poisons every position in the buffer.

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
