/* Generates /languages/<slug>/index.html for all 22 languages.
 *
 * These pages exist to rank. Someone searching "bhojpuri ad film agency" is a
 * qualified lead, and one homepage cannot rank for 22 different things.
 *
 * They deliberately carry NO WebGL: 22 pages each booting a 26,000-point
 * particle system would wreck Core Web Vitals on exactly the pages whose job
 * is to be found. The culture photograph carries the brand instead.
 *
 * Run:  node build-languages.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { LANGUAGES } from "./data.js";
import { CULTURE_IMAGES } from "./images.js";
import { LANG_FACTS } from "./langdata.js";
import { FESTIVALS } from "./festivals.js";

const SITE = "https://bcfworks.com";

export const esc = (s) => String(s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const list = (a) => (a.length <= 1 ? (a[0] || "") : `${a.slice(0, -1).join(", ")} and ${a.at(-1)}`);

const FONTS = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=EB+Garamond:ital@0;1"
  + "&family=Hanken+Grotesk:wght@400;700&family=Noto+Sans+Devanagari&family=Noto+Sans+Bengali"
  + "&family=Noto+Sans+Telugu&family=Noto+Sans+Tamil&family=Noto+Sans+Gujarati"
  + "&family=Noto+Sans+Kannada&family=Noto+Sans+Malayalam&family=Noto+Sans+Oriya"
  + "&family=Noto+Sans+Gurmukhi&family=Noto+Naskh+Arabic&display=swap";

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'"
  + "%3E%3Crect width='32' height='32' fill='%230a0804'/%3E%3Ccircle cx='16' cy='16' r='7'"
  + " fill='%23e8650a'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%23f5a623'/%3E%3C/svg%3E";

export function head(title, desc, url, jsonLd, depth = "../../") {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${url}" />
<meta name="theme-color" content="#0a0804" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${url}" />
<link rel="icon" href="${FAVICON}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${FONTS}" rel="stylesheet" />
<link rel="stylesheet" href="${depth}styles.css?v=4" />
<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>
</head>`;
}

export function nav(depth = "../../") {
  return `<a class="skip" href="#main">Skip to content</a>
<header class="nav is-stuck">
  <a class="nav-mark" href="${depth}"><b>BCF<i>.</i></b><span>Bharat Content Fireworks</span></a>
  <nav class="nav-links" aria-label="Primary">
    <a href="${depth}#work">Work</a>
    <a href="${depth}languages/">Languages</a>
    <a href="${depth}#contact">Contact</a>
  </nav>
</header>`;
}

function languagePage(lang) {
  const f = LANG_FACTS[lang.name];
  const img = CULTURE_IMAGES[lang.name];
  const url = `${SITE}/languages/${f.slug}/`;
  const states = list(f.states);
  const fests = FESTIVALS.filter((x) => x.languages.includes(lang.name));

  const title = `${lang.name} Branded Content & Ad Films | BCF`;
  const desc = `Films, reels and festival campaigns made in ${lang.name} for ${states}. `
    + `Written and shot in ${lang.name}, not dubbed from a Hindi master.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: `${lang.name} branded content production`,
    provider: { "@type": "Organization", name: "BCF — Bharat Content Fireworks", url: SITE },
    areaServed: f.states.map((s) => ({ "@type": "AdministrativeArea", name: s })),
    availableLanguage: { "@type": "Language", name: lang.name, alternateName: lang.native },
    url,
  };

  const others = LANGUAGES.filter((l) => l.name !== lang.name).map((l) =>
    `<a class="otherlang" href="../${LANG_FACTS[l.name].slug}/">`
    + `<span class="ol-native" data-script="${l.script}">${l.native}</span>`
    + `<span class="ol-roman">${l.name}</span></a>`).join("");

  const festList = fests.map((x) =>
    `<li><b>${esc(x.name)}</b><span>${esc(x.blurb)}</span></li>`).join("");

  return `${head(title, desc, url, jsonLd)}
<body class="lang-page">
${nav()}
<main id="main">
  <section class="lang-hero">
    <img class="lang-hero-shot" src="${img.url}" alt="" decoding="async" fetchpriority="high" />
    <div class="wrap lang-hero-inner">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="../../">Home</a> <span>/</span> <a href="../">Languages</a> <span>/</span> <b>${lang.name}</b>
      </nav>
      <p class="lang-native" data-script="${lang.script}">${lang.native}</p>
      <h1>${lang.name} that was written in ${lang.name}</h1>
      <p class="lang-sub serif">Films, reels and festival campaigns for ${states} — built in the
        language, not dubbed into it after the fact.</p>
      <a class="cta" href="../../#contact">Start a ${lang.name} brief</a>
    </div>
  </section>

  <div class="stats lang-stats">
    <div class="stat"><b>${f.speakers}M</b><span>First-language speakers</span></div>
    <div class="stat"><b>${f.states.length}</b><span>State${f.states.length === 1 ? "" : "s"}</span></div>
    <div class="stat"><b>${esc(f.scriptName.split(" / ")[0])}</b><span>Script</span></div>
  </div>
  <p class="census-note">Speaker figure: first-language speakers, 2011 Census of India — the most
    recent published count.</p>

  <section class="section">
    <div class="wrap">
      <p class="label">What we make</p>
      <h2>In ${lang.name}, from the brief onward</h2>
      <div class="caps lang-caps">
        <div><h3>Films</h3><ul><li>Brand films</li><li>Festival anthologies</li><li>Founder stories</li></ul></div>
        <div><h3>Reels</h3><ul><li>Platform-native series</li><li>Creator collabs in ${lang.name}</li><li>Meme and trend units</li></ul></div>
        <div><h3>Festival campaigns</h3><ul>${f.festivals.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div><h3>Brand IP</h3><ul><li>Characters and mascots</li><li>Branded shows</li><li>Music properties</li></ul></div>
      </div>
    </div>
  </section>

  ${fests.length ? `<section class="section">
    <div class="wrap">
      <p class="label">When ${lang.name} is loudest</p>
      <h2>Festival windows we plan against</h2>
      <ul class="fest-list">${festList}</ul>
    </div>
  </section>` : ""}

  <section class="section">
    <div class="wrap">
      <p class="label">The work</p>
      <h2>${lang.name} campaigns</h2>
      <p class="placeholder-note">Case studies in ${lang.name} are not published yet. Ask and we will
        send work in this language directly.</p>
      <a class="cta" href="../../#contact">Request the ${lang.name} reel</a>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <p class="label">The other twenty-one</p>
      <h2>Every script its own firework</h2>
      <div class="otherlangs">${others}</div>
    </div>
  </section>

  <footer class="wrap">
    <span>BCF — Bharat Content Fireworks</span>
    <span class="credit-line">Photograph: <a href="${img.source}" target="_blank" rel="noopener noreferrer">${esc(img.subject)}</a>, ${esc(img.credit)}, ${esc(img.licence)}, via Wikimedia Commons</span>
  </footer>
</main>
</body>
</html>
`;
}

function indexPage() {
  const url = `${SITE}/languages/`;
  const title = "22 Indian Languages We Make Content In | BCF";
  const desc = "Branded content, films and reels in 22+ Indian languages — Hindi, Bengali, "
    + "Telugu, Marathi, Tamil, Urdu, Gujarati, Kannada, Malayalam, Odia, Punjabi and more.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url,
    hasPart: LANGUAGES.map((l) => ({
      "@type": "WebPage",
      name: `${l.name} branded content`,
      url: `${SITE}/languages/${LANG_FACTS[l.name].slug}/`,
    })),
  };

  const cards = LANGUAGES.map((l) => {
    const f = LANG_FACTS[l.name];
    const img = CULTURE_IMAGES[l.name];
    return `<a class="langcard" href="./${f.slug}/">
      <img class="shot" src="${img.url}" alt="" loading="lazy" decoding="async" />
      <span class="native" data-script="${l.script}">${l.native}</span>
      <span class="roman">${l.name}</span>
      <span class="meta">${f.speakers}M · ${esc(list(f.states.slice(0, 2)))}</span>
    </a>`;
  }).join("");

  return `${head(title, desc, url, jsonLd, "../")}
<body class="lang-page">
${nav("../")}
<main id="main">
  <section class="section lang-index-hero">
    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="../">Home</a> <span>/</span> <b>Languages</b>
      </nav>
      <p class="label">Twenty-two tongues</p>
      <h1>Every script its own firework</h1>
      <p class="lang-sub serif">We write and shoot in the language. Pick one and see what that
        means for your market.</p>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="langgrid">${cards}</div>
    </div>
  </section>

  <footer class="wrap">
    <span>BCF — Bharat Content Fireworks</span>
    <span class="credit-line">Photographs via Wikimedia Commons; credited on each language page.</span>
  </footer>
</main>
</body>
</html>
`;
}

let count = 0;
for (const lang of LANGUAGES) {
  const f = LANG_FACTS[lang.name];
  if (!f) { console.warn(`  !! no facts for ${lang.name}, skipped`); continue; }
  const dir = new URL(`./languages/${f.slug}/`, import.meta.url);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL("index.html", dir), languagePage(lang), "utf8");
  count++;
}
await writeFile(new URL("./languages/index.html", import.meta.url), indexPage(), "utf8");
console.log(`wrote ${count} language pages + index`);

/* A sitemap matters more than usual here: 23 new pages with no inbound links
   yet are effectively invisible until a crawler is told they exist. */
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: `${SITE}/`, pri: "1.0" },
  { loc: `${SITE}/languages/`, pri: "0.9" },
  ...LANGUAGES.map((l) => ({ loc: `${SITE}/languages/${LANG_FACTS[l.name].slug}/`, pri: "0.8" })),
];
await writeFile(
  new URL("./sitemap.xml", import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>\n`
  + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  + urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.pri}</priority></url>`).join("\n")
  + `\n</urlset>\n`,
  "utf8",
);
await writeFile(
  new URL("./robots.txt", import.meta.url),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
  "utf8",
);
console.log(`wrote sitemap.xml (${urls.length} urls) + robots.txt`);
