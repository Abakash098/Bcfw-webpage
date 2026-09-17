/* Festival mode.
 *
 * The site re-skins itself around the festival the country is actually in.
 * "Festival campaigns" is a service line, so the calendar is the business
 * calendar, not decoration.
 *
 * ---------------------------------------------------------------------------
 * DATES ARE NOT COMPUTED, AND THEY MUST BE CHECKED EVERY YEAR.
 *
 * Most of these follow lunar or luni-solar reckoning and move by up to a month
 * between Gregorian years; the Islamic ones shift ~11 days earlier annually.
 * Only the solar ones (Sankranti/Pongal/Bihu/Baisakhi/Vishu/Puthandu and
 * Christmas) sit on fixed dates.
 *
 * Every entry below carries an explicit `from`/`to` window. Treat the lunar
 * ones as APPROXIMATE: verify against a panchang before each year starts and
 * edit this one table. Nothing else in the codebase needs touching.
 *
 * Verified through: 2026 entries only. 2027 onward WILL be wrong.
 * ---------------------------------------------------------------------------
 *
 * Palettes stay inside the brand family -- the ink background never changes
 * and the accents shift. A festival should recolour the fireworks, not turn
 * the site into a different brand.
 */

export const FESTIVALS = [
  {
    id: "lohri-sankranti",
    name: "Lohri & Makar Sankranti",
    blurb: "Bonfires in Punjab, kite string over Gujarat, the sun turning north.",
    languages: ["Punjabi", "Gujarati", "Hindi", "Haryanvi"],
    from: "01-12", to: "01-16", solar: true,
    palette: ["#e8650a", "#f5a623", "#d4380a", "#ffd27a"],
    behaviour: { spin: 0.14, energy: 0.45 },
  },
  {
    id: "pongal",
    name: "Pongal",
    blurb: "Four days for the harvest, the sun and the cattle that pulled the plough.",
    languages: ["Tamil"],
    from: "01-14", to: "01-18", solar: true,
    palette: ["#f5a623", "#ffd27a", "#e8650a", "#c9a227"],
    behaviour: { spin: 0.06, energy: 0.3 },
  },
  {
    id: "magh-bihu",
    name: "Magh Bihu",
    blurb: "Assam's harvest feast, and the burning of the meji at dawn.",
    languages: ["Assamese"],
    from: "01-14", to: "01-17", solar: true,
    palette: ["#e8650a", "#c9302c", "#f5a623", "#f5edd8"],
    behaviour: { spin: 0.1, energy: 0.35 },
  },
  {
    id: "herath-shivaratri",
    name: "Herath & Maha Shivaratri",
    blurb: "Kashmir's own reckoning of Shivaratri — the household festival of the valley.",
    languages: ["Kashmiri", "Hindi", "Telugu", "Kannada"],
    from: "02-13", to: "02-18", lunar: true,
    palette: ["#4a4fb5", "#f5edd8", "#f5a623", "#8b1a1a"],
    behaviour: { spin: 0.05, energy: 0.22 },
  },
  {
    id: "holi",
    name: "Holi",
    blurb: "The one day the whole palette is fair game.",
    languages: ["Hindi", "Bhojpuri", "Maithili", "Magahi", "Marwari", "Rajasthani"],
    from: "03-01", to: "03-06", lunar: true,
    palette: ["#e8650a", "#f5a623", "#8b1a1a", "#2f7d5e", "#4a4fb5", "#c4407a"],
    behaviour: { spin: 0.3, energy: 0.9 },
  },
  {
    id: "ugadi-gudi-padwa",
    name: "Ugadi & Gudi Padwa",
    blurb: "New year for the Deccan — neem and jaggery, bitter with the sweet.",
    languages: ["Telugu", "Kannada", "Marathi", "Konkani"],
    from: "03-16", to: "03-22", lunar: true,
    palette: ["#f5a623", "#2f7d5e", "#e8650a", "#ffd27a"],
    behaviour: { spin: 0.08, energy: 0.35 },
  },
  {
    id: "eid-al-fitr",
    name: "Eid al-Fitr",
    blurb: "The fast breaks. Sewaiyan, new clothes, the crescent sighted.",
    languages: ["Urdu", "Kashmiri", "Hindi", "Bengali"],
    from: "03-18", to: "03-22", lunar: true, islamic: true,
    palette: ["#2f7d5e", "#c9a227", "#ffd27a", "#f5edd8"],
    behaviour: { spin: 0.05, energy: 0.25 },
  },
  {
    id: "baisakhi-vishu-puthandu",
    name: "Baisakhi, Vishu, Puthandu & Bohag Bihu",
    blurb: "Mid-April: half the country starts its year on the same week.",
    languages: ["Punjabi", "Malayalam", "Tamil", "Assamese", "Bengali", "Odia"],
    from: "04-13", to: "04-16", solar: true,
    palette: ["#f5a623", "#2f7d5e", "#e8650a", "#ffd27a"],
    behaviour: { spin: 0.12, energy: 0.5 },
  },
  {
    id: "hareli-bastar",
    name: "Hareli & Bastar Dussehra",
    blurb: "Chhattisgarh greets the monsoon, then runs the longest Dussehra in the country.",
    languages: ["Chhattisgarhi", "Santali"],
    from: "07-22", to: "07-28", lunar: true,
    palette: ["#2f7d5e", "#e8650a", "#f5a623", "#c9a227"],
    behaviour: { spin: 0.09, energy: 0.38 },
  },
  {
    id: "rath-yatra",
    name: "Rath Yatra",
    blurb: "Puri pulls the chariots. The deities leave the temple and meet the street.",
    languages: ["Odia", "Bengali"],
    from: "07-14", to: "07-19", lunar: true,
    palette: ["#e8650a", "#c9302c", "#f5a623", "#f5edd8"],
    behaviour: { spin: 0.18, energy: 0.55 },
  },
  {
    id: "onam",
    name: "Onam",
    blurb: "Kerala lays the pookalam and sets out the sadya for a returning king.",
    languages: ["Malayalam"],
    from: "08-24", to: "08-29", lunar: true,
    palette: ["#f5a623", "#2f7d5e", "#ffd27a", "#f5edd8"],
    behaviour: { spin: 0.07, energy: 0.3 },
  },
  {
    id: "ganesh-chaturthi",
    name: "Ganesh Chaturthi",
    blurb: "Ten days of Mumbai at full volume, ending in the sea.",
    languages: ["Marathi", "Konkani", "Gujarati"],
    from: "09-12", to: "09-23", lunar: true,
    palette: ["#e8650a", "#f5a623", "#c9302c", "#ffd27a"],
    behaviour: { spin: 0.22, energy: 0.75 },
  },
  {
    id: "navratri-durga-puja",
    name: "Navratri & Durga Puja",
    blurb: "Garba in Gujarat, pandal-hopping in Kolkata, nine nights either way.",
    languages: ["Gujarati", "Bengali", "Assamese", "Odia", "Marwari"],
    from: "10-09", to: "10-21", lunar: true,
    palette: ["#c9302c", "#e8650a", "#f5a623", "#f5edd8"],
    behaviour: { spin: 0.26, energy: 0.8 },
  },
  {
    id: "diwali",
    name: "Diwali",
    blurb: "The one the whole brand is named after. Lamps, noise, light.",
    languages: ["Hindi", "Marathi", "Gujarati", "Marwari", "Rajasthani", "Bhojpuri"],
    from: "11-05", to: "11-12", lunar: true,
    palette: ["#f5a623", "#ffd27a", "#e8650a", "#c9a227"],
    behaviour: { spin: 0.34, energy: 1 },
  },
  {
    id: "chhath",
    name: "Chhath",
    blurb: "Standing in the water at sunrise for a god who is already looking at you.",
    languages: ["Bhojpuri", "Maithili", "Magahi", "Hindi"],
    from: "11-13", to: "11-18", lunar: true,
    palette: ["#e8650a", "#f5a623", "#ffd27a", "#8b1a1a"],
    behaviour: { spin: 0.04, energy: 0.2 },
  },
  {
    id: "guru-nanak-jayanti",
    name: "Guru Nanak Jayanti",
    blurb: "Gurpurab. Nagar kirtan through the streets, langar for anyone who comes.",
    languages: ["Punjabi", "Hindi"],
    from: "11-22", to: "11-26", lunar: true,
    palette: ["#f5a623", "#2f7d5e", "#ffd27a", "#f5edd8"],
    behaviour: { spin: 0.06, energy: 0.28 },
  },
  {
    id: "christmas",
    name: "Christmas",
    blurb: "Goa, Kerala, the North-East and every mall in between.",
    languages: ["Konkani", "Malayalam", "Assamese", "Santali"],
    from: "12-20", to: "12-27", solar: true,
    palette: ["#c9302c", "#2f7d5e", "#ffd27a", "#f5edd8"],
    behaviour: { spin: 0.08, energy: 0.35 },
  },
];

const pad = (n) => String(n).padStart(2, "0");
const md = (d) => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** The festival happening right now, or null. Windows are inclusive. */
export function activeFestival(date = new Date()) {
  const today = md(date);
  return FESTIVALS.find((f) => today >= f.from && today <= f.to) || null;
}

/** The next one due, wrapping past year end, with days remaining. */
export function nextFestival(date = new Date()) {
  const today = md(date);
  const upcoming = FESTIVALS.filter((f) => f.from > today).sort((a, b) => a.from.localeCompare(b.from));
  const festival = upcoming[0] || [...FESTIVALS].sort((a, b) => a.from.localeCompare(b.from))[0];
  if (!festival) return null;

  const [m, d] = festival.from.split("-").map(Number);
  let target = new Date(date.getFullYear(), m - 1, d);
  if (target < date) target = new Date(date.getFullYear() + 1, m - 1, d);
  const days = Math.max(0, Math.ceil((target - date) / 86400000));
  return { festival, days };
}

/** Let ?festival=diwali preview any of them out of season. */
export function requestedFestival(search = window.location.search) {
  const id = new URLSearchParams(search).get("festival");
  if (!id) return null;
  if (id === "none") return "none";
  return FESTIVALS.find((f) => f.id === id) || null;
}
