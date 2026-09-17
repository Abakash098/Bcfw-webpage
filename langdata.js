/* Facts per language, used by the generator for /languages/<slug>/.
 *
 * Speaker figures are FIRST-LANGUAGE speakers from the 2011 Census of India,
 * which is the last published one, and they are attributed as such on the
 * page. Where a figure is contested or not separately enumerated it is left
 * null and simply not printed -- an omitted number is better than a confident
 * wrong one. Nothing here describes BCF's own work; that stays a placeholder
 * until there is real work to show.
 */

export const LANG_FACTS = {
  Hindi:        { slug: "hindi", speakers: 528, states: ["Uttar Pradesh", "Bihar", "Madhya Pradesh", "Rajasthan", "Haryana", "Delhi"], scriptName: "Devanagari", festivals: ["Diwali", "Holi", "Chhath"] },
  Bengali:      { slug: "bengali", speakers: 97, states: ["West Bengal", "Tripura", "Assam"], scriptName: "Bangla", festivals: ["Durga Puja", "Pohela Boishakh"] },
  Telugu:       { slug: "telugu", speakers: 81, states: ["Andhra Pradesh", "Telangana"], scriptName: "Telugu", festivals: ["Ugadi", "Bathukamma", "Sankranti"] },
  Marathi:      { slug: "marathi", speakers: 83, states: ["Maharashtra", "Goa"], scriptName: "Devanagari", festivals: ["Ganesh Chaturthi", "Gudi Padwa"] },
  Tamil:        { slug: "tamil", speakers: 69, states: ["Tamil Nadu", "Puducherry"], scriptName: "Tamil", festivals: ["Pongal", "Puthandu"] },
  Urdu:         { slug: "urdu", speakers: 50, states: ["Uttar Pradesh", "Telangana", "Bihar", "Jammu & Kashmir"], scriptName: "Nastaliq", festivals: ["Eid al-Fitr", "Eid al-Adha"] },
  Gujarati:     { slug: "gujarati", speakers: 55, states: ["Gujarat", "Dadra & Nagar Haveli"], scriptName: "Gujarati", festivals: ["Navratri", "Uttarayan", "Diwali"] },
  Kannada:      { slug: "kannada", speakers: 43, states: ["Karnataka"], scriptName: "Kannada", festivals: ["Mysore Dasara", "Ugadi"] },
  Malayalam:    { slug: "malayalam", speakers: 34, states: ["Kerala", "Lakshadweep"], scriptName: "Malayalam", festivals: ["Onam", "Vishu"] },
  Odia:         { slug: "odia", speakers: 37, states: ["Odisha"], scriptName: "Odia", festivals: ["Rath Yatra", "Raja Parba"] },
  Punjabi:      { slug: "punjabi", speakers: 33, states: ["Punjab", "Haryana", "Delhi"], scriptName: "Gurmukhi", festivals: ["Baisakhi", "Lohri", "Guru Nanak Jayanti"] },
  Assamese:     { slug: "assamese", speakers: 15, states: ["Assam"], scriptName: "Assamese", festivals: ["Bohag Bihu", "Magh Bihu"] },
  Bhojpuri:     { slug: "bhojpuri", speakers: 51, states: ["Bihar", "Uttar Pradesh", "Jharkhand"], scriptName: "Devanagari", festivals: ["Chhath", "Holi"] },
  Rajasthani:   { slug: "rajasthani", speakers: 26, states: ["Rajasthan"], scriptName: "Devanagari", festivals: ["Teej", "Gangaur", "Diwali"] },
  Maithili:     { slug: "maithili", speakers: 14, states: ["Bihar", "Jharkhand"], scriptName: "Devanagari", festivals: ["Chhath", "Sama Chakeva"] },
  Haryanvi:     { slug: "haryanvi", speakers: 10, states: ["Haryana"], scriptName: "Devanagari", festivals: ["Teej", "Lohri"] },
  Konkani:      { slug: "konkani", speakers: 2.3, states: ["Goa", "Karnataka", "Maharashtra"], scriptName: "Devanagari", festivals: ["Shigmo", "Christmas", "Ganesh Chaturthi"] },
  Marwari:      { slug: "marwari", speakers: 8, states: ["Rajasthan"], scriptName: "Devanagari", festivals: ["Gangaur", "Diwali"] },
  Magahi:       { slug: "magahi", speakers: 13, states: ["Bihar", "Jharkhand"], scriptName: "Devanagari", festivals: ["Chhath", "Holi"] },
  Chhattisgarhi:{ slug: "chhattisgarhi", speakers: 16, states: ["Chhattisgarh"], scriptName: "Devanagari", festivals: ["Hareli", "Bastar Dussehra"] },
  Santali:      { slug: "santali", speakers: 7.4, states: ["Jharkhand", "West Bengal", "Odisha"], scriptName: "Ol Chiki / Devanagari", festivals: ["Sohrai", "Baha"] },
  Kashmiri:     { slug: "kashmiri", speakers: 6.8, states: ["Jammu & Kashmir"], scriptName: "Perso-Arabic / Devanagari", festivals: ["Eid", "Herath", "Navroz"] },
};
