/**
 * WrightWay — the family kitchen wall for Home Assistant.
 * One card is the whole screen: calendar, chores, shopping, meals, home and photos.
 * type: custom:wrightway-calendar-card
 */
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MEAL_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MEAL_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DEFAULT_FAVORITES = ["Tacos", "Spaghetti", "Pizza night", "Chili", "Grilled chicken", "Leftovers"];

// Served next to the card, so the wall keeps its look without the internet.
const FONT_URL = new URL("./fonts/figtree.woff2", import.meta.url).href;

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function pad(n) { return String(n).padStart(2, "0"); }

function isoDay(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfDay(d) {
  const t = new Date(d);
  t.setHours(0, 0, 0, 0);
  return t;
}

function addDays(d, n) {
  const t = new Date(d);
  t.setDate(t.getDate() + n);
  return t;
}

function startOfWeek(d) {
  const t = startOfDay(d);
  t.setDate(t.getDate() - t.getDay());
  return t;
}

// Five rows for most months, six only when the month needs them.
function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  return { start: startOfWeek(first), weeks: Math.ceil((first.getDay() + days) / 7) };
}

function localDate(s) {
  const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

// The local days an event covers. All-day ends are exclusive, and a timed
// event that ends exactly at midnight does not spill onto the next day.
function eventSpan(ev) {
  const s = ev.start || {};
  const e = ev.end || {};
  if (s.date) {
    const first = s.date.slice(0, 10);
    let last = e.date ? isoDay(addDays(localDate(e.date), -1)) : first;
    if (last < first) last = first;
    return { _allDay: true, _first: first, _last: last, _s: localDate(first), _e: null };
  }
  const start = new Date(s.dateTime);
  const end = e.dateTime ? new Date(e.dateTime) : null;
  const lastMoment = end && end > start ? new Date(end.getTime() - 1) : start;
  return { _allDay: false, _first: isoDay(start), _last: isoDay(lastMoment), _s: start, _e: end };
}

function hm(d) {
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return m ? `${h}:${pad(m)} ${ap}` : `${h} ${ap}`;
}

// What to print beside an event on a given day.
function eventTimeLabel(ev, dayKey) {
  if (ev._allDay) return "All day";
  if (dayKey && dayKey > ev._first) {
    return ev._e && ev._last === dayKey ? `Until ${hm(ev._e)}` : "All day";
  }
  return hm(ev._s);
}

function eventRangeLabel(ev, dayKey) {
  const base = eventTimeLabel(ev, dayKey);
  if (ev._allDay || !ev._e || dayKey > ev._first || ev._last !== ev._first) return base;
  return `${base} – ${hm(ev._e)}`;
}

function eventSort(dayKey) {
  const rank = (ev) => (ev._allDay ? 0 : ev._first < dayKey ? 1 : 2);
  return (a, b) => rank(a) - rank(b) || a._s - b._s || String(a.summary).localeCompare(String(b.summary));
}

function clockParts(d) {
  let h = d.getHours();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return { time: `${h}:${pad(d.getMinutes())}`, ap };
}

function hexRgb(hex) {
  let c = String(hex || "").trim().replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  if (!/^[0-9a-f]{6}$/i.test(c)) return null;
  return [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16));
}

function rgbHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
}

function hsla(h, s, l, a) {
  return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;
}

// One colour per person becomes a soft tint, a fill, a mid tone and a deep
// ink, tuned separately for day and evening so text always stays readable.
function tones(hex) {
  const [h, s0] = rgbHsl(hexRgb(hex) || [148, 163, 184]);
  const s = Math.max(38, Math.min(78, s0));
  return {
    day: { t: hsla(h, s, 94, 1), f: hsla(h, s, 86, 1), a: hsla(h, s + 6, 77, 1), m: hsla(h, s, 55, 1), i: hsla(h, Math.min(s, 70), 27, 1) },
    night: { t: hsla(h, s, 60, 0.16), f: hsla(h, s, 60, 0.28), a: hsla(h, s, 60, 0.46), m: hsla(h, s, 63, 1), i: hsla(h, s, 84, 1) },
  };
}

// Grocery items remember their Walmart product in the item notes.
function walmartId(desc) {
  const m = String(desc || "").match(/WM:(\d{5,})/);
  return m ? m[1] : "";
}

function withWalmartId(desc, id) {
  const rest = String(desc || "").replace(/\s*WM:\d+/g, "").trim();
  return id ? (rest ? `${rest} WM:${id}` : `WM:${id}`) : rest;
}

function parseWalmartLink(text) {
  const s = String(text || "").trim();
  if (/^\d{5,}$/.test(s)) return s;
  const m = s.match(/\/ip\/(?:[^/?#]+\/)?(\d{5,})/) || s.match(/[?&]items?=(\d{5,})/);
  return m ? m[1] : "";
}

function groceryQty(summary) {
  const m = String(summary || "").match(/^\s*(\d{1,2})\s*x?\s+/i);
  return m ? Math.max(1, Math.min(24, Number(m[1]))) : 1;
}

const WX_ICON = {
  "clear-night": "moon", cloudy: "cloud", exceptional: "cloud", fog: "fog", hail: "snow",
  lightning: "storm", "lightning-rainy": "storm", partlycloudy: "partly", pouring: "rain",
  rainy: "rain", snowy: "snow", "snowy-rainy": "snow", sunny: "sun", windy: "wind", "windy-variant": "wind",
};
const WX_LABEL = {
  "clear-night": "Clear", cloudy: "Cloudy", exceptional: "Unusual weather", fog: "Foggy", hail: "Hail",
  lightning: "Storms", "lightning-rainy": "Thunderstorms", partlycloudy: "Partly cloudy", pouring: "Heavy rain",
  rainy: "Rain", snowy: "Snow", "snowy-rainy": "Sleet", sunny: "Sunny", windy: "Windy", "windy-variant": "Windy",
};

function parseWW(desc) {
  if (!desc) return null;
  const m = String(desc).match(/WW:(\{.*\})/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch (e) { return null; }
}

function encodeWW(meta) {
  return "WW:" + JSON.stringify(meta);
}

function parseDay(s) {
  if (s instanceof Date) {
    return new Date(s.getFullYear(), s.getMonth(), s.getDate(), 12, 0, 0);
  }
  const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
}

function itemDueDay(it) {
  const d = it.due;
  if (!d) return null;
  if (typeof d === "string") return d.slice(0, 10);
  if (d.date) return d.date;
  if (d.dateTime) return String(d.dateTime).slice(0, 10);
  return null;
}

function nextDueDate(meta, from, today) {
  const now = parseDay(today || new Date());
  let d = parseDay(from || now);
  if (d < now) d = now;
  if (meta.freq === "daily" || (meta.freq === "every" && Number(meta.n) === 1)) {
    d.setDate(d.getDate() + 1);
    return isoDay(d);
  }
  if (meta.freq === "every") {
    d.setDate(d.getDate() + Math.max(2, Number(meta.n) || 2));
    return isoDay(d);
  }
  const days = Array.isArray(meta.days) ? meta.days.map(Number) : [];
  for (let i = 1; i <= 8; i += 1) {
    const t = new Date(d);
    t.setDate(d.getDate() + i);
    if (days.includes(t.getDay())) return isoDay(t);
  }
  d.setDate(d.getDate() + 1);
  return isoDay(d);
}

function firstDueDate(meta, from) {
  const d = parseDay(from || new Date());
  if (meta.freq === "weekly") {
    const days = Array.isArray(meta.days) ? meta.days.map(Number) : [];
    for (let i = 0; i <= 7; i += 1) {
      const t = new Date(d);
      t.setDate(d.getDate() + i);
      if (days.includes(t.getDay())) return isoDay(t);
    }
  }
  return isoDay(d);
}

function choreIsDue(it, todayKey) {
  if (it.status === "completed") return false;
  const due = itemDueDay(it);
  if (due) return due <= todayKey;
  const meta = parseWW(it.description);
  if (meta && meta.freq === "weekly") {
    const days = (meta.days || []).map(Number);
    const dow = parseDay(todayKey).getDay();
    return days.includes(dow);
  }
  return true;
}

function freqLabel(meta) {
  if (!meta) return "Once";
  if (meta.freq === "daily") return "Every day";
  if (meta.freq === "every") {
    const n = Number(meta.n) || 2;
    return n === 2 ? "Every other day" : `Every ${n} days`;
  }
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = (meta.days || []).map(Number).sort();
  if (days.length === 7) return "Every day";
  if (!days.length) return "Weekly";
  return days.map((d) => names[d]).join(", ");
}

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const PREFS_KEY = "wrightway-wall-prefs";
const DEFAULT_ORDER = ["Dale", "Laura", "David", "Ben", "Family", "House"];

const DEFAULT_HOUSE_CHORES = [
  { helper: "input_boolean.cat_litter_has_been_done", name: "Cat litter", who: "Dale", mode: "done" },
  { helper: "input_boolean.dishwasher_is_clean", name: "Unload dishwasher", who: "House", mode: "due" },
  { helper: "input_boolean.washer_is_done", name: "Move laundry", who: "House", mode: "due" },
  { helper: "input_boolean.take_out_trash", name: "Take out trash", who: "House", mode: "done" },
  { helper: "input_boolean.homework_ben", name: "Homework", who: "Ben", mode: "done" },
  { helper: "input_boolean.homework_david", name: "Homework", who: "David", mode: "done" },
];

function normName(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const S = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const CLOUD = "M7 18.5h10.2a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.3 11.7 3.4 3.4 0 0 0 7 18.5z";
const CLOUD_HI = "M7 15.5h10.2a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.3 8.7 3.4 3.4 0 0 0 7 15.5z";

const ICONS = {
  calendar: S('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  home: S('<path d="M4 11.2 12 4.5l8 6.7V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.5H9v5.5H5.5A1.5 1.5 0 0 1 4 19z"/>'),
  shop: S('<path d="M3 4h2.2l2.1 10.6a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L20 8H6"/><circle cx="9.5" cy="19.6" r="1.3"/><circle cx="17" cy="19.6" r="1.3"/>'),
  meals: S('<path d="M6.5 3v7a2.5 2.5 0 0 0 5 0V3M9 3v18M17.5 3c-1.7 1-2.5 3-2.5 6s1 4 2.5 4v8"/>'),
  photos: S('<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-4.8-4.8L6 19.5"/>'),
  gear: S('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  plus: S('<path d="M12 5v14M5 12h14"/>'),
  chevL: S('<path d="m15 18-6-6 6-6"/>'),
  chevR: S('<path d="m9 18 6-6-6-6"/>'),
  check: S('<path d="M20 6 9 17l-5-5"/>'),
  close: S('<path d="M18 6 6 18M6 6l12 12"/>'),
  help: S('<circle cx="12" cy="12" r="9"/><path d="M9.2 9a3 3 0 0 1 5.6 1c0 2-3 2.5-3 4.5"/><path d="M12 17.5h.01"/>'),
  sun: S('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>'),
  moon: S('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
  trash: S('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>'),
  sparkle: S('<path d="M11 3.5l1.8 5.2L18 10.5l-5.2 1.8L11 17.5l-1.8-5.2L4 10.5l5.2-1.8z"/><path d="M18.5 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>'),
  link: S('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  external: S('<path d="M14 4h6v6M20 4l-9 9M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"/>'),
  bag: S('<path d="M5 8h14l-1.2 11.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>'),
  sensor: S('<path d="M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8"/><circle cx="12" cy="12" r="1.4"/>'),
  listcheck: S('<path d="M10 6h10M10 12h10M10 18h10"/><path d="m3.5 6 1.5 1.5L7.5 5M3.5 12l1.5 1.5L7.5 11M3.5 18l1.5 1.5L7.5 17"/>'),
  tune: S('<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'),
  play: S('<path d="M7 4.5v15l12-7.5z"/>'),
  pause: S('<path d="M8.5 5v14M15.5 5v14"/>'),
  dock: S('<path d="M4 11.2 12 4.5l8 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19z"/><path d="M9 15h6"/>'),
  heart: S('<path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/>'),
  garage: S('<path d="M3 20V9.5L12 4l9 5.5V20"/><path d="M7 20v-8h10v8M7 15h10"/>'),
  main: S('<path d="M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11"/><path d="M3 13a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v4.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5zM6 19v1.5M18 19v1.5"/>'),
  bed: S('<path d="M3 18V7.5M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11.5" r="2"/>'),
  basement: S('<path d="M3 20h5v-4h4v-4h4V8h5"/>'),
  fan: S('<circle cx="12" cy="12" r="1.8"/><path d="M12 10.2c0-4 1.5-6.2 3.5-6.2S18 7 13.7 11M13.8 12c4 0 6.2 1.5 6.2 3.5S17 18 13 13.7M12 13.8c0 4-1.5 6.2-3.5 6.2S6 17 10.3 13M10.2 12C6.2 12 4 10.5 4 8.5S7 6 11 10.3"/>'),
  vac: S('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/><path d="M8.5 5.8h7"/>'),
  bulb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5a6.5 6.5 0 0 0-3.9 11.7c.6.5.9 1.1.9 1.8v.5h6V16c0-.7.3-1.3.9-1.8A6.5 6.5 0 0 0 12 2.5zM9 18h6v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"/></svg>',
  power: S('<path d="M12 3v8"/><path d="M7 5.6a8 8 0 1 0 10 0"/>'),
  cover: S('<path d="M4 4h16M5 4v12M19 4v12M5 8h14M5 12h14M5 16h14M12 16v4"/>'),
  plug: S('<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4"/>'),
  drop: S('<path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10 12 3 12 3z"/>'),
  thermo: S('<path d="M10 4.5a2 2 0 0 1 4 0v9.3a4 4 0 1 1-4 0z"/><path d="M12 14v3"/>'),
  car: S('<path d="M4 16v-3.5L6.2 7h11.6L20 12.5V16a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-.5h-9v.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 12.5h16"/>'),
  cook: S('<path d="M4 11h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M2 11h20M9 7.5c0-1 .7-1.5.7-2.5M13.5 7.5c0-1 .7-1.5.7-2.5"/>'),
  dine: S('<path d="M6.5 3v7a2.5 2.5 0 0 0 5 0V3M9 3v18M17.5 3c-1.7 1-2.5 3-2.5 6s1 4 2.5 4v8"/>'),
  w_sun: S('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>'),
  w_moon: S('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
  w_cloud: S(`<path d="${CLOUD}"/>`),
  w_partly: S('<path d="M8.5 3v1.2M3.8 5.8l.9.9M2.5 10h1.2M13.2 5.8l-.9.9"/><path d="M5.2 12.8a3.6 3.6 0 1 1 6.4-3"/><path d="M9.8 20.5h7.6a3.4 3.4 0 0 0 .5-6.75 4.7 4.7 0 0 0-9 1A2.9 2.9 0 0 0 9.8 20.5z"/>'),
  w_rain: S(`<path d="${CLOUD_HI}"/><path d="M8.5 18.5 7.5 21M12.5 18.5l-1 2.5M16.5 18.5l-1 2.5"/>`),
  w_snow: S(`<path d="${CLOUD_HI}"/><path d="M8.5 19.5h.01M12.5 21h.01M16.5 19.5h.01"/>`),
  w_storm: S(`<path d="${CLOUD_HI}"/><path d="m13 16.5-2.2 3.2h2.8L11.5 23"/>`),
  w_fog: S('<path d="M4 9h16M3 13h18M5 17h14"/>'),
  w_wind: S('<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h8"/>'),
};

function wxIcon(state) {
  return ICONS[`w_${WX_ICON[state] || "cloud"}`];
}

const LIGHT_DOTS = [
  [255, 244, 229],
  [255, 214, 170],
  [255, 186, 120],
  [255, 147, 41],
  [255, 255, 255],
  [186, 214, 255],
];

const ADAPTIVE = {
  kitchen: "switch.adaptive_lighting_pantry",
  mudroom: "switch.adaptive_lighting_mudroom",
  pantry: "switch.adaptive_lighting_pantry",
};

function kelvinRgb(k) {
  const kelvin = Math.max(1000, Math.min(40000, Number(k) || 3000)) / 100;
  let r; let g; let b;
  if (kelvin <= 66) {
    r = 255;
    g = Math.min(255, Math.max(0, 99.47 * Math.log(kelvin) - 161.12));
    b = kelvin <= 19 ? 0 : Math.min(255, Math.max(0, 138.52 * Math.log(kelvin - 10) - 305.04));
  } else {
    r = Math.min(255, Math.max(0, 329.7 * (kelvin - 60) ** -0.1332));
    g = Math.min(255, Math.max(0, 288.12 * (kelvin - 60) ** -0.0755));
    b = 255;
  }
  return [Math.round(r), Math.round(g), Math.round(b)];
}

const HOME_AREAS = [
  { id: "garage", name: "Garage", accent: "#0ea5e9", icon: "garage" },
  { id: "main", name: "Main Area", accent: "#2563eb", icon: "main" },
  { id: "bedrooms", name: "Bedrooms", accent: "#7c3aed", icon: "bed" },
  { id: "basement", name: "Basement", accent: "#16a34a", icon: "basement" },
  { id: "fans", name: "Fans", accent: "#78716c", icon: "fan" },
  { id: "vacuum", name: "Vacuum", accent: "#ea580c", icon: "vac" },
];

const HOME_SECTIONS = {
  main: [
    { id: "kitchen", name: "Kitchen", entities: [
      { entity: "light.kitchen_lights", name: "Kitchen lights" },
      { entity: "light.kitchen_island_lights", name: "Island" },
      { entity: "light.under_cabinet_lights_nanoleaf_light_strip", name: "Under cabinet" },
      { entity: "light.above_cabinet_lights_nanoleaf_light_strip", name: "Above cabinet" },
      { entity: "light.pantry_lights", name: "Pantry" },
    ]},
    { id: "living", name: "Living room", entities: [
      { entity: "light.living_room_lights", name: "Ceiling lights" },
      { entity: "light.bookshelf_lights", name: "Bookshelf" },
      { name: "Railing", candidates: ["light.railing_lights", "switch.railing_lights", "light.railing"], hints: ["railing"] },
      { name: "Snow globe", candidates: ["light.snow_globe", "light.snow_globe_lights", "switch.snow_globe"], hints: ["globe"] },
      { entity: "switch.living_room_stairs", name: "Stairs" },
      { entity: "cover.living_room_shade", name: "Shade" },
    ]},
    { id: "dining", name: "Dining", entities: [
      { entity: "light.dining_room_lights", name: "Dining lights" },
      { entity: "cover.dining_room_shade", name: "Shade" },
    ]},
    { id: "mudroom", name: "Mudroom", entities: [
      { entity: "light.mudroom_lights", name: "Mudroom lights" },
    ]},
  ],
  bedrooms: [
    { id: "master", name: "Master", entities: [
      { entity: "light.master_bedroom_lights", name: "Bedroom lights" },
      { entity: "light.master_bedroom_dales_lamp", name: "Dale’s lamp" },
      { entity: "light.master_bathroom_lights", name: "Bath lights" },
    ]},
    { id: "david", name: "David’s room", entities: [
      { entity: "light.davids_room_lights", name: "Lights" },
      { entity: "light.david_s_nightlight", name: "Nightlight" },
    ]},
    { id: "ben", name: "Ben’s room", entities: [
      { entity: "light.bens_room_lights", name: "Lights" },
      { entity: "light.ben_s_nightlight", name: "Nightlight" },
    ]},
  ],
  basement: [
    { id: "basement", name: "Lights", entities: [
      { entity: "light.basement_play_area", name: "Play area" },
      { entity: "light.basement_living_room", name: "Living room" },
      { entity: "light.smart_wi_fi_light_switch", name: "Utility" },
      { entity: "light.bar_lights", name: "Bar lights" },
    ]},
  ],
  fans: [
    { id: "ceil_fans", name: "Ceiling fans", entities: [
      { entity: "fan.living_room_fan", name: "Living room" },
      { entity: "fan.master_bedroom_fan", name: "Master" },
      { entity: "fan.bens_room_fan", name: "Ben’s room" },
      { entity: "fan.davids_room_fan", name: "David’s room" },
      { entity: "fan.guest_room_fan", name: "Guest room" },
      { entity: "fan.office_fan", name: "Office" },
    ]},
    { id: "other_fans", name: "Other fans", entities: [
      { entity: "fan.ben_s_noise_fan_switch", name: "Ben’s noise fan" },
      { entity: "light.garage_south_fan", name: "Garage south" },
      { entity: "light.north_fan", name: "Garage north" },
      { entity: "light.half_bath_fan", name: "Half bath" },
      { entity: "light.kid_s_bathroom_fan", name: "Kids’ bath" },
      { entity: "light.master_shower_fan", name: "Master shower" },
      { entity: "light.master_toilet_fan", name: "Master toilet" },
    ]},
  ],
};

const GARAGE_LIGHTS = [
  { entity: "light.ratgdov25i_c849a9_light", name: "Door 1 light" },
  { entity: "light.ratgdov25i_e4516b_light", name: "Door 2 light" },
  { entity: "light.ratgdov25i_ca0b6e_light", name: "Door 3 light" },
];

const GARAGE_FANS = [
  { entity: "light.north_fan", name: "North fan" },
  { entity: "light.garage_south_fan", name: "South fan" },
];

const GARAGE_DOORS = [
  { entity: "cover.ratgdov25i_c849a9_door", name: "Door 1" },
  { entity: "cover.ratgdov25i_e4516b_door", name: "Door 2" },
  { entity: "cover.ratgdov25i_ca0b6e_door", name: "Door 3" },
];

const HOME_OUTSIDE = [
  { entity: "switch.driveway_lights", name: "Driveway lights" },
  { entity: "switch.front_porch_lights", name: "Front porch" },
  { entity: "switch.outside_christmas_lights", name: "Christmas lights" },
];

const HOME_VACUUM_ROOMS = [
  { entity: "input_boolean.vacuum_qp_kitchen", name: "Kitchen" },
  { entity: "input_boolean.vacuum_qp_livingroom", name: "Living room" },
  { entity: "input_boolean.vacuum_qp_dining", name: "Dining" },
  { entity: "input_boolean.vacuum_qp_mudroom", name: "Mudroom" },
  { entity: "input_boolean.vacuum_qp_entryway", name: "Entryway" },
  { entity: "input_boolean.vacuum_qp_hallway", name: "Hallway" },
  { entity: "input_boolean.vacuum_qp_pantry", name: "Pantry" },
  { entity: "input_boolean.vacuum_qp_half_bath", name: "Half bath" },
  { entity: "input_boolean.vacuum_qp_kids_bath", name: "Kids’ bath" },
  { entity: "input_boolean.vacuum_qp_bens_room", name: "Ben’s room" },
  { entity: "input_boolean.vacuum_qp_davids_room", name: "David’s room" },
  { entity: "input_boolean.vacuum_qp_master_bed", name: "Master bed" },
  { entity: "input_boolean.vacuum_qp_master_bath", name: "Master bath" },
  { entity: "input_boolean.vacuum_qp_master_closet", name: "Master closet" },
];

const PERSON_SWATCHES = ["#5B8DEF", "#4CAF7A", "#9B6FE0", "#E8A33D", "#2FB3A6", "#E26D8A", "#EF7B50", "#7A8699"];

const CSS = `
:host {
  display: block;
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  overscroll-behavior: none;
  touch-action: manipulation;
  z-index: 1;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; }
button, input, select, textarea { font-family: inherit; }
button { -webkit-tap-highlight-color: transparent; }
[hidden] { display: none !important; }

/* Tokens. Warm linen by day, a low warm charcoal in the evening. */
.frame {
  --font: "WW Figtree", "Figtree", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --canvas: #f5f1eb;
  --surface: #ffffff;
  --surface-2: #faf7f3;
  --sunk: #eee8e0;
  --ink: #1f1b16;
  --ink-2: #5b5349;
  --ink-3: #8e8579;
  --line: #ebe5dc;
  --line-2: #dcd3c7;
  --accent: #c4553b;
  --accent-ink: #ffffff;
  --accent-soft: #f8e6df;
  --good: #3a8a55;
  --good-soft: #e2f1e6;
  --warm: #b86e14;
  --warm-soft: #fbeedb;
  --bad: #b83a2c;
  --bad-soft: #f9e2de;
  --walmart: #0053e2;
  --walmart-soft: #e6eefc;
  --shadow-1: 0 1px 2px rgba(58, 44, 28, .05), 0 3px 10px rgba(58, 44, 28, .05);
  --shadow-2: 0 2px 6px rgba(58, 44, 28, .07), 0 14px 36px rgba(58, 44, 28, .09);
  --shadow-3: 0 30px 80px rgba(40, 28, 16, .24);
  --scrim: rgba(35, 27, 19, .34);
  --glass: rgba(255, 255, 255, .9);
  --r: 22px;
  --ease: cubic-bezier(.2, .8, .2, 1);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
  overflow: hidden;
  background: var(--canvas);
  color: var(--ink);
  font-family: var(--font);
  font-size: 16px;
  line-height: 1.35;
  user-select: none;
  -webkit-user-select: none;
}
.frame.night {
  --canvas: #12100e;
  --surface: #1d1a17;
  --surface-2: #211e1a;
  --sunk: #2a2622;
  --ink: #f1ebe3;
  --ink-2: #b6ac9f;
  --ink-3: #82796e;
  --line: #2e2a25;
  --line-2: #3b362f;
  --accent: #e0795d;
  --accent-ink: #1a1512;
  --accent-soft: rgba(224, 121, 93, .16);
  --good: #6cc38b;
  --good-soft: rgba(108, 195, 139, .15);
  --warm: #e9a54d;
  --warm-soft: rgba(233, 165, 77, .15);
  --bad: #ef8a7c;
  --bad-soft: rgba(239, 138, 124, .15);
  --walmart: #5b9bff;
  --walmart-soft: rgba(91, 155, 255, .15);
  --shadow-1: 0 1px 2px rgba(0, 0, 0, .35);
  --shadow-2: 0 10px 30px rgba(0, 0, 0, .4);
  --shadow-3: 0 30px 80px rgba(0, 0, 0, .6);
  --scrim: rgba(0, 0, 0, .55);
  --glass: rgba(29, 26, 23, .92);
}
.root { position: absolute; inset: 0; }
input, textarea, select { user-select: text; -webkit-user-select: text; }

/* Frame */
.app { display: flex; height: 100%; }
.rail {
  width: 96px; flex: 0 0 96px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 20px 0 16px;
}
.brand {
  width: 46px; height: 46px; border-radius: 15px;
  background: var(--ink); color: var(--canvas);
  display: grid; place-items: center;
  font-weight: 800; font-size: 22px; letter-spacing: -.05em;
  margin-bottom: 16px;
}
.rail-btn {
  width: 78px; min-height: 70px;
  border: 0; border-radius: 20px;
  background: transparent; color: var(--ink-3);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  font-size: 13px; font-weight: 650;
  cursor: pointer;
  transition: background .18s, color .18s;
}
.rail-btn svg { width: 27px; height: 27px; }
.rail-btn.on { background: var(--surface); color: var(--ink); box-shadow: var(--shadow-1); }
.rail-btn:active { transform: scale(.95); }
.rail .gap-fill { flex: 1; }
.main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 14px; padding: 14px 20px 18px 4px; }
.body { flex: 1; min-height: 0; display: flex; }
.panel { background: var(--surface); border-radius: var(--r); box-shadow: var(--shadow-1); }
.eyebrow {
  margin: 0; font-size: 13px; font-weight: 800; letter-spacing: .09em;
  text-transform: uppercase; color: var(--ink-3);
}
.eyebrow em { font-style: normal; color: var(--ink-2); margin-left: 6px; letter-spacing: .06em; }

/* Header */
.top { display: flex; align-items: center; gap: 22px; min-height: 66px; padding: 0 4px 0 10px; }
.clock { font-size: 56px; font-weight: 750; letter-spacing: -.04em; line-height: 1; font-variant-numeric: tabular-nums; }
.clock small { font-size: 22px; font-weight: 650; letter-spacing: 0; color: var(--ink-3); margin-left: 6px; }
.date { display: flex; flex-direction: column; gap: 3px; }
.date b { font-size: 24px; font-weight: 750; letter-spacing: -.02em; }
.date span { font-size: 16px; font-weight: 550; color: var(--ink-2); }
.top .spacer { flex: 1; }
.wx { display: flex; align-items: center; gap: 22px; }
.wx-now { display: flex; align-items: center; gap: 12px; }
.wx-now svg { width: 42px; height: 42px; color: var(--ink-2); }
.wx-now .t { font-size: 36px; font-weight: 750; letter-spacing: -.03em; line-height: 1; }
.wx-now .d { font-size: 14px; font-weight: 600; color: var(--ink-2); margin-top: 3px; white-space: nowrap; }
.fc { display: flex; gap: 4px; padding-left: 20px; border-left: 1px solid var(--line-2); }
.fc > div { width: 54px; display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 12.5px; font-weight: 750; color: var(--ink-3); text-transform: uppercase; letter-spacing: .04em; }
.fc svg { width: 24px; height: 24px; color: var(--ink-2); }
.fc b { font-size: 15px; color: var(--ink); letter-spacing: 0; }
.fc i { font-style: normal; font-weight: 600; letter-spacing: 0; text-transform: none; }
.icon-btn {
  width: 52px; height: 52px; flex-shrink: 0;
  border: 0; border-radius: 50%;
  background: var(--surface); color: var(--ink-2); box-shadow: var(--shadow-1);
  display: grid; place-items: center; cursor: pointer;
}
.icon-btn svg { width: 23px; height: 23px; }
.icon-btn:active { transform: scale(.94); }

/* Shared controls */
.btn {
  height: 52px; padding: 0 24px;
  border: 0; border-radius: 999px;
  background: var(--sunk); color: var(--ink);
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  font-size: 16px; font-weight: 750; white-space: nowrap;
  cursor: pointer; transition: transform .12s, opacity .15s;
}
.btn svg { width: 20px; height: 20px; flex-shrink: 0; }
.btn.primary { background: var(--ink); color: var(--canvas); }
.btn.accent { background: var(--accent); color: var(--accent-ink); }
.btn.ghost { background: transparent; color: var(--ink-2); }
.btn.danger { background: var(--bad-soft); color: var(--bad); }
.btn.sm { height: 42px; padding: 0 18px; font-size: 15px; }
.btn:disabled { opacity: .4; cursor: default; }
.btn:not(:disabled):active { transform: scale(.97); }
.inp {
  width: 100%; height: 58px;
  border: 1.5px solid var(--line-2); border-radius: 16px;
  background: var(--surface-2); color: var(--ink);
  padding: 0 18px; font-size: 19px; font-weight: 600; outline: none;
}
.inp:focus { border-color: var(--ink-2); background: var(--surface); }
.inp.sm { height: 48px; font-size: 17px; }
select.inp { appearance: none; -webkit-appearance: none; padding-right: 40px; }
.chip-btn {
  height: 44px; padding: 0 18px;
  border: 0; border-radius: 999px;
  background: var(--sunk); color: var(--ink-2);
  font-size: 15px; font-weight: 700; cursor: pointer; white-space: nowrap;
}
.chip-btn.on { background: var(--ink); color: var(--canvas); }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.btn-row { display: flex; gap: 10px; }
.btn-row .btn { flex: 1; }

/* Avatars take their colours from the person classes set per render. */
.av {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; overflow: hidden;
  background: var(--pf); color: var(--pi);
  display: grid; place-items: center;
  font-size: 14px; font-weight: 800;
}
.av img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* Calendar */
.cal-stage { flex: 1; min-width: 0; display: flex; gap: 16px; }
.cal-col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 14px; }
.cal-card { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.cal-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 16px 16px 12px 24px; }
.cal-title { font-size: 32px; font-weight: 800; letter-spacing: -.035em; margin-right: auto; white-space: nowrap; }
.cal-title span { color: var(--ink-3); font-weight: 650; }
.people { display: flex; gap: 6px; flex-wrap: wrap; }
.pchip {
  height: 42px; padding: 0 16px 0 5px;
  border: 0; border-radius: 999px;
  background: var(--pt); color: var(--pi);
  display: flex; align-items: center; gap: 9px;
  font-size: 15px; font-weight: 700; cursor: pointer;
  transition: opacity .18s, background .18s;
}
.pchip .av { width: 32px; height: 32px; }
.pchip.off { background: var(--sunk); color: var(--ink-3); opacity: .5; }
.pchip.off .av { filter: grayscale(1); }
.seg { display: flex; padding: 4px; border-radius: 999px; background: var(--sunk); }
.seg button {
  height: 38px; padding: 0 18px; border: 0; border-radius: 999px;
  background: transparent; color: var(--ink-2);
  font-size: 15px; font-weight: 700; cursor: pointer;
}
.seg button.on { background: var(--surface); color: var(--ink); box-shadow: var(--shadow-1); }
.navs { display: flex; align-items: center; gap: 6px; }
.navs button {
  height: 46px; min-width: 46px; padding: 0 18px;
  border: 1.5px solid var(--line); border-radius: 999px;
  background: var(--surface); color: var(--ink);
  display: grid; place-items: center;
  font-size: 15px; font-weight: 750; cursor: pointer;
}
.navs button svg { width: 20px; height: 20px; }
.navs button.icon { padding: 0; }
.navs button:active { transform: scale(.95); }
.tip {
  margin: 0 16px 10px; padding: 10px 10px 10px 16px;
  border-radius: 16px; background: var(--warm-soft); color: var(--warm);
  display: flex; align-items: center; gap: 12px;
  font-size: 15px; font-weight: 650;
}
.tip span { flex: 1; }
.tip button { height: 38px; padding: 0 16px; border: 0; border-radius: 999px; background: var(--surface); color: var(--ink); font-weight: 750; cursor: pointer; }

.month { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 0 12px 12px; }
.dow { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; padding-bottom: 6px; }
.dow div { padding: 0 10px; font-size: 13px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); }
.days { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; }
.day {
  min-width: 0; min-height: 0; overflow: hidden;
  display: flex; flex-direction: column; gap: 3px;
  padding: 6px 6px 5px;
  border-radius: 14px; background: var(--surface-2);
  cursor: pointer; transition: background .15s;
}
.day.wkend { background: var(--canvas); }
.day.today { background: var(--accent-soft); }
.day:active { filter: brightness(.97); }
.num {
  align-self: flex-start;
  min-width: 30px; height: 30px; padding: 0 6px; border-radius: 999px;
  display: grid; place-items: center;
  font-size: 15px; font-weight: 700; color: var(--ink);
  font-variant-numeric: tabular-nums;
}
.day.other .num { color: var(--ink-3); font-weight: 600; }
.day.today .num { background: var(--accent); color: var(--accent-ink); }
.evs { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 3px; overflow: hidden; }
.ev {
  flex-shrink: 0; display: flex; gap: 5px; align-items: baseline;
  padding: 3px 8px; border-radius: 8px;
  background: var(--pf); color: var(--pi);
  font-size: 13.5px; font-weight: 700; line-height: 1.3;
  white-space: nowrap; overflow: hidden;
}
.ev .tm { flex-shrink: 0; font-weight: 600; opacity: .78; font-variant-numeric: tabular-nums; }
.ev .tt { overflow: hidden; text-overflow: ellipsis; }
.ev.allday { background: var(--pa); }
.ev.cut { display: none; }
.day.other .ev { opacity: .6; }
.more { padding: 1px 8px; font-size: 13px; font-weight: 750; color: var(--ink-2); }

.week { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; padding: 0 12px 12px; }
.wday { min-width: 0; min-height: 0; display: flex; flex-direction: column; border-radius: 18px; background: var(--surface-2); overflow: hidden; }
.wday.today { background: var(--accent-soft); }
.wday-h { display: flex; align-items: baseline; gap: 8px; padding: 12px 14px 8px; cursor: pointer; }
.wday-h span { font-size: 13px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); }
.wday-h b { font-size: 28px; font-weight: 800; letter-spacing: -.03em; }
.wday.today .wday-h b { color: var(--accent); }
.wlist { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 7px; padding: 0 8px 8px; }
.wev { flex-shrink: 0; padding: 9px 11px 10px; border-radius: 13px; background: var(--surface); border-left: 5px solid var(--pm); box-shadow: var(--shadow-1); cursor: pointer; }
.wev.allday { background: var(--pf); box-shadow: none; }
.wev .tm { font-size: 13px; font-weight: 700; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.wev .tt { margin-top: 2px; font-size: 16px; font-weight: 750; line-height: 1.25; color: var(--ink); overflow-wrap: anywhere; }
.wev .who { margin-top: 4px; font-size: 13px; font-weight: 700; color: var(--pi); }
.wnone { padding: 4px 6px; font-size: 14px; font-weight: 600; color: var(--ink-3); }
.wadd {
  margin: 0 8px 8px; height: 40px; flex-shrink: 0;
  border: 1.5px dashed var(--line-2); border-radius: 12px; background: transparent; color: var(--ink-3);
  display: grid; place-items: center; cursor: pointer;
}
.wadd svg { width: 18px; height: 18px; }

/* Today column */
.side { width: 408px; flex: 0 0 408px; min-height: 0; display: flex; flex-direction: column; gap: 14px; }
.agenda { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 18px 16px 8px 18px; }
.agenda-scroll { flex: 1; min-height: 0; overflow-y: auto; padding-right: 2px; }
.ag-h { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 38px; margin-bottom: 4px; }
.ag-add {
  height: 38px; padding: 0 16px 0 11px;
  border: 0; border-radius: 999px; background: var(--ink); color: var(--canvas);
  display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 750; cursor: pointer;
}
.ag-add svg { width: 18px; height: 18px; }
.ag-row { display: flex; align-items: center; gap: 12px; min-height: 48px; padding: 6px 4px; border-radius: 12px; cursor: pointer; }
.ag-row .tm { width: 76px; flex-shrink: 0; font-size: 15px; font-weight: 700; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.ag-row .bar { width: 4px; align-self: stretch; margin: 3px 0; border-radius: 4px; background: var(--pm); flex-shrink: 0; }
.ag-row .tt { flex: 1; min-width: 0; font-size: 18px; font-weight: 700; line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ag-row .av { width: 30px; height: 30px; font-size: 12.5px; }
.ag-row.past { opacity: .42; }
.ag-row.now .tm { color: var(--accent); font-weight: 800; }
.ag-earlier { display: flex; align-items: center; gap: 8px; min-height: 38px; padding: 4px; font-size: 15px; font-weight: 600; color: var(--ink-3); }
.ag-earlier svg { width: 17px; height: 17px; flex-shrink: 0; stroke-width: 2.4; }
.ag-earlier span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ag-empty { padding: 6px 4px 10px; font-size: 16px; font-weight: 550; color: var(--ink-3); }
.ag-sep { height: 1px; margin: 10px 4px 12px; background: var(--line); }
.dinner {
  display: flex; align-items: center; gap: 14px; padding: 14px 18px;
  border: 0; text-align: left; color: var(--ink); cursor: pointer; width: 100%;
}
.dinner .ic { width: 50px; height: 50px; flex-shrink: 0; border-radius: 16px; background: var(--warm-soft); color: var(--warm); display: grid; place-items: center; }
.dinner .ic svg { width: 26px; height: 26px; }
.dinner .val { display: block; margin-top: 3px; font-size: 20px; font-weight: 750; line-height: 1.2; }
.dinner .val.none { font-size: 17px; font-weight: 600; color: var(--ink-3); }
.cam-card { overflow: hidden; }
.cam-slot { aspect-ratio: 16 / 9; background: #0e0c0a; }
.cam-pills { display: flex; gap: 6px; padding: 10px 12px; overflow-x: auto; }
.cam-pills button {
  flex-shrink: 0; height: 36px; padding: 0 15px;
  border: 0; border-radius: 999px; background: var(--sunk); color: var(--ink-2);
  font-size: 14px; font-weight: 700; cursor: pointer;
}
.cam-pills button.on { background: var(--ink); color: var(--canvas); }
.scenes-card { padding: 14px 14px 14px; }
.scenes-card .eyebrow { margin: 0 4px 10px; }
.scenes { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
.scene {
  height: 70px; border: 0; border-radius: 16px;
  background: var(--sunk); color: var(--ink);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;
  font-size: 14px; font-weight: 750; cursor: pointer; transition: background .2s, transform .12s;
}
.scene svg { width: 24px; height: 24px; color: var(--sc); }
.scene.cooking { --sc: #d9661f; } .scene.dining { --sc: #c98a12; } .scene.evening { --sc: #7a5bd6; } .scene.off { --sc: var(--ink-3); }
.scene:active, .scene.flash { background: var(--accent-soft); transform: scale(.97); }

/* Live camera lives in its own layer so a redraw never restarts the stream. */
.cam-layer { position: absolute; z-index: 6; overflow: hidden; background: #0e0c0a; border-radius: var(--r) var(--r) 0 0; cursor: pointer; }
.cam-layer.full { inset: 0 !important; width: auto !important; height: auto !important; border-radius: 0; z-index: 40; }
.cam-host, .cam-host > * { width: 100%; height: 100%; display: block; }
.cam-host img, .cam-host video { width: 100%; height: 100%; object-fit: cover; display: block; }
.cam-layer.full .cam-host img, .cam-layer.full .cam-host video { object-fit: contain; }
.cam-tag {
  position: absolute; left: 12px; bottom: 12px; pointer-events: none;
  padding: 5px 12px; border-radius: 999px; background: rgba(0, 0, 0, .55); color: #fff;
  font-size: 13px; font-weight: 750;
}
.cam-alert { position: absolute; top: 12px; left: 0; right: 0; display: flex; justify-content: center; pointer-events: none; }
.cam-alert span { padding: 6px 14px; border-radius: 999px; background: var(--accent); color: #fff; font-size: 14px; font-weight: 800; box-shadow: 0 6px 18px rgba(0, 0, 0, .3); }
.cam-bar { display: none; }
.cam-layer.full .cam-tag { left: 28px; bottom: 28px; font-size: 16px; padding: 8px 16px; }
.cam-layer.full .cam-bar {
  position: absolute; top: 24px; right: 24px; display: flex; gap: 8px;
}
.cam-bar button {
  height: 48px; padding: 0 20px; border: 0; border-radius: 999px;
  background: rgba(0, 0, 0, .55); color: #fff; font-size: 16px; font-weight: 750; cursor: pointer;
  -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
}
.cam-bar button.on { background: #fff; color: #111; }
.cam-bar .x { display: flex; align-items: center; gap: 8px; }
.cam-bar svg { width: 20px; height: 20px; }

/* Chores */
.chores { flex-shrink: 0; padding: 14px 16px 16px; }
.ch-h { display: flex; align-items: center; gap: 12px; margin: 0 4px 10px; }
.ch-h .eyebrow { flex: 1; }
.ch-h button { height: 34px; padding: 0 10px; border: 0; border-radius: 999px; background: transparent; color: var(--ink-2); font-size: 14px; font-weight: 700; cursor: pointer; }
.ch-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.ch-p { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.ch-who { display: flex; align-items: center; gap: 9px; min-height: 32px; padding: 0 2px; font-size: 16px; font-weight: 800; }
.ch-who .av { width: 30px; height: 30px; font-size: 12.5px; }
.ch-who .cnt { margin-left: auto; font-size: 13px; font-weight: 750; color: var(--ink-3); }
.ch-who .cnt.all { color: var(--good); }
.ch-item {
  width: 100%; min-height: 50px; padding: 6px 12px 6px 8px;
  border: 1.5px solid var(--line); border-radius: 15px;
  background: var(--surface-2); color: var(--ink);
  display: flex; align-items: center; gap: 11px;
  font-size: 16px; font-weight: 700; text-align: left; cursor: pointer;
  transition: background .2s, border-color .2s;
}
.ch-item .ck {
  width: 32px; height: 32px; flex-shrink: 0; border-radius: 50%;
  border: 2.5px solid var(--pm); color: transparent;
  display: grid; place-items: center; transition: background .2s, color .2s;
}
.ch-item .ck svg { width: 18px; height: 18px; stroke-width: 3; }
.ch-item .nm { flex: 1; min-width: 0; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-height: 1.2; overflow-wrap: break-word; }
.ch-item .auto { display: grid; color: var(--ink-3); }
.ch-item .auto svg { width: 18px; height: 18px; }
.ch-item .late { font-size: 12.5px; font-weight: 800; color: var(--bad); }
.ch-item.late .ck { border-color: var(--bad); }
.ch-item.done { background: transparent; border-color: transparent; }
.ch-item.done .ck { background: var(--pm); border-color: var(--pm); color: #fff; }
.ch-item.done .nm { color: var(--ink-3); text-decoration: line-through; text-decoration-thickness: 2px; }
.ch-item:active { transform: scale(.985); }
.ch-free { min-height: 50px; display: flex; align-items: center; padding: 0 12px; border-radius: 15px; border: 1.5px dashed var(--line); color: var(--ink-3); font-size: 15px; font-weight: 650; }
.ch-more { padding: 0 10px; font-size: 13.5px; font-weight: 750; color: var(--ink-3); }

/* Home */
.home { flex: 1; min-width: 0; display: flex; gap: 16px; }
.areas { width: 256px; flex: 0 0 256px; padding: 12px; display: flex; flex-direction: column; gap: 4px; align-self: stretch; }
.area {
  height: 62px; padding: 0 12px 0 8px;
  border: 0; border-radius: 17px; background: transparent; color: var(--ink);
  display: flex; align-items: center; gap: 13px; text-align: left;
  font-size: 17px; font-weight: 750; cursor: pointer;
}
.area.on { background: var(--sunk); }
.area .ai { width: 44px; height: 44px; flex-shrink: 0; border-radius: 14px; background: var(--pt); color: var(--pi); display: grid; place-items: center; }
.area .ai svg { width: 23px; height: 23px; }
.area .nm { flex: 1; }
.area .ct { padding: 4px 10px; border-radius: 999px; background: var(--pt); color: var(--pi); font-size: 13px; font-weight: 800; }
.area-body { flex: 1; min-width: 0; overflow-y: auto; padding: 2px 4px 28px 0; }
.area-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin: 4px 2px 4px; }
.area-top h2 { margin: 0; font-size: 36px; font-weight: 800; letter-spacing: -.035em; }
.area-top p { margin: 4px 0 0; font-size: 16px; font-weight: 600; color: var(--ink-2); }
.sec { margin-top: 20px; }
.sec-h { display: flex; align-items: center; gap: 10px; margin: 0 2px 10px; min-height: 40px; }
.sec-h .eyebrow { flex: 1; }
.moods { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }
.mood {
  height: 40px; padding: 0 16px; border: 0; border-radius: 999px;
  background: var(--surface); color: var(--ink); box-shadow: var(--shadow-1);
  font-size: 14px; font-weight: 750; cursor: pointer;
}
.mood.icon { width: 40px; padding: 0; display: grid; place-items: center; }
.mood svg { width: 19px; height: 19px; }
.mood.on { background: var(--ink); color: var(--canvas); }
.mood:active { transform: scale(.96); }
.tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.tile {
  --rgb: 232, 150, 40; --pct: 0%;
  min-height: 128px; padding: 14px;
  border-radius: 22px; background: var(--surface); box-shadow: var(--shadow-1);
  display: flex; flex-direction: column; justify-content: space-between; gap: 12px;
}
.tile-h { display: flex; align-items: center; gap: 12px; }
.tico {
  width: 50px; height: 50px; flex-shrink: 0; border: 0; border-radius: 50%;
  background: var(--sunk); color: var(--ink-3);
  display: grid; place-items: center; cursor: pointer;
  transition: background .22s, color .22s, box-shadow .22s;
}
.tico svg { width: 25px; height: 25px; }
.tile.on .tico { background: rgba(var(--rgb), .2); color: rgb(var(--rgb)); box-shadow: 0 0 24px rgba(var(--rgb), .38); }
.tmeta { flex: 1; min-width: 0; padding: 0; border: 0; background: none; color: var(--ink); text-align: left; cursor: pointer; }
.tname { display: block; font-size: 17px; font-weight: 750; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tst { display: block; margin-top: 2px; font-size: 14px; font-weight: 650; color: var(--ink-3); }
.tile.on .tst { color: var(--ink-2); }
.tune { width: 42px; height: 42px; flex-shrink: 0; border: 0; border-radius: 50%; background: transparent; color: var(--ink-3); display: grid; place-items: center; cursor: pointer; }
.tune svg { width: 21px; height: 21px; }
.slider {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 46px; margin: 0; border-radius: 999px; cursor: pointer; touch-action: pan-y;
  background: linear-gradient(90deg, rgba(var(--rgb), .88) 0, rgba(var(--rgb), .88) var(--pct), var(--sunk) var(--pct), var(--sunk) 100%);
}
.tile:not(.on) .slider { background: var(--sunk); }
.slider.ct { background: linear-gradient(90deg, #ffb266, #fff1dc 52%, #d3e7ff); }
.slider.flat { background: linear-gradient(90deg, rgba(var(--rgb), .88) 0, rgba(var(--rgb), .88) var(--pct), var(--sunk) var(--pct), var(--sunk) 100%) !important; }
.slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 10px; height: 30px; border-radius: 5px; background: #fff; box-shadow: 0 1px 5px rgba(0, 0, 0, .3); }
.slider::-moz-range-thumb { width: 10px; height: 30px; border: 0; border-radius: 5px; background: #fff; }
.capbtn { height: 46px; border: 0; border-radius: 999px; background: var(--sunk); color: var(--ink-2); font-size: 15px; font-weight: 750; cursor: pointer; }
.tile.on .capbtn { background: rgba(var(--rgb), .18); color: var(--ink); }
.pair { display: flex; gap: 8px; }
.pair button { flex: 1; height: 46px; border: 0; border-radius: 999px; background: var(--sunk); color: var(--ink); font-size: 15px; font-weight: 750; cursor: pointer; }
.pair button.on { background: var(--ink); color: var(--canvas); }
.stepper { display: flex; gap: 6px; }
.slide-row { display: flex; align-items: center; gap: 8px; }
.slide-row .slider { flex: 1; }
.step { width: 46px; height: 46px; flex-shrink: 0; border: 0; border-radius: 50%; background: var(--sunk); color: var(--ink); font-size: 22px; font-weight: 700; cursor: pointer; }
.stepper button { width: 44px; height: 44px; border: 0; border-radius: 50%; background: var(--sunk); color: var(--ink); font-size: 22px; font-weight: 700; cursor: pointer; }
.tile.na { opacity: .55; box-shadow: none; background: var(--surface-2); }
.tile.na .tico { cursor: default; }
.dots { display: flex; flex-wrap: wrap; gap: 12px; }
.dotc { width: 44px; height: 44px; border-radius: 50%; border: 3px solid var(--surface); box-shadow: 0 0 0 1.5px var(--line-2); cursor: pointer; padding: 0; }
.hero { display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px; margin-top: 14px; }
.snap { position: relative; min-height: 250px; border-radius: 22px; overflow: hidden; background: #0e0c0a; box-shadow: var(--shadow-1); }
.snap img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.snap.map img { object-fit: contain; }
.snap .tag { position: absolute; left: 12px; bottom: 12px; padding: 5px 12px; border-radius: 999px; background: rgba(0, 0, 0, .55); color: #fff; font-size: 13px; font-weight: 750; }
.stack { display: flex; flex-direction: column; gap: 12px; }
.stat { padding: 18px 20px; display: flex; align-items: center; gap: 16px; }
.stat .si { width: 50px; height: 50px; flex-shrink: 0; border-radius: 16px; background: var(--sunk); color: var(--ink-2); display: grid; place-items: center; }
.stat .si svg { width: 25px; height: 25px; }
.stat.on .si { background: var(--good-soft); color: var(--good); }
.stat .big { font-size: 24px; font-weight: 800; letter-spacing: -.02em; line-height: 1.1; }
.stat .sub { margin-top: 3px; font-size: 14px; font-weight: 650; color: var(--ink-2); }
.meter { height: 8px; margin-top: 10px; border-radius: 99px; background: var(--sunk); overflow: hidden; }
.meter span { display: block; height: 100%; border-radius: 99px; background: var(--good); }
.doors { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.door { padding: 14px; border: 0; border-radius: 22px; background: var(--surface); box-shadow: var(--shadow-1); color: var(--ink); text-align: left; cursor: pointer; }
.door .name { display: flex; justify-content: space-between; font-size: 17px; font-weight: 750; }
.door .name span:last-child { color: var(--ink-3); font-weight: 700; }
.door.open .name span:last-child { color: var(--warm); }
.gvis { position: relative; height: 60px; margin-top: 12px; border-radius: 12px; background: var(--sunk); overflow: hidden; }
.gvis .panel-d { position: absolute; left: 7%; right: 7%; top: 12%; height: 80%; border-radius: 6px; transition: transform .5s var(--ease); background: repeating-linear-gradient(var(--line-2), var(--line-2) 11px, var(--ink-3) 11px, var(--ink-3) 13px); opacity: .8; }
.door.open .gvis .panel-d { transform: translateY(-80%); }
.door.open { box-shadow: 0 0 0 2px var(--warm), var(--shadow-1); }
.opts { display: flex; flex-wrap: wrap; gap: 8px; }

/* Shopping */
.shop { flex: 1; min-width: 0; display: flex; gap: 16px; }
.shop-list { flex: 1.25; min-width: 0; display: flex; flex-direction: column; padding: 22px 22px 12px; }
.shop-h { display: flex; align-items: baseline; gap: 14px; margin: 0 4px 14px; }
.shop-h h2 { margin: 0; font-size: 34px; font-weight: 800; letter-spacing: -.035em; }
.shop-h span { font-size: 16px; font-weight: 650; color: var(--ink-3); }
.add-bar { display: flex; gap: 10px; margin-bottom: 12px; }
.add-bar .btn { height: 58px; }
.glist { flex: 1; min-height: 0; overflow-y: auto; }
.grow { display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--line); }
.gck { flex: 1; min-width: 0; min-height: 62px; padding: 0 4px; border: 0; background: none; color: var(--ink); display: flex; align-items: center; gap: 14px; text-align: left; cursor: pointer; font-size: 19px; font-weight: 650; }
.gck .ck { width: 34px; height: 34px; flex-shrink: 0; border-radius: 50%; border: 2.5px solid var(--line-2); color: transparent; display: grid; place-items: center; }
.gck .ck svg { width: 19px; height: 19px; stroke-width: 3; }
.gck .nm { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.grow.done .gck { color: var(--ink-3); }
.grow.done .gck .nm { text-decoration: line-through; }
.grow.done .ck { background: var(--good); border-color: var(--good); color: #fff; }
.wm-link { height: 38px; padding: 0 14px; border: 0; border-radius: 999px; background: var(--sunk); color: var(--ink-3); font-size: 13.5px; font-weight: 750; cursor: pointer; display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.wm-link svg { width: 16px; height: 16px; }
.wm-link.on { background: var(--walmart-soft); color: var(--walmart); }
.gdone-h { display: flex; align-items: center; justify-content: space-between; margin: 20px 4px 2px; }
.gempty { padding: 40px 10px; text-align: center; font-size: 18px; font-weight: 600; color: var(--ink-3); }
.walmart { width: 460px; flex: 0 0 460px; display: flex; flex-direction: column; gap: 14px; }
.wm-card { padding: 24px; display: flex; flex-direction: column; gap: 14px; }
.wm-logo { display: flex; align-items: center; gap: 12px; font-size: 26px; font-weight: 800; letter-spacing: -.02em; color: var(--walmart); }
.wm-logo span.i { width: 50px; height: 50px; border-radius: 16px; display: grid; place-items: center; background: var(--walmart-soft); }
.wm-logo svg { width: 27px; height: 27px; }
.wm-card p { margin: 0; font-size: 16px; font-weight: 550; color: var(--ink-2); line-height: 1.45; }
.btn.walmart-go { height: 62px; background: var(--walmart); color: #fff; font-size: 17px; }
.wm-row { display: flex; gap: 10px; }
.wm-row .btn { flex: 1; }
.steps { margin: 0; padding: 0; list-style: none; counter-reset: s; display: flex; flex-direction: column; gap: 12px; }
.steps li { counter-increment: s; display: flex; gap: 12px; font-size: 15px; font-weight: 600; color: var(--ink-2); line-height: 1.4; }
.steps li::before { content: counter(s); width: 28px; height: 28px; flex-shrink: 0; border-radius: 50%; background: var(--sunk); color: var(--ink); display: grid; place-items: center; font-weight: 800; font-size: 14px; }
.help-card { padding: 22px 24px; }
.help-card .eyebrow { margin-bottom: 14px; }

/* Meals */
.meals-v { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }
.meals-h { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; padding: 6px 4px 0 6px; }
.meals-h h2 { margin: 0; font-size: 36px; font-weight: 800; letter-spacing: -.035em; }
.meals-h p { margin: 4px 0 0; font-size: 16px; font-weight: 600; color: var(--ink-2); }
.mgrid { flex: 1; min-height: 0; display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 12px; }
.mcard { position: relative; display: flex; flex-direction: column; gap: 10px; padding: 18px 16px 16px; cursor: text; }
.mcard.today { box-shadow: 0 0 0 2.5px var(--accent), var(--shadow-1); }
.mcard.past { opacity: .6; }
.md { display: flex; align-items: baseline; gap: 8px; }
.md b { font-size: 14px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); }
.md em { font-style: normal; font-size: 26px; font-weight: 800; letter-spacing: -.03em; }
.mcard.today .md b, .mcard.today .md em { color: var(--accent); }
.minp { flex: 1; width: 100%; min-height: 90px; resize: none; border: 0; outline: none; background: transparent; color: var(--ink); font-size: 21px; font-weight: 750; line-height: 1.3; padding: 0; }
.minp::placeholder { color: var(--ink-3); font-weight: 600; }
.mbusy { margin-top: auto; padding-top: 12px; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 8px; }
.mbusy > span:not(.eyebrow) { font-size: 14.5px; font-weight: 600; color: var(--ink-3); }
.mb-row { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; line-height: 1.25; }
.mb-row .bar { width: 4px; height: 18px; flex-shrink: 0; border-radius: 4px; background: var(--pm); }
.mb-row span:nth-child(2) { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mb-row em { font-style: normal; font-size: 13.5px; font-weight: 700; color: var(--ink-3); flex-shrink: 0; }
.mtag { position: absolute; top: 18px; right: 16px; padding: 4px 10px; border-radius: 999px; background: var(--accent); color: var(--accent-ink); font-size: 12px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; }
.favs { padding: 18px 20px; }
.favs .eyebrow { margin: 0 0 4px; }
.favs p { margin: 0 0 12px; font-size: 14px; font-weight: 600; color: var(--ink-3); }
.fav { height: 46px; padding: 0 18px; border: 0; border-radius: 999px; background: var(--warm-soft); color: var(--ink); font-size: 16px; font-weight: 700; cursor: pointer; }
.fav.add { background: transparent; border: 1.5px dashed var(--line-2); color: var(--ink-2); }
.plan-list { display: flex; flex-direction: column; gap: 8px; }
.plan-row { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-radius: 16px; background: var(--surface-2); }
.plan-row b { width: 52px; font-size: 14px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-3); }
.plan-row span { flex: 1; font-size: 18px; font-weight: 700; }
.plan-groc { margin-top: 14px; padding: 14px 16px; border-radius: 16px; background: var(--walmart-soft); font-size: 15px; font-weight: 600; color: var(--ink-2); line-height: 1.5; }
.busy { display: flex; align-items: center; gap: 14px; padding: 30px 6px; font-size: 18px; font-weight: 650; color: var(--ink-2); }
.spin { width: 26px; height: 26px; border-radius: 50%; border: 3px solid var(--line-2); border-top-color: var(--accent); animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Sheets */
.overlay { position: absolute; inset: 0; z-index: 30; display: flex; align-items: center; justify-content: center; padding: 32px; background: var(--scrim); }
.overlay.enter { animation: fade .2s ease both; }
.overlay.enter .dlg { animation: pop .26s var(--ease) both; }
@keyframes fade { from { opacity: 0; } }
@keyframes pop { from { opacity: 0; transform: translateY(14px) scale(.985); } }
.dlg { width: min(580px, 94vw); max-height: 90vh; overflow-y: auto; padding: 28px 30px 24px; border-radius: 30px; background: var(--surface); color: var(--ink); box-shadow: var(--shadow-3); }
.dlg.wide { width: min(960px, 95vw); }
.dlg h2 { margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -.03em; }
.dlg .sub { margin: 4px 0 20px; font-size: 16px; font-weight: 550; color: var(--ink-2); line-height: 1.45; }
.field { display: flex; flex-direction: column; gap: 8px; margin: 0 0 18px; }
.field > .eyebrow { margin-left: 2px; }
.who-row { display: flex; flex-wrap: wrap; gap: 8px; }
.who-row button {
  height: 50px; padding: 0 18px 0 6px;
  border: 2.5px solid transparent; border-radius: 999px;
  background: var(--pt); color: var(--pi);
  display: flex; align-items: center; gap: 10px;
  font-size: 16px; font-weight: 750; cursor: pointer;
}
.who-row button .av { width: 36px; height: 36px; }
.who-row button.on { border-color: var(--pi); background: var(--pf); }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.switch-row {
  width: 100%; height: 58px; margin-bottom: 18px; padding: 0 8px 0 18px;
  border: 1.5px solid var(--line); border-radius: 16px; background: var(--surface-2); color: var(--ink);
  display: flex; align-items: center; justify-content: space-between;
  font-size: 17px; font-weight: 700; cursor: pointer;
}
.sw { position: relative; width: 54px; height: 34px; border-radius: 999px; background: var(--line-2); transition: background .2s; }
.sw::after { content: ""; position: absolute; top: 4px; left: 4px; width: 26px; height: 26px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0, 0, 0, .25); transition: transform .2s var(--ease); }
.sw.on { background: var(--good); }
.sw.on::after { transform: translateX(20px); }
.actions { display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-top: 24px; }
.actions .left { margin-right: auto; }
.err { margin: 0 0 16px; padding: 12px 16px; border-radius: 14px; background: var(--bad-soft); color: var(--bad); font-weight: 650; }
.note { margin: 10px 0 0; font-size: 14.5px; font-weight: 550; color: var(--ink-3); line-height: 1.45; }
.dlist { display: flex; flex-direction: column; gap: 8px; }
.drow { display: flex; align-items: center; gap: 14px; min-height: 64px; padding: 10px 10px 10px 16px; border-radius: 18px; background: var(--pt); }
.drow .tm { width: 118px; flex-shrink: 0; font-size: 15px; font-weight: 750; color: var(--pi); }
.drow .tt { flex: 1; min-width: 0; font-size: 18px; font-weight: 750; }
.drow .who { display: block; margin-top: 2px; font-size: 13.5px; font-weight: 700; color: var(--pi); }
.drow .x { width: 44px; height: 44px; flex-shrink: 0; border: 0; border-radius: 50%; background: transparent; color: var(--ink-3); display: grid; place-items: center; cursor: pointer; }
.drow .x svg { width: 20px; height: 20px; }
.drow.confirm { background: var(--bad-soft); }
.dempty { padding: 24px 6px; font-size: 17px; font-weight: 600; color: var(--ink-3); }

/* Settings */
.tabs { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0 22px; padding: 5px; border-radius: 999px; background: var(--sunk); width: max-content; max-width: 100%; }
.tabs button { height: 42px; padding: 0 20px; border: 0; border-radius: 999px; background: transparent; color: var(--ink-2); font-size: 15px; font-weight: 750; cursor: pointer; }
.tabs button.on { background: var(--surface); color: var(--ink); box-shadow: var(--shadow-1); }
.set-sec { margin-bottom: 24px; }
.set-sec > .eyebrow { margin-bottom: 10px; }
.help-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.help-item { display: flex; gap: 14px; padding: 16px; border-radius: 18px; background: var(--surface-2); }
.help-item .hi { width: 46px; height: 46px; flex-shrink: 0; border-radius: 14px; background: var(--sunk); color: var(--ink-2); display: grid; place-items: center; }
.help-item .hi svg { width: 23px; height: 23px; }
.help-item b { display: block; font-size: 17px; font-weight: 800; margin-bottom: 3px; }
.help-item p { margin: 0; font-size: 15px; font-weight: 550; color: var(--ink-2); line-height: 1.45; }
.setup { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.pblock { padding: 16px; border-radius: 20px; background: var(--surface-2); }
.pblock h4 { display: flex; align-items: center; gap: 10px; margin: 0 0 8px; font-size: 17px; font-weight: 800; }
.crow { display: flex; align-items: center; gap: 8px; min-height: 54px; border-bottom: 1px solid var(--line); }
.crow:last-of-type { border-bottom: 0; }
.crow .grow2 { flex: 1; min-width: 0; }
.crow .grow2 div:first-child { font-size: 16px; font-weight: 700; }
.crow .meta { font-size: 13.5px; font-weight: 600; color: var(--ink-3); }
.tiny { height: 38px; padding: 0 12px; border: 0; border-radius: 999px; background: transparent; color: var(--ink-2); font-size: 14px; font-weight: 750; cursor: pointer; }
.tiny.danger { color: var(--bad); }
.add-chore { width: 100%; height: 46px; margin-top: 10px; border: 1.5px dashed var(--line-2); border-radius: 14px; background: transparent; color: var(--ink-2); font-size: 15px; font-weight: 750; cursor: pointer; }
.prow { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); }
.prow .av { width: 44px; height: 44px; font-size: 17px; }
.prow .nm { width: 90px; font-size: 17px; font-weight: 800; }
.prow .order { display: flex; gap: 4px; }
.prow .order button { width: 38px; height: 38px; border: 0; border-radius: 50%; background: var(--sunk); color: var(--ink-2); font-size: 16px; cursor: pointer; }
.sws { display: flex; gap: 6px; align-items: center; }
.swc { width: 34px; height: 34px; padding: 0; border: 3px solid var(--surface); border-radius: 50%; box-shadow: 0 0 0 1.5px var(--line-2); cursor: pointer; }
.swc.on { box-shadow: 0 0 0 2.5px var(--ink); }
.sws input[type=color] { width: 34px; height: 34px; padding: 0; border: 0; border-radius: 50%; background: none; cursor: pointer; }
.prow select { flex: 1; min-width: 0; }
.daysel { display: flex; gap: 6px; flex-wrap: wrap; }
.daysel button { width: 48px; height: 48px; border: 0; border-radius: 50%; background: var(--sunk); color: var(--ink-2); font-size: 16px; font-weight: 800; cursor: pointer; }
.daysel button.on { background: var(--ink); color: var(--canvas); }
.n-row { display: flex; align-items: center; gap: 12px; font-size: 17px; font-weight: 650; }
.n-row .inp { width: 90px; }
.kv { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line); font-size: 16px; font-weight: 650; }
.kv span:last-child { color: var(--ink-2); text-align: right; }
.kv .ok { color: var(--good); } .kv .no { color: var(--warm); }

/* Toast */
.toast-layer { position: absolute; left: 0; right: 0; bottom: 30px; z-index: 60; display: flex; justify-content: center; pointer-events: none; }
.toast {
  pointer-events: auto; display: flex; align-items: center; gap: 18px;
  padding: 10px 10px 10px 24px; border-radius: 999px;
  background: var(--ink); color: var(--canvas); box-shadow: var(--shadow-3);
  font-size: 17px; font-weight: 700; animation: toast .28s var(--ease) both;
}
.toast.bad { background: var(--bad); color: #fff; }
.toast button { height: 44px; padding: 0 20px; border: 0; border-radius: 999px; background: rgba(255, 255, 255, .16); color: inherit; font-size: 16px; font-weight: 800; cursor: pointer; }
.night .toast button { background: rgba(0, 0, 0, .1); }
@keyframes toast { from { opacity: 0; transform: translateY(16px); } }

/* Screensaver */
.saver { position: absolute; inset: 0; z-index: 50; overflow: hidden; background: #0e0c0a; cursor: pointer; color: #fff; }
.saver img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1.8s ease; will-change: opacity, transform; }
.saver img.on { opacity: 1; }
.saver img.kb { animation: kb var(--kb, 14s) linear both; }
@keyframes kb { from { transform: scale(1); } to { transform: scale(1.07); } }
.night .saver img { filter: brightness(.74); }
.saver .scrim { position: absolute; left: 0; right: 0; bottom: 0; height: 48%; background: linear-gradient(to top, rgba(0, 0, 0, .58), rgba(0, 0, 0, 0)); pointer-events: none; }
.saver .meta { position: absolute; left: 60px; bottom: 52px; text-shadow: 0 2px 24px rgba(0, 0, 0, .35); }
.saver .s-clock { font-size: 128px; font-weight: 750; letter-spacing: -.05em; line-height: .92; font-variant-numeric: tabular-nums; }
.saver .s-clock small { font-size: 40px; font-weight: 650; letter-spacing: 0; margin-left: 10px; opacity: .85; }
.saver .s-date { margin-top: 12px; font-size: 32px; font-weight: 650; opacity: .92; }
.saver .next { position: absolute; right: 60px; bottom: 60px; max-width: 520px; text-align: right; text-shadow: 0 2px 20px rgba(0, 0, 0, .4); }
.saver .next .eyebrow { color: rgba(255, 255, 255, .75); }
.saver .next .n-t { margin-top: 6px; font-size: 30px; font-weight: 750; line-height: 1.2; }
.saver .next .n-s { margin-top: 4px; font-size: 20px; font-weight: 600; opacity: .85; }
.saver.ambient { background: radial-gradient(120% 90% at 20% 110%, #3b2a1e 0%, #1a1411 55%, #0e0c0a 100%); }
.saver.ambient .scrim { display: none; }
.saver.ambient .meta { left: 50%; bottom: auto; top: 44%; transform: translate(-50%, -50%); text-align: center; }
.saver.ambient .next { left: 50%; right: auto; bottom: 70px; transform: translateX(-50%); text-align: center; }
.saver .hint { position: absolute; top: 28px; right: 32px; font-size: 15px; font-weight: 650; opacity: 0; transition: opacity .4s; }
.saver.fresh .hint { opacity: .7; }

/* A layout drawn narrower or shorter, like the iPad preview (classes set by _applyScale) */
.frame.cw-md .side { width: 340px; flex-basis: 340px; }
.frame.cw-md .walmart { width: 380px; flex-basis: 380px; }
.frame.cw-md .fc { display: none; }
.frame.cw-md .clock { font-size: 46px; }
.frame.cw-md .cal-title { font-size: 28px; }
.frame.cw-md .ch-item .late, .frame.cw-md .ch-item .auto { display: none; }
.frame.cw-sm .rail { width: 84px; flex-basis: 84px; }
.frame.cw-sm .rail-btn { width: 70px; }
.frame.cw-sm .side { width: 300px; flex-basis: 300px; }
.frame.cw-sm .date b { font-size: 20px; }
.frame.cw-sm .pchip { padding-right: 12px; }
.frame.cw-sm .areas { width: 210px; flex-basis: 210px; }
.frame.cw-sm .mgrid { grid-template-columns: repeat(4, minmax(0, 1fr)); overflow-y: auto; }
.frame.cw-sm .help-grid, .frame.cw-sm .setup { grid-template-columns: 1fr; }
.frame.cw-sm .ch-grid { grid-template-columns: repeat(auto-fit, minmax(126px, 1fr)); gap: 8px; }
.frame.cw-sm .ch-item { font-size: 14.5px; gap: 8px; padding-right: 8px; }
.frame.cw-sm .ch-item .auto { display: none; }
.frame.cw-sm .ch-who { font-size: 14.5px; }
.frame.cw-sm .ag-row { gap: 9px; }
.frame.cw-sm .ag-row .tm { width: 62px; font-size: 13.5px; }
.frame.cw-sm .ag-row .tt { font-size: 16px; }
.frame.cw-sm .ag-row .av { width: 26px; height: 26px; }
.frame.cw-sm .cal-bar { padding-left: 18px; }
.frame.ch-sm .scenes-card { display: none; }
.frame.ch-sm .clock { font-size: 42px; }
.frame.ch-sm .top { min-height: 54px; }
.frame.ch-sm .ch-item { min-height: 44px; }

/* Phone: the same parts, one column, tabs at the bottom. */
.frame.phone { font-size: 16px; }
.p-app { display: flex; flex-direction: column; height: 100%; }
.p-top { display: flex; align-items: center; gap: 8px; padding: calc(10px + env(safe-area-inset-top)) 14px 8px 18px; }
.p-title { flex: 1; min-width: 0; }
.p-title .eyebrow { font-size: 11.5px; }
.p-title h1 { margin: 3px 0 0; font-size: 30px; font-weight: 800; letter-spacing: -.035em; line-height: 1.05; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.p-title .eyebrow { display: flex; align-items: center; gap: 10px; }
.p-wx { display: inline-flex; align-items: center; gap: 3px; color: var(--ink-2); letter-spacing: 0; }
.p-wx svg { width: 17px; height: 17px; }
.icon-btn.sm { width: 44px; height: 44px; }
.icon-btn.sm svg { width: 21px; height: 21px; }
.icon-btn.on { background: var(--ink); color: var(--canvas); }
.p-body { flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; padding: 4px 12px calc(100px + env(safe-area-inset-bottom)); }
.p-stack { display: flex; flex-direction: column; gap: 12px; }
.p-tabs {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 10;
  display: grid; grid-template-columns: repeat(5, minmax(0, 1fr));
  padding: 6px 4px calc(4px + env(safe-area-inset-bottom));
  background: var(--glass); border-top: 1px solid var(--line);
  -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px);
}
.p-tab { border: 0; background: transparent; color: var(--ink-3); display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 6px 0 4px; font-size: 11.5px; font-weight: 750; cursor: pointer; }
.p-tab svg { width: 26px; height: 26px; }
.p-tab.on { color: var(--accent); }
.frame.phone .agenda { flex: none; padding: 16px 14px 8px; }
.frame.phone .agenda-scroll { overflow: visible; }
.frame.phone .ag-row .tt { font-size: 17px; }
.frame.phone .dinner { padding: 14px 16px; }
.frame.phone .chores { padding: 14px 12px; }
.frame.phone .ch-grid { grid-template-columns: 1fr !important; gap: 14px; }
.frame.phone .ch-h button { display: none; }
.frame.phone .scenes-card { display: block; }
.frame.phone .scene { height: 66px; font-size: 13px; }
.p-cams-card { padding: 14px 12px 12px; }
.p-cams-card .eyebrow { margin: 0 4px 10px; }
.p-cams { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.p-cam { position: relative; aspect-ratio: 16 / 9; padding: 0; border: 0; border-radius: 14px; overflow: hidden; background: #0e0c0a; cursor: pointer; }
.p-cam img { width: 100%; height: 100%; object-fit: cover; display: block; }
.p-cam span { position: absolute; left: 8px; bottom: 8px; padding: 3px 9px; border-radius: 999px; background: rgba(0, 0, 0, .55); color: #fff; font-size: 12px; font-weight: 750; }
.p-month { padding: 14px 10px 10px; }
.p-mhead { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 0 6px 12px; }
.p-mhead .cal-title { font-size: 24px; margin: 0; }
.p-mhead .navs button { height: 40px; min-width: 40px; padding: 0 12px; font-size: 14px; }
.p-mhead .navs button.icon { padding: 0; }
.p-dow { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); text-align: center; font-size: 12px; font-weight: 800; color: var(--ink-3); margin-bottom: 4px; }
.p-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 2px; }
.pc-day { height: 52px; padding: 5px 0 0; border: 0; border-radius: 13px; background: transparent; color: var(--ink); display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 16px; font-weight: 700; cursor: pointer; font-variant-numeric: tabular-nums; }
.pc-day .n { min-width: 30px; height: 30px; display: grid; place-items: center; border-radius: 999px; }
.pc-day.other { color: var(--ink-3); opacity: .45; }
.pc-day.today .n { background: var(--accent); color: var(--accent-ink); }
.pc-day.sel { background: var(--sunk); }
.pc-day .dots { display: flex; gap: 3px; height: 6px; }
.pc-day .dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--pm); }
.p-people { flex-wrap: nowrap; overflow-x: auto; padding: 2px; }
.p-people .pchip { flex-shrink: 0; }
.p-daylist { padding: 14px 14px 8px; }
.p-seg { align-self: stretch; }
.p-seg button { flex: 1; height: 42px; }
.frame.phone .shop { flex-direction: column; }
.frame.phone .shop-list { padding: 16px 14px 8px; }
.frame.phone .shop-h h2 { font-size: 26px; }
.frame.phone .glist { overflow: visible; }
.frame.phone .gck { min-height: 54px; font-size: 17px; }
.frame.phone .walmart { width: auto; flex: none; }
.frame.phone .add-bar .inp { height: 52px; font-size: 17px; }
.frame.phone .add-bar .btn { height: 52px; padding: 0 18px; }
.frame.phone .meals-v { gap: 12px; }
.frame.phone .meals-h { flex-direction: column; align-items: stretch; padding: 4px 4px 0; }
.frame.phone .meals-h h2 { font-size: 26px; }
.frame.phone .mgrid { grid-template-columns: 1fr; }
.frame.phone .mcard { padding: 14px 16px; }
.frame.phone .minp { min-height: 52px; font-size: 19px; }
.frame.phone .md em { font-size: 22px; }
.frame.phone .home { flex-direction: column; gap: 12px; }
.frame.phone .areas { width: auto; flex: none; flex-direction: row; overflow-x: auto; padding: 8px; align-self: stretch; }
.frame.phone .area { flex: 0 0 auto; height: 50px; padding-right: 14px; font-size: 15px; }
.frame.phone .area .ai { width: 36px; height: 36px; }
.frame.phone .area-body { overflow: visible; padding: 0; }
.frame.phone .area-top h2 { font-size: 26px; }
.frame.phone .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.frame.phone .tile { min-height: 118px; padding: 12px; border-radius: 20px; }
.frame.phone .tile-h { gap: 9px; }
.frame.phone .tico { width: 44px; height: 44px; }
.frame.phone .tname { font-size: 15px; }
.frame.phone .tst { font-size: 13px; }
.frame.phone .tune { width: 34px; height: 34px; margin-right: -4px; }
.frame.phone .slider, .frame.phone .capbtn, .frame.phone .pair button { height: 42px; }
.frame.phone .step { width: 42px; height: 42px; }
.frame.phone .hero { grid-template-columns: 1fr; }
.frame.phone .snap { min-height: 200px; }
.frame.phone .sec-h { flex-wrap: wrap; }
.frame.phone .moods { justify-content: flex-start; flex-wrap: nowrap; overflow-x: auto; width: 100%; padding-bottom: 2px; }
.frame.phone .mood { flex-shrink: 0; }
.frame.phone .doors { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.frame.phone .btn-row { flex-wrap: wrap; }
.p-hero { padding: 18px; }
.p-hero h2 { margin: 4px 0 4px; font-size: 30px; font-weight: 800; letter-spacing: -.03em; }
.p-hero p { margin: 0 0 14px; color: var(--ink-2); font-weight: 550; line-height: 1.4; }
.btn.wide { width: 100%; }
.p-who { align-items: center; }
.p-who .eyebrow { margin-right: 4px; }
.ph-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
.ph-cell { position: relative; aspect-ratio: 1; padding: 0; border: 0; border-radius: 12px; overflow: hidden; background: var(--sunk); cursor: pointer; }
.ph-cell img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ph-cell.off img { opacity: .35; filter: grayscale(1); }
.ph-badge { position: absolute; left: 6px; bottom: 6px; padding: 3px 8px; border-radius: 999px; background: rgba(0, 0, 0, .7); color: #fff; font-size: 11px; font-weight: 750; }
.ph-big { display: block; width: 100%; max-height: 55vh; object-fit: contain; border-radius: 16px; background: var(--sunk); margin-bottom: 10px; }
.frame.phone .overlay { align-items: flex-end; padding: 0; }
.frame.phone .dlg, .frame.phone .dlg.wide { width: 100%; max-height: 92%; border-radius: 26px 26px 0 0; padding: 22px 18px calc(20px + env(safe-area-inset-bottom)); }
.frame.phone .overlay.enter .dlg { animation: sheet-up .3s var(--ease) both; }
@keyframes sheet-up { from { opacity: 0; transform: translateY(48px); } }
.frame.phone .dlg h2 { font-size: 25px; }
.frame.phone .who-row button { height: 44px; font-size: 15px; }
.frame.phone .who-row button .av { width: 32px; height: 32px; }
.frame.phone .help-grid, .frame.phone .setup { grid-template-columns: 1fr; }
.frame.phone .tabs { width: 100%; flex-wrap: nowrap; overflow-x: auto; }
.frame.phone .tabs button { flex-shrink: 0; padding: 0 14px; }
.frame.phone .prow { flex-wrap: wrap; }
.frame.phone .prow select { flex-basis: 100%; }
.frame.phone .actions { flex-wrap: wrap; }
.frame.phone .drow { flex-wrap: wrap; }
.frame.phone .drow .tm { width: auto; }
.frame.phone .toast-layer { bottom: calc(96px + env(safe-area-inset-bottom)); padding: 0 12px; }
.frame.phone .toast { font-size: 15px; padding-left: 18px; }
.frame.phone .cam-layer.full .cam-bar { top: calc(12px + env(safe-area-inset-top)); left: 12px; right: 12px; overflow-x: auto; }
.frame.phone .cam-bar button { flex-shrink: 0; height: 42px; padding: 0 16px; font-size: 14px; }
.p-people, .cam-pills, .frame.phone .areas, .frame.phone .moods, .frame.phone .tabs, .frame.phone .cam-bar { scrollbar-width: none; }
.p-people::-webkit-scrollbar, .cam-pills::-webkit-scrollbar, .frame.phone .areas::-webkit-scrollbar,
.frame.phone .moods::-webkit-scrollbar, .frame.phone .tabs::-webkit-scrollbar, .frame.phone .cam-bar::-webkit-scrollbar { display: none; }
.frame.phone .tname { white-space: normal; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-height: 1.2; }
.frame.phone .mcard { display: grid; grid-template-columns: 56px minmax(0, 1fr); column-gap: 12px; align-items: center; padding: 12px 14px; }
.frame.phone .md { grid-row: 1 / span 2; flex-direction: column; align-items: center; gap: 0; }
.frame.phone .md em { font-size: 24px; }
.frame.phone .minp { grid-column: 2; min-height: 0; height: 50px; font-size: 18px; padding-top: 12px; }
.frame.phone .mbusy { grid-column: 2; margin: 0; padding: 6px 0 2px; border-top: 0; }
.frame.phone .mbusy.free, .frame.phone .mbusy > .eyebrow { display: none; }
.frame.phone .row2 { gap: 10px; }
.frame.phone .row2 .field { min-width: 0; }
.frame.phone .inp[type=time], .frame.phone .inp[type=date] { min-width: 0; font-size: 17px; padding: 0 12px; }
.frame.phone .mtag { top: 8px; right: 10px; font-size: 10.5px; padding: 3px 8px; }
.frame.phone .mcard.past { display: none; }
`;


class WrightWayCalendarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._cfg = {};
    this._view = "calendar";
    this._calMode = "month";
    const now = new Date();
    this._cursor = new Date(now.getFullYear(), now.getMonth(), 1);
    this._weekStart = startOfWeek(now);
    this._events = [];
    this._evReq = 0;
    this._evAt = 0;
    this._hidden = new Set();
    this._todos = {};
    this._todoUnsubs = {};
    this._todoAt = 0;
    this._pollTodos = false;
    this._forecast = [];
    this._fcUnsub = null;
    this._sheet = null;
    this._sheetKey = "";
    this._now = now;
    this._dayKey = isoDay(now);
    this._timer = null;
    this._idleAt = Date.now();
    this._slideOn = false;
    this._saverForced = false;
    this._slideIdx = 0;
    this._homeCam = null;
    this._liveCam = null;
    this._camEl = null;
    this._camFor = "";
    this._camAwayAt = 0;
    this._camFull = false;
    this._helperSnap = "";
    this._helperOverride = {};
    this._helperDuePrev = {};
    this._homeTab = "main";
    this._homeRoom = null;
    this._homeSnap = "";
    this._slideLock = false;
    this._photoUrls = null;
    this._photoLoadedAt = 0;
    this._icloudNote = "";
    this._slideOnAt = 0;
    this._sleepSent = false;
    this._toast = null;
    this._picCache = null;
    this._onResize = () => this._queueRender();
    this._loadPrefs();
    this._loadDone();
  }

  setConfig(config) {
    const first = !this._cfg || !this._cfg.type && !Object.keys(this._cfg).length;
    this._cfg = config || {};
    if (first && this._phone()) {
      this._view = "today";
      this._calMode = "month";
    }
    this._homeCam = this._cfg.camera || null;
    if (!this._liveCam) this._liveCam = this._homeCam;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._picCache = null;
    // Once Home Assistant confirms a chore tap, the sensor is in charge again.
    Object.keys(this._helperOverride).forEach((id) => {
      const st = hass && hass.states[id];
      if (st && st.state === this._helperOverride[id].state) delete this._helperOverride[id];
    });
    if (this._camEl && this._camEl.tagName !== "IMG") {
      this._camEl.hass = hass;
      const st = hass && hass.states[this._camFor];
      if (st) this._camEl.stateObj = st;
    }
    if (this.isConnected && !this._timer) {
      this._start();
      this._render();
    }
  }

  get hass() { return this._hass; }

  // The same card runs on the kitchen wall and, fed through the NAS, on phones.
  _phone() {
    return this._cfg && this._cfg.layout === "phone";
  }

  getCardSize() { return 24; }

  getGridOptions() {
    return { columns: "full", rows: 18, min_rows: 12 };
  }

  connectedCallback() {
    if (!this._bound) {
      this._bound = true;
      const sr = this.shadowRoot;
      // A wall panel should never scroll by accident; only marked areas scroll.
      const scrolls = "[data-scroll], .dlg, .area-body, .glist, input[type=range], textarea";
      sr.addEventListener("touchmove", (e) => {
        if (this._phone() || (e.target.closest && e.target.closest(scrolls))) return;
        e.preventDefault();
      }, { passive: false });
      sr.addEventListener("wheel", (e) => {
        if (this._phone() || (e.target.closest && e.target.closest(scrolls))) return;
        e.preventDefault();
      }, { passive: false });
      sr.addEventListener("click", (e) => {
        this._idleAt = Date.now();
        if (this._slideOn) {
          this._wakeScreen();
          this._stopSaver();
          return;
        }
        this._onClick(e);
      });
      sr.addEventListener("input", (e) => this._onInput(e));
      sr.addEventListener("pointerdown", (e) => {
        this._idleAt = Date.now();
        if (e.target.matches && e.target.matches("input[type=range]")) this._slideLock = true;
      });
      sr.addEventListener("pointerup", (e) => {
        if (e.target.matches && e.target.matches("input[type=range]")) this._slideLock = false;
        const input = e.target.closest && e.target.closest("input:not([type=checkbox]):not([type=range]), textarea");
        if (input && typeof input.focus === "function") input.focus();
      });
      sr.addEventListener("submit", (e) => this._onSubmit(e));
      sr.addEventListener("change", (e) => this._onChange(e));
      sr.addEventListener("keydown", (e) => this._onKey(e));
    }
    window.addEventListener("resize", this._onResize);
    // Home Assistant detaches and reattaches cards; the heartbeat has to come back with it.
    if (this._hass && !this._timer) this._start();
    this._lockFrame();
    this._render();
  }

  disconnectedCallback() {
    this._stop();
    window.removeEventListener("resize", this._onResize);
  }

  _start() {
    if (this._timer || !this._hass) return;
    this._timer = setInterval(() => this._tick(), 1000);
    this._loadEvents();
    this._subscribeTodos();
    this._subscribeForecast();
    this._loadPhotos();
    this._ensureCameraStream();
  }

  _stop() {
    clearInterval(this._timer);
    this._timer = null;
    clearInterval(this._slideTimer);
    this._slideTimer = null;
    const drop = (p) => Promise.resolve(p).then((u) => { if (typeof u === "function") u(); }).catch(() => {});
    Object.values(this._todoUnsubs).forEach(drop);
    this._todoUnsubs = {};
    if (this._fcUnsub) drop(this._fcUnsub);
    this._fcUnsub = null;
    this._dropCamera();
  }

  _tick() {
    this._now = new Date();
    const key = isoDay(this._now);
    if (key !== this._dayKey) {
      this._dayKey = key;
      this._onNewDay();
    }
    this._tickClock();
    this._tickIdle();
    this._tickAlert();
    this._tickHelpers();
    this._tickHome();
    this._tickCamera();
    const t = Date.now();
    // Phones add events all day; the wall has to go and look for them.
    if (t - this._evAt > 5 * 60 * 1000) this._loadEvents();
    if (this._pollTodos && t - this._todoAt > 60 * 1000) this._loadTodos();
    // Often enough that a photo added from a phone shows up soon.
    if (t - (this._photoLoadedAt || 0) > 5 * 60 * 1000) this._loadPhotos();
  }

  _onNewDay() {
    this._done = {};
    this._saveDone();
    if (Date.now() - this._idleAt > 60 * 1000) this._goHome();
    this._loadEvents();
    if (this._pollTodos) this._loadTodos();
    this._render();
  }

  // Back to today's calendar, the way the family expects to find the wall.
  _goHome() {
    const now = new Date();
    this._view = this._phone() ? "today" : "calendar";
    this._sheet = null;
    this._camFull = false;
    this._hidden.clear();
    this._homeTab = "main";
    this._cursor = new Date(now.getFullYear(), now.getMonth(), 1);
    this._weekStart = startOfWeek(now);
    this._loadEvents();
  }

  _ensureFrame() {
    if (this._frame) return;
    const sr = this.shadowRoot;
    let adopted = false;
    try {
      if ("adoptedStyleSheets" in sr && typeof CSSStyleSheet === "function") {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(CSS);
        sr.adoptedStyleSheets = [sheet];
        adopted = true;
      }
    } catch (e) { /* older WebView: fall back to a style tag */ }
    sr.innerHTML = `${adopted ? "" : `<style>${CSS}</style>`}
      <div class="frame">
        <div class="root"></div>
        <div class="cam-layer" hidden data-act="cam-tap">
          <div class="cam-host"></div>
          <div class="cam-tag"></div>
          <div class="cam-alert" hidden><span>Car in the driveway</span></div>
          <div class="cam-bar"></div>
        </div>
        <div class="saver" hidden>
          <img class="a" alt=""><img class="b" alt="">
          <div class="scrim"></div>
          <div class="meta"><div class="s-clock"></div><div class="s-date"></div></div>
          <div class="next"></div>
          <div class="hint">Tap anywhere to come back</div>
        </div>
        <div class="toast-layer"></div>
      </div>`;
    this._frame = sr.querySelector(".frame");
    this._root = sr.querySelector(".root");
    this._camLayer = sr.querySelector(".cam-layer");
    this._camHost = sr.querySelector(".cam-host");
    this._saver = sr.querySelector(".saver");
    this._toastLayer = sr.querySelector(".toast-layer");
    this._injectFont();
  }

  // The wall is designed as a 1920 by 1080 picture. A panel that reports fewer
  // pixels (Android's display size turned up) or a tablet gets the same layout
  // drawn smaller, so nothing wraps or gets cut off. Size in Settings adjusts it.
  _applyScale() {
    const f = this._frame;
    if (!f) return;
    const vw = this.clientWidth || window.innerWidth || 1920;
    const vh = this.clientHeight || window.innerHeight || 1080;
    f.classList.toggle("phone", this._phone());
    if (this._phone()) {
      Object.assign(this, { _scale: 1, _cw: vw, _ch: vh, _vw: vw, _vh: vh });
      f.style.width = "";
      f.style.height = "";
      f.style.transform = "";
      ["cw-md", "cw-sm", "ch-sm"].forEach((c) => f.classList.remove(c));
      return;
    }
    const wide = vw / vh >= 1.7;
    let auto = 1;
    if (wide && vw < 1920) auto = vw / 1920;
    else if (!wide && vw < 1440) auto = vw / 1440;
    auto = Math.max(0.6, Math.min(1, auto));
    const scale = auto * (Number(this._prefs.size) || 1);
    const cw = Math.ceil(vw / scale);
    const ch = Math.ceil(vh / scale);
    Object.assign(this, { _scale: scale, _cw: cw, _ch: ch, _vw: vw, _vh: vh });
    f.style.width = `${cw}px`;
    f.style.height = `${ch}px`;
    f.style.transform = scale === 1 ? "" : `scale(${scale})`;
    f.classList.toggle("cw-md", cw <= 1500);
    f.classList.toggle("cw-sm", cw <= 1200);
    f.classList.toggle("ch-sm", ch <= 900);
  }

  _injectFont() {
    const doc = this.ownerDocument || document;
    if (!doc.getElementById("ww-font")) {
      const s = doc.createElement("style");
      s.id = "ww-font";
      s.textContent = `@font-face{font-family:"WW Figtree";src:url("${FONT_URL}") format("woff2");font-weight:300 900;font-style:normal;font-display:swap}`;
      (doc.head || doc.documentElement).appendChild(s);
    }
    if (doc.fonts && doc.fonts.load) {
      doc.fonts.load('700 16px "WW Figtree"').then(() => {
        this._fitMonth();
        this._placeCamera();
      }).catch(() => {});
    }
  }

  _lockFrame() {
    const fill = (el) => {
      if (!el || !el.style) return;
      el.style.setProperty("padding", "0", "important");
      el.style.setProperty("margin", "0", "important");
      el.style.setProperty("border", "none", "important");
      el.style.setProperty("box-shadow", "none", "important");
      el.style.setProperty("background", "transparent", "important");
      el.style.setProperty("width", "100%", "important");
      el.style.setProperty("max-width", "none", "important");
      el.style.setProperty("height", "100%", "important");
      el.style.setProperty("max-height", "none", "important");
      el.style.setProperty("overflow", "hidden", "important");
      el.style.setProperty("--ha-view-sections-padding", "0px");
      el.style.setProperty("--ha-view-sections-max-width", "100vw");
      el.style.setProperty("--view-padding", "0px");
    };
    this.style.cssText = "position:fixed;inset:0;width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;overflow:hidden;z-index:1;display:block;";
    const doc = this.ownerDocument;
    if (doc && !doc.getElementById("ww-wall-lock")) {
      const s = doc.createElement("style");
      s.id = "ww-wall-lock";
      s.textContent = `
        html, body { overflow: hidden !important; }
        :root {
          --ha-view-sections-padding: 0px;
          --ha-view-sections-max-width: 100vw;
          --view-padding: 0px;
        }
        hui-view, hui-panel-view, hui-sections-view, hui-masonry-view, hui-card, ha-card {
          padding: 0 !important;
          margin: 0 !important;
          max-width: none !important;
        }
      `;
      (doc.head || doc.documentElement).appendChild(s);
    }
    const seen = new Set();
    let el = this.parentElement;
    for (let i = 0; i < 20 && el && !seen.has(el); i += 1) {
      seen.add(el);
      fill(el);
      if (el.shadowRoot) {
        el.shadowRoot.querySelectorAll(".container, #view, .content").forEach(fill);
      }
      const tag = (el.tagName || "").toLowerCase();
      if (tag === "home-assistant" || tag === "html") break;
      const root = el.getRootNode && el.getRootNode();
      el = el.parentElement || (root && root.host) || null;
    }
  }


  _loadPrefs() {
    const d = {
      muted: true, order: DEFAULT_ORDER.slice(), colors: {}, calEntities: {}, theme: "auto",
      idle_seconds: 90, photo_seconds: 12, sleep_minutes: 0, icloud_album: "", tips: true,
      calMode: "month", staples: {}, favorites: [], meal_notes: "", size: 1,
    };
    const num = (v, dflt) => (v != null && Number.isFinite(Number(v)) ? Number(v) : dflt);
    try {
      const raw = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") || {};
      this._prefs = {
        ...d,
        muted: raw.muted !== false,
        order: Array.isArray(raw.order) && raw.order.length ? raw.order : d.order,
        colors: raw.colors && typeof raw.colors === "object" ? raw.colors : {},
        calEntities: raw.calEntities && typeof raw.calEntities === "object" ? raw.calEntities : {},
        theme: raw.theme === "light" || raw.theme === "night" ? raw.theme : "auto",
        idle_seconds: num(raw.idle_seconds, 90),
        photo_seconds: num(raw.photo_seconds, 12),
        sleep_minutes: num(raw.sleep_minutes, 0),
        icloud_album: raw.icloud_album || "",
        tips: raw.tips !== false,
        calMode: raw.calMode === "week" ? "week" : "month",
        size: [0.9, 1, 1.12, 1.25].includes(Number(raw.size)) ? Number(raw.size) : 1,
        staples: raw.staples && typeof raw.staples === "object" ? raw.staples : {},
        favorites: Array.isArray(raw.favorites) ? raw.favorites.filter(Boolean).slice(0, 24) : [],
        meal_notes: String(raw.meal_notes || ""),
      };
    } catch (e) {
      this._prefs = d;
    }
    this._calMode = this._prefs.calMode;
  }

  _savePrefs() {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(this._prefs)); } catch (e) { /* kiosk may block */ }
  }


  // Chores checked off today stay on the wall with a tick until midnight.
  _loadDone() {
    try {
      const raw = JSON.parse(localStorage.getItem(`${PREFS_KEY}-done`) || "{}") || {};
      this._done = raw.day === isoDay(new Date()) && raw.items ? raw.items : {};
    } catch (e) {
      this._done = {};
    }
  }

  _saveDone() {
    try {
      localStorage.setItem(`${PREFS_KEY}-done`, JSON.stringify({ day: isoDay(this._now), items: this._done }));
    } catch (e) { /* kiosk may block */ }
  }

  _sortByOrder(items, nameOf) {
    const order = (this._prefs && this._prefs.order) || DEFAULT_ORDER;
    return items.slice().sort((a, b) => {
      const ia = order.indexOf(nameOf(a));
      const ib = order.indexOf(nameOf(b));
      return (ia < 0 ? 500 : ia) - (ib < 0 ? 500 : ib);
    });
  }

  _cals() {
    const raw = this._cfg.calendars || this._cfg.entities || [];
    const colors = (this._prefs && this._prefs.colors) || {};
    const entities = (this._prefs && this._prefs.calEntities) || {};
    const list = raw.map((c) => {
      if (typeof c === "string") return { entity: entities[c] || c, name: c, color: colors[c] || "#94a3b8" };
      const name = c.name || c.entity;
      return {
        entity: entities[name] || c.entity,
        name,
        color: colors[name] || c.color || "#94a3b8",
      };
    }).filter((c) => c.entity);
    return this._sortByOrder(list, (c) => c.name);
  }

  _chores() {
    const colors = (this._prefs && this._prefs.colors) || {};
    const list = (this._cfg.chores || []).filter((c) => c && c.entity).map((c) => ({
      ...c,
      color: colors[c.name] || c.color,
    }));
    return this._sortByOrder(list, (c) => c.name);
  }

  _houseChores() {
    const listed = this._cfg.house_chores;
    const raw = Array.isArray(listed) && listed.length ? listed : DEFAULT_HOUSE_CHORES;
    return raw.filter((c) => c && c.helper && (!this._hass || this._hass.states[c.helper]));
  }


  _helperState(id) {
    const st = this._hass && this._hass.states[id];
    const real = st ? st.state : "";
    const o = this._helperOverride[id];
    if (o) {
      // Hold a tap until Home Assistant agrees, then trust the sensor again.
      if (real === o.state || Date.now() - o.at > 15000) delete this._helperOverride[id];
      else return o.state;
    }
    return real;
  }

  _helperDue(c) {
    const state = this._helperState(c.helper);
    if (!state) return false;
    const on = state === "on";
    return (c.mode || "done") === "due" ? on : !on;
  }

  _chorePeople() {
    const people = [];
    const seen = new Set();
    const add = (name, color, entity) => {
      if (!name || seen.has(name)) return;
      seen.add(name);
      people.push({ name, color: color || "#5eead4", entity: entity || null });
    };
    this._chores().forEach((c) => add(c.name, c.color, c.entity));
    this._houseChores().forEach((c) => add(c.who || "House", c.color, null));
    const colors = (this._prefs && this._prefs.colors) || {};
    people.forEach((p) => { if (colors[p.name]) p.color = colors[p.name]; });
    return this._sortByOrder(people, (p) => p.name);
  }

  _helperSig() {
    return this._houseChores().map((c) => `${c.helper}:${this._helperState(c.helper)}`).join("|");
  }


  _tickHelpers() {
    // A sensor finishing a chore on its own, like the litter box, counts as done today.
    let changed = false;
    this._houseChores().forEach((c) => {
      const due = this._helperDue(c);
      if (this._helperDuePrev[c.helper] === true && !due) {
        const key = `h:${c.helper}`;
        if (!this._done[key]) {
          this._done[key] = { who: c.who || "House", name: c.name, kind: "helper", helper: c.helper, mode: c.mode || "done" };
          changed = true;
        }
      }
      this._helperDuePrev[c.helper] = due;
    });
    if (changed) this._saveDone();
    const sig = this._helperSig();
    if (sig === this._helperSnap && !changed) return;
    this._helperSnap = sig;
    this._refreshChores();
  }

  _refreshChores() {
    const wrap = this._root && this._root.querySelector(".chores");
    if (!wrap || this._view !== "calendar") return;
    const tmp = document.createElement("div");
    tmp.innerHTML = this._renderChores();
    const next = tmp.firstElementChild;
    if (!next) return;
    wrap.replaceWith(next);
    this._fitMonth();
  }

  _weather() {
    const id = this._cfg.weather;
    return id && this._hass ? this._hass.states[id] : null;
  }

  _alertOn() {
    const id = this._cfg.camera_alert;
    if (!id || !this._hass || !this._hass.states[id]) return false;
    return this._hass.states[id].state === "on";
  }

  _cameraList() {
    const homeId = this._homeCam || this._cfg.camera;
    const extras = this._cfg.cameras || [];
    const out = [];
    const seen = new Set();
    const add = (entity, name) => {
      if (!entity || seen.has(entity)) return;
      if (this._hass && !this._hass.states[entity]) return;
      seen.add(entity);
      out.push({ entity, name: name || this._cameraLabel(entity) });
    };
    add(homeId, "Driveway");
    extras.forEach((c) => add(c.entity, c.name));
    return out;
  }


  _photos() {
    return Array.isArray(this._photoUrls) ? this._photoUrls : [];
  }

  _icloudToken() {
    const raw = (this._prefs && this._prefs.icloud_album) || this._cfg.icloud_album || "";
    const s = String(raw).trim();
    if (!s) return "";
    const hash = s.split("#")[1];
    if (hash) return hash.replace(/[^A-Za-z0-9]/g, "");
    const m = s.match(/shared\/album\/([A-Za-z0-9]+)/i) || s.match(/sharedalbum\/([A-Za-z0-9]+)/i);
    if (m) return m[1];
    if (/^[A-Za-z0-9]{8,}$/.test(s)) return s;
    return "";
  }

  _icloudBase(token) {
    const set = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const toInt = (e) => {
      let t = 0;
      for (let n = 0; n < e.length; n += 1) t = t * 62 + Math.max(0, set.indexOf(e[n]));
      return t;
    };
    const n = token[0] === "A" ? toInt(token[1] || "0") : toInt(token.substring(1, 3));
    const part = n < 10 ? `0${n}` : String(n);
    return `https://p${part}-sharedstreams.icloud.com/${token}/sharedstreams/`;
  }

  async _icloudPost(url, body) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch (e) { data = {}; }
    return { status: res.status, data };
  }

  async _loadICloudAlbum() {
    const token = this._icloudToken();
    if (!token) return [];
    let base = this._icloudBase(token);
    try {
      let stream = await this._icloudPost(`${base}webstream`, { streamCtag: null });
      if (stream.status === 330 && stream.data && stream.data["X-Apple-MMe-Host"]) {
        base = `https://${stream.data["X-Apple-MMe-Host"]}/${token}/sharedstreams/`;
        stream = await this._icloudPost(`${base}webstream`, { streamCtag: null });
      }
      const photos = (stream.data && stream.data.photos) || [];
      const guids = photos.map((p) => p.photoGuid).filter(Boolean);
      const items = {};
      for (let i = 0; i < guids.length; i += 20) {
        const chunk = guids.slice(i, i + 20);
        const assets = await this._icloudPost(`${base}webasseturls`, { photoGuids: chunk });
        Object.assign(items, (assets.data && assets.data.items) || {});
      }
      const urls = [];
      photos.forEach((photo) => {
        if (photo.mediaAssetType === "video") return;
        const ders = Object.values(photo.derivatives || {});
        let best = null;
        ders.forEach((d) => {
          const w = Number(d.width) || 0;
          if (!best || Math.abs(w - 1920) < Math.abs((Number(best.width) || 0) - 1920)) best = d;
        });
        if (!best || !best.checksum || !items[best.checksum]) return;
        const it = items[best.checksum];
        if (it.url_location && it.url_path) urls.push(`https://${it.url_location}${it.url_path}`);
      });
      this._icloudNote = urls.length
        ? `Loaded ${urls.length} photos from the iCloud shared album.`
        : "Shared album opened, but no still photos came back.";
      return urls.slice(0, 80);
    } catch (e) {
      this._icloudNote = "This tablet cannot talk to iCloud directly (Apple blocks it in the browser). Put JPEGs in Home Assistant Media → family, or keep the album link for a later HA sync.";
      return [];
    }
  }


  async _loadPhotos() {
    this._photoLoadedAt = Date.now();
    const out = [];
    (Array.isArray(this._cfg.photos) ? this._cfg.photos : []).forEach((p) => {
      const u = typeof p === "string" ? p : p && p.url;
      if (u) out.push(u);
    });
    (await this._loadICloudAlbum()).forEach((u) => out.push(u));
    // Photos the family adds from their phones, kept by the WrightWay app on the NAS.
    if (this._cfg.photos_url) {
      try {
        const res = await fetch(this._cfg.photos_url, { cache: "no-store" });
        if (res.ok) ((await res.json()).photos || []).forEach((ph) => { if (ph && ph.url) out.push(ph.url); });
      } catch (e) { /* NAS offline: the other sources and the clock still work */ }
    }
    this._mediaCount = 0;
    if (this._hass && this._hass.connection) {
      const folder = this._cfg.photo_folder || "family";
      try {
        const browse = await this._hass.connection.sendMessagePromise({
          type: "media_source/browse_media",
          media_content_id: `media-source://media_source/local/${folder}`,
        });
        (browse && browse.children ? browse.children : []).forEach((child) => {
          const kind = String(child.media_content_type || "");
          const title = child.title || "";
          if (child.can_expand) return;
          if (!kind.startsWith("image") && !/\.(jpe?g|png|webp|gif)$/i.test(title)) return;
          // Resolved just before it shows, so a big folder costs nothing up front.
          out.push({ media: child.media_content_id });
          this._mediaCount += 1;
        });
      } catch (e) { /* no family folder yet */ }
    }
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    this._photoUrls = out;
  }

  _fully() {
    try {
      return window.fully || (window.top && window.top.fully) || null;
    } catch (e) {
      return null;
    }
  }

  _wakeScreen() {
    const f = this._fully();
    if (f && typeof f.turnScreenOn === "function") {
      try { f.turnScreenOn(); } catch (e) { /* not Fully */ }
    }
  }

  _sleepScreen() {
    const f = this._fully();
    if (f && typeof f.turnScreenOff === "function") {
      try { f.turnScreenOff(false); } catch (e) { /* not Fully */ }
    }
  }

  _idleWait() {
    if (this._prefs && Number.isFinite(Number(this._prefs.idle_seconds))) {
      return Number(this._prefs.idle_seconds);
    }
    const sec = Number(this._cfg.idle_seconds);
    return Number.isFinite(sec) ? sec : 90;
  }

  _photoWait() {
    const sec = this._prefs && Number(this._prefs.photo_seconds);
    return Number.isFinite(sec) && sec > 0 ? sec : 12;
  }

  _cameraLabel(entity) {
    if (!entity) return "Driveway";
    if (entity === (this._homeCam || this._cfg.camera)) return "Driveway";
    const named = (this._cfg.cameras || []).find((c) => c.entity === entity);
    if (named && named.name) return named.name;
    const st = this._hass && this._hass.states[entity];
    let name = (st && st.attributes && st.attributes.friendly_name) || "";
    name = name.replace(/\s*High resolution channel\s*/gi, "").trim();
    name = name.replace(/\s*Low resolution channel\s*/gi, "").trim();
    if (!name || /channel/i.test(name)) {
      if (/g6_bullet/.test(entity)) return "Driveway";
      return "Camera";
    }
    return name;
  }

  _theme() {
    const pref = (this._prefs && this._prefs.theme) || "auto";
    if (pref === "light" || pref === "night") return pref;
    if (this._phone() && window.matchMedia) return window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "light";
    const h = this._now.getHours() + this._now.getMinutes() / 60;
    return (h >= 19 || h < 6.5) ? "night" : "light";
  }


  _tickClock() {
    const c = clockParts(this._now);
    const stamp = `${c.time}${c.ap}`;
    if (stamp !== this._clockStamp) {
      this._clockStamp = stamp;
      const el = this._root && this._root.querySelector("#clock");
      if (el) el.innerHTML = `${c.time}<small>${c.ap}</small>`;
      const greet = this._root && this._root.querySelector("#greet");
      if (greet) greet.textContent = this._greeting();
      if (this._slideOn) this._renderSaverMeta();
      this._refreshAgenda();
    }
    const night = this._theme() === "night";
    if (this._frame && this._frame.classList.contains("night") !== night) this._frame.classList.toggle("night", night);
  }

  _greeting() {
    const h = this._now.getHours();
    const part = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    return this._cfg.greeting_name ? `${part}, ${this._cfg.greeting_name}` : part;
  }

  // The Today list dims past events as the day goes on.
  _refreshAgenda() {
    const box = this._root && this._root.querySelector(".agenda-scroll");
    if (!box || this._view !== "calendar") return;
    const top = box.scrollTop;
    box.innerHTML = this._renderAgendaBody();
    box.scrollTop = top;
  }

  _tickAlert() {
    const badge = this._camLayer && this._camLayer.querySelector(".cam-alert");
    if (badge) badge.hidden = !this._alertOn();
  }

  _tickIdle() {
    if (this._camFull) {
      if (Date.now() - this._idleAt > 5 * 60 * 1000) {
        this._camFull = false;
        this._render();
      }
      return;
    }
    if (this._phone()) return;
    const wait = this._idleWait();
    const want = this._saverForced || (wait > 0 && Date.now() - this._idleAt > wait * 1000);
    if (want && !this._slideOn) this._startSaver();
    else if (!want && this._slideOn) this._stopSaver();
    if (this._slideOn && !this._sleepSent) {
      const mins = this._prefs && Number(this._prefs.sleep_minutes);
      let sleepMs = 0;
      if (mins > 0) sleepMs = mins * 60 * 1000;
      else if (mins < 0 && this._theme() === "night") sleepMs = 5 * 60 * 1000;
      if (sleepMs && Date.now() - this._slideOnAt > sleepMs) {
        this._sleepSent = true;
        this._sleepScreen();
      }
    }
  }

  _startSaver() {
    if (!this._saver) return;
    this._slideOn = true;
    this._slideOnAt = Date.now();
    this._sleepSent = false;
    this._goHome();
    this._render();
    const photos = this._photos();
    this._saver.hidden = false;
    this._saver.classList.toggle("ambient", !photos.length);
    this._saver.classList.add("fresh");
    setTimeout(() => this._saver && this._saver.classList.remove("fresh"), 4000);
    this._renderSaverMeta();
    clearInterval(this._slideTimer);
    this._slideTimer = null;
    if (photos.length) {
      this._advanceSlide();
      this._slideTimer = setInterval(() => this._advanceSlide(), this._photoWait() * 1000);
    }
    this._placeCamera();
  }

  _stopSaver() {
    this._slideOn = false;
    this._saverForced = false;
    this._sleepSent = false;
    clearInterval(this._slideTimer);
    this._slideTimer = null;
    if (this._saver) {
      this._saver.hidden = true;
      this._saver.querySelectorAll("img").forEach((i) => i.classList.remove("on", "kb"));
    }
    this._idleAt = Date.now();
    this._render();
  }

  async _photoSrc(p) {
    if (typeof p === "string") return p;
    if (p && p.media && this._hass) {
      const res = await this._hass.connection.sendMessagePromise({
        type: "media_source/resolve_media",
        media_content_id: p.media,
      });
      return res && res.url ? this._hass.hassUrl(res.url) : "";
    }
    return "";
  }

  async _advanceSlide() {
    const photos = this._photos();
    if (!photos.length || !this._saver) return;
    const a = this._saver.querySelector("img.a");
    const b = this._saver.querySelector("img.b");
    const incoming = a.classList.contains("on") ? b : a;
    const outgoing = incoming === a ? b : a;
    // Skip anything that will not load, such as an iPhone HEIC file.
    for (let tries = 0; tries < Math.min(photos.length, 6); tries += 1) {
      const p = photos[this._slideIdx % photos.length];
      this._slideIdx = (this._slideIdx + 1) % photos.length;
      let src = "";
      try { src = await this._photoSrc(p); } catch (e) { src = ""; }
      if (!src) continue;
      const ok = await new Promise((resolve) => {
        incoming.onload = () => resolve(true);
        incoming.onerror = () => resolve(false);
        incoming.src = src;
      });
      if (!ok || !this._slideOn) continue;
      incoming.style.setProperty("--kb", `${this._photoWait() + 3}s`);
      incoming.classList.remove("kb");
      void incoming.offsetWidth;
      incoming.classList.add("kb", "on");
      outgoing.classList.remove("on");
      this._renderSaverMeta();
      return;
    }
  }

  _nextEvent() {
    const now = this._now;
    for (let off = 0; off < 2; off += 1) {
      const key = isoDay(addDays(now, off));
      const ev = this._dayList(key).find((e) => !e._allDay && e._first === key && (off > 0 || e._s > now));
      if (ev) return { ev, label: off ? "Tomorrow" : "Up next", when: hm(ev._s) };
    }
    return null;
  }

  _renderSaverMeta() {
    const s = this._saver;
    if (!s) return;
    const n = this._now;
    const c = clockParts(n);
    const wx = this._weather();
    const temp = wx && wx.attributes && wx.attributes.temperature != null ? ` · ${Math.round(wx.attributes.temperature)}°` : "";
    s.querySelector(".s-clock").innerHTML = `${c.time}<small>${c.ap}</small>`;
    s.querySelector(".s-date").textContent = `${WEEKDAYS_LONG[n.getDay()]}, ${MONTHS[n.getMonth()]} ${n.getDate()}${temp}`;
    const next = this._nextEvent();
    s.querySelector(".next").innerHTML = next
      ? `<div class="eyebrow">${esc(next.label)}</div><div class="n-t">${esc(next.ev.summary || "Event")}</div><div class="n-s">${esc(next.when)} · ${esc(next.ev._name || "")}</div>`
      : "";
  }

  _muted() {
    return !this._prefs || this._prefs.muted !== false;
  }

  _applyMute() {
    const muted = this._muted();
    this.shadowRoot.querySelectorAll("ha-camera-stream, ha-web-rtc-player, ha-hls-player, video, audio").forEach((el) => {
      try {
        el.muted = muted;
        if ("volume" in el) el.volume = muted ? 0 : 1;
      } catch (e) { /* ignore */ }
    });
  }


  // Panel views with only this card never load Home Assistant's live stream
  // element, so ask for a picture card once to pull it in.
  _ensureCameraStream() {
    if (customElements.get("ha-camera-stream")) return;
    if (this._camLoading) return;
    this._camLoading = true;
    try {
      if (typeof window.loadCardHelpers === "function") {
        window.loadCardHelpers().then((h) => {
          const el = h.createCardElement({ type: "picture-entity", entity: this._homeCam || "camera.none", camera_view: "live" });
          if (el) el.hass = this._hass;
        }).catch(() => {});
      }
    } catch (e) { /* not inside Home Assistant */ }
    customElements.whenDefined("ha-camera-stream").then(() => {
      if (this._camEl && this._camEl.tagName === "IMG") this._dropCamera();
      this._placeCamera();
    });
  }

  _placeCamera() {
    const layer = this._camLayer;
    if (!layer || !this._root) return;
    const id = this._liveCam || this._homeCam;
    const slot = this._root.querySelector("#cam-slot");
    const show = !!id && !!this._hass && !this._slideOn && (this._camFull || (!this._phone() && !!slot && this._view === "calendar"));
    if (!show) {
      if (!layer.hidden) {
        layer.hidden = true;
        this._camAwayAt = Date.now();
      }
      return;
    }
    this._camAwayAt = 0;
    layer.hidden = false;
    layer.classList.toggle("full", this._camFull);
    if (this._camFull) {
      layer.style.cssText = "";
    } else {
      const f = this._frame.getBoundingClientRect();
      const r = slot.getBoundingClientRect();
      const k = this._scale || 1;
      layer.style.cssText = `left:${(r.left - f.left) / k}px;top:${(r.top - f.top) / k}px;width:${r.width / k}px;height:${r.height / k}px`;
    }
    this._mountCamera(id);
    layer.querySelector(".cam-tag").textContent = this._cameraLabel(id);
    layer.querySelector(".cam-alert").hidden = !this._alertOn();
    layer.querySelector(".cam-bar").innerHTML = this._camFull
      ? this._cameraList().map((c) => `<button type="button" class="${c.entity === id ? "on" : ""}" data-act="cam" data-entity="${esc(c.entity)}">${esc(c.name)}</button>`).join("")
        + `<button type="button" class="x" data-act="cam-close">${ICONS.close}Close</button>`
      : "";
  }

  _mountCamera(id) {
    const st = this._hass && this._hass.states[id];
    if (!st || !this._camHost) return;
    const fit = this._camFull ? "contain" : "cover";
    if (this._camEl && this._camFor === id) {
      if (this._camEl.tagName !== "IMG") {
        this._camEl.fitMode = fit;
        this._camEl.setAttribute("fit-mode", fit);
      }
      this._applyMute();
      return;
    }
    this._dropCamera();
    this._camFor = id;
    if (customElements.get("ha-camera-stream")) {
      const el = document.createElement("ha-camera-stream");
      el.hass = this._hass;
      el.stateObj = st;
      el.muted = this._muted();
      el.fitMode = fit;
      el.setAttribute("fit-mode", fit);
      this._camHost.appendChild(el);
      this._camEl = el;
    } else if (st.attributes.entity_picture) {
      const img = document.createElement("img");
      img.alt = this._cameraLabel(id);
      const tick = () => {
        const cur = this._hass && this._hass.states[id];
        if (cur && cur.attributes.entity_picture) img.src = `${this._hass.hassUrl(cur.attributes.entity_picture)}&t=${Date.now()}`;
      };
      tick();
      this._snapTimer = setInterval(tick, 2500);
      this._camHost.appendChild(img);
      this._camEl = img;
    }
    this._applyMute();
  }

  _dropCamera() {
    clearInterval(this._snapTimer);
    this._snapTimer = null;
    if (this._camHost) this._camHost.innerHTML = "";
    this._camEl = null;
    this._camFor = "";
  }

  // A stream nobody can see still costs the tablet; let it go after a minute.
  _tickCamera() {
    if (this._camAwayAt && this._camEl && Date.now() - this._camAwayAt > 60 * 1000) this._dropCamera();
  }

  _switchCamera(entity) {
    this._liveCam = entity || this._homeCam;
    this._placeCamera();
    if (this._root) {
      this._root.querySelectorAll(".cam-pills button").forEach((btn) => {
        btn.classList.toggle("on", btn.dataset.entity === this._liveCam);
      });
    }
  }

  async _pressScene(entity) {
    if (!entity || !this._hass) return;
    await this._hass.callService("input_button", "press", { entity_id: entity });
  }

  _entState(id) {
    const st = this._hass && this._hass.states[id];
    return st ? st.state : "";
  }

  _entOn(id) {
    const s = this._entState(id);
    return s === "on" || s === "open" || s === "opening" || s === "cleaning" || s === "returning";
  }

  _resolveEnt(spec) {
    if (!spec) return null;
    if (spec.entity && this._hass && this._hass.states[spec.entity]) return spec.entity;
    if (spec.candidates && this._hass) {
      const hit = spec.candidates.find((id) => this._hass.states[id]);
      if (hit) return hit;
    }
    const hints = (spec.hints || []).map((h) => String(h).toLowerCase()).filter(Boolean);
    if (this._hass && hints.length) {
      const domains = spec.domains || ["light", "switch", "fan", "cover"];
      for (const [id, st] of Object.entries(this._hass.states)) {
        const domain = id.split(".")[0];
        if (!domains.includes(domain)) continue;
        const fn = String((st.attributes && st.attributes.friendly_name) || "").toLowerCase();
        const blob = `${id.replace(/_/g, " ")} ${fn}`;
        if (hints.every((h) => blob.includes(h))) return id;
      }
    }
    return spec.entity || null;
  }

  _allSections() {
    return Object.keys(HOME_SECTIONS).flatMap((area) => HOME_SECTIONS[area] || []);
  }

  _sectionById(id) {
    return this._allSections().find((s) => s.id === id) || null;
  }

  _sectionEntities(sec) {
    return (sec.entities || []).map((e) => this._resolveEnt(e)).filter(Boolean);
  }

  _sectionLightIds(sec) {
    return this._sectionEntities(sec).filter((id) => id.startsWith("light."));
  }

  _areaOnCount(areaId) {
    if (areaId === "vacuum") return this._entOn("vacuum.roborock_qrevo_pro") ? 1 : 0;
    if (areaId === "garage") {
      return GARAGE_DOORS.filter((d) => this._entOn(d.entity)).length
        + HOME_OUTSIDE.filter((e) => this._entOn(e.entity)).length
        + GARAGE_LIGHTS.filter((e) => this._entOn(e.entity)).length
        + GARAGE_FANS.filter((e) => this._entOn(e.entity)).length
        + (this._entOn("switch.air_exchanger") ? 1 : 0);
    }
    const sections = HOME_SECTIONS[areaId] || [];
    let n = 0;
    sections.forEach((sec) => {
      this._sectionEntities(sec).forEach((id) => { if (this._entOn(id)) n += 1; });
    });
    return n;
  }

  _homeEntities() {
    const ids = [];
    this._allSections().forEach((sec) => this._sectionEntities(sec).forEach((id) => ids.push(id)));
    HOME_OUTSIDE.forEach((e) => ids.push(e.entity));
    HOME_VACUUM_ROOMS.forEach((e) => ids.push(e.entity));
    GARAGE_LIGHTS.forEach((e) => ids.push(e.entity));
    ids.push("vacuum.roborock_qrevo_pro", "input_boolean.auto_vacuum_enabled");
    ids.push("input_boolean.vacuum_qp_twice", "input_boolean.vacuum_qp_mopping", "input_boolean.mop_when_gone_next");
    ids.push("select.kitchen_roborock_qrevo_pro_cleaning_mode", "sensor.roborock_qrevo_pro_battery");
    ids.push("sensor.roborock_qrevo_pro_status", "image.roborock_qrevo_pro_upstairs");
    GARAGE_DOORS.forEach((d) => ids.push(d.entity));
    GARAGE_FANS.forEach((e) => ids.push(e.entity));
    ids.push("camera.garage_high", "binary_sensor.tesla_wall_connector_vehicle_connected");
    ids.push("climate.garage_thermostat", "switch.air_exchanger");
    ids.push("sensor.temperature_sensor", "sensor.temperature_sensor_humidity_sensor");
    ids.push("input_number.garage_humidity_setpoint", "input_boolean.enable_garage_humidity_sensor");
    ids.push("sensor.current_charge_cost", "sensor.tesla_wall_connector_status", "input_boolean.fan_periodic_run");
    (this._cfg.scenes || []).forEach((s) => ids.push(s.entity));
    return ids;
  }

  _homeSig() {
    return this._homeEntities().map((id) => `${id}:${this._entState(id)}`).join("|");
  }

  async _toggleEntity(entity) {
    if (!entity || !this._hass) return;
    const domain = entity.split(".")[0];
    if (domain === "cover") {
      await this._hass.callService("cover", "toggle", { entity_id: entity });
      return;
    }
    if (domain === "input_button") {
      await this._hass.callService("input_button", "press", { entity_id: entity });
      return;
    }
    await this._hass.callService(domain, "toggle", { entity_id: entity });
  }

  async _vacuumCmd(cmd) {
    if (!this._hass) return;
    await this._hass.callService("vacuum", cmd, { entity_id: "vacuum.roborock_qrevo_pro" });
  }

  _lightLook(entity) {
    const st = this._hass && this._hass.states[entity];
    if (!st) return null;
    const a = st.attributes || {};
    const modes = a.supported_color_modes || [];
    const on = st.state === "on";
    const bright = a.brightness != null ? Number(a.brightness) : (on ? 255 : 0);
    const pct = Math.round((bright / 255) * 100);
    let rgb = Array.isArray(a.rgb_color) ? a.rgb_color : null;
    const kelvin = a.color_temp_kelvin || null;
    if (!rgb && kelvin) rgb = kelvinRgb(kelvin);
    if (!rgb && on) rgb = [255, 214, 170];
    if (!rgb) rgb = [168, 162, 158];
    return {
      st, on, bright, pct, rgb, kelvin, modes,
      glow: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
      minK: a.min_color_temp_kelvin || 2000,
      maxK: a.max_color_temp_kelvin || 6500,
      dimmable: modes.includes("brightness") || modes.includes("color_temp") || modes.includes("hs") || modes.includes("xy") || a.brightness != null,
      color: modes.includes("hs") || modes.includes("xy") || modes.includes("rgb") || modes.includes("rgbw"),
      temp: modes.includes("color_temp"),
    };
  }


  async _roomPower(roomId, on) {
    const room = this._sectionById(roomId);
    if (!room || !this._hass) return;
    const ids = this._sectionLightIds(room).filter((id) => this._hass.states[id] && this._hass.states[id].state !== "unavailable");
    if (!ids.length) return;
    await this._hass.callService("light", on ? "turn_on" : "turn_off", { entity_id: ids });
  }

  async _roomMood(roomId, mood) {
    const room = this._sectionById(roomId);
    if (!room || !this._hass) return;
    const ids = this._sectionLightIds(room).filter((id) => {
      const st = this._hass.states[id];
      return st && st.state !== "unavailable";
    });
    if (!ids.length) return;
    if (mood === "off") {
      await this._hass.callService("light", "turn_off", { entity_id: ids });
      return;
    }
    const presets = {
      bright: { brightness: 255, color_temp_kelvin: 4200 },
      relax: { brightness: 140, color_temp_kelvin: 2700 },
      night: { brightness: 45, color_temp_kelvin: 2200 },
    };
    const data = presets[mood] || presets.relax;
    for (const id of ids) {
      const look = this._lightLook(id);
      const payload = { entity_id: id, brightness: data.brightness };
      if (look && look.temp) payload.color_temp_kelvin = data.color_temp_kelvin;
      await this._hass.callService("light", "turn_on", payload);
    }
  }

  _sceneKey(scene) {
    const name = String((scene && scene.name) || scene.entity || "").toLowerCase();
    if (name.includes("cook")) return "cooking";
    if (name.includes("din")) return "dining";
    if (name.includes("even")) return "evening";
    if (name.includes("off") || name.includes("light")) return "off";
    return "off";
  }


  _openUrl(url) {
    const f = this._fully();
    if (f && typeof f.startIntent === "function") {
      try {
        f.startIntent(url);
        return;
      } catch (e) { /* fall through */ }
    }
    window.open(url, "_blank", "noopener");
  }

  _openWalmart({ app = false, query = "" } = {}) {
    const q = (query || "").trim();
    const url = q
      ? `https://www.walmart.com/search?q=${encodeURIComponent(q)}`
      : (this._cfg.walmart || "https://www.walmart.com/shop");
    const pkg = this._cfg.walmart_app || "com.walmart.android";
    const f = this._fully();
    if (app && f && typeof f.startApplication === "function") {
      try {
        f.startApplication(pkg);
        return;
      } catch (e) { /* fall through */ }
    }
    this._openUrl(url);
  }

  _stapleKey(summary) {
    return normName(String(summary || "").replace(/^\s*\d{1,2}\s*x?\s+/i, ""));
  }

  // Walmart has no cart API, but its add-to-cart link takes item numbers.
  _walmartCart() {
    const id = this._cfg.shopping;
    const items = (this._todos[id] || []).filter((it) => it.status !== "completed" && walmartId(it.description));
    if (!items.length) return;
    const list = items.map((it) => `${walmartId(it.description)}|${groceryQty(it.summary)}`).join(",");
    this._wmSent = items.map((it) => this._todoId(it));
    this._openUrl(`https://affil.walmart.com/cart/addToCart?items=${list}`);
    this._showToast(`Sent ${items.length} ${items.length === 1 ? "item" : "items"} to your Walmart cart`, { label: "Check them off", act: "wm-sent" });
  }

  async _markSent() {
    const id = this._cfg.shopping;
    const uids = this._wmSent || [];
    this._wmSent = [];
    this._todos[id] = (this._todos[id] || []).map((it) => (uids.includes(this._todoId(it)) ? { ...it, status: "completed" } : it));
    this._render();
    for (const uid of uids) {
      await this._hass.callService("todo", "update_item", { entity_id: id, item: uid, status: "completed" }).catch(() => {});
    }
  }

  async _saveWalmartLink() {
    const s = this._sheet;
    if (!s || s.type !== "wm-link") return;
    const input = this._root.querySelector("[name=wm-url]");
    const text = input ? input.value : "";
    const id = parseWalmartLink(text);
    if (text.trim() && !id) {
      s.error = "That link has no product number in it. On the product page in Walmart, tap Share, then Copy link, and paste it here.";
      this._render();
      return;
    }
    const entity = this._cfg.shopping;
    const item = (this._todos[entity] || []).find((it) => this._todoId(it) === s.uid);
    this._sheet = null;
    this._render();
    if (!item) return;
    const staples = { ...(this._prefs.staples || {}) };
    if (id) staples[this._stapleKey(item.summary)] = id;
    else delete staples[this._stapleKey(item.summary)];
    this._prefs.staples = staples;
    this._savePrefs();
    try {
      await this._hass.callService("todo", "update_item", {
        entity_id: entity,
        item: this._todoId(item),
        description: withWalmartId(item.description, id),
      });
      this._showToast(id ? `${item.summary} is linked to Walmart` : `Removed the Walmart link`);
    } catch (e) {
      this._showToast("That link didn't save. Try again.", null, "bad");
    }
  }

  // Items added from a phone pick up products the wall already knows.
  _autoLink(items) {
    const staples = this._prefs.staples || {};
    this._linking = this._linking || new Set();
    items.forEach((it) => {
      if (it.status === "completed" || walmartId(it.description)) return;
      const wid = staples[this._stapleKey(it.summary)];
      const uid = this._todoId(it);
      if (!wid || this._linking.has(uid)) return;
      this._linking.add(uid);
      this._hass.callService("todo", "update_item", {
        entity_id: this._cfg.shopping,
        item: uid,
        description: withWalmartId(it.description, wid),
      }).catch(() => {});
    });
  }

  _eventRange() {
    let start;
    let end;
    if (this._calMode === "week") {
      start = new Date(this._weekStart);
      end = addDays(start, 7);
    } else {
      const g = monthGrid(this._cursor.getFullYear(), this._cursor.getMonth());
      start = g.start;
      end = addDays(g.start, g.weeks * 7);
    }
    // Today and tomorrow always load, whatever month is showing.
    const today = startOfDay(this._now);
    const a = addDays(today, -1);
    const b = addDays(today, 3);
    if (a < start) start = a;
    if (b > end) end = b;
    return [start, end];
  }

  async _loadEvents() {
    this._evAt = Date.now();
    if (!this._hass) return;
    const cals = this._cals();
    if (!cals.length) return;
    // Only the newest request may land, so fast taps on the arrows cannot lose a month.
    const req = ++this._evReq;
    const [start, end] = this._eventRange();
    const qs = `start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`;
    const batches = await Promise.all(cals.map(async (c) => {
      try {
        const rows = await this._hass.callApi("GET", `calendars/${c.entity}?${qs}`);
        return (rows || []).map((ev) => ({ ...ev, ...eventSpan(ev), _cal: c.entity, _color: c.color, _name: c.name }));
      } catch (e) {
        return [];
      }
    }));
    if (req !== this._evReq) return;
    this._events = batches.flat().filter((ev) => ev._first && !Number.isNaN(ev._s.getTime()));
    this._queueRender();
  }

  _dayList(key) {
    return this._events
      .filter((ev) => !this._hidden.has(ev._cal) && ev._first <= key && key <= ev._last)
      .sort(eventSort(key));
  }

  _calFeatures(entity) {
    const st = this._hass && this._hass.states[entity];
    return st ? Number(st.attributes.supported_features) || 0 : 0;
  }

  _openDay(key) {
    this._sheet = { type: "day", day: key };
    this._render();
  }

  _openAdd(key) {
    const cals = this._cals();
    const day = key || isoDay(this._now);
    const sameDay = day === isoDay(this._now);
    let h = sameDay ? this._now.getHours() + 1 : 9;
    if (h > 22) h = 22;
    this._sheet = {
      type: "add",
      day,
      cal: cals[0] && cals[0].entity,
      title: "",
      allDay: false,
      start: `${pad(h)}:00`,
      end: `${pad(Math.min(h + 1, 23))}:00`,
    };
    this._render();
  }

  _eventDateTime(day, hm) {
    const parts = String(hm || "09:00").split(":");
    const hh = pad(Math.max(0, Math.min(23, Number(parts[0]) || 0)));
    const mm = pad(Math.max(0, Math.min(59, Number(parts[1]) || 0)));
    return `${day}T${hh}:${mm}:00`;
  }

  _nextDay(day) {
    const n = new Date(day + "T12:00:00");
    n.setDate(n.getDate() + 1);
    return isoDay(n);
  }

  _eventEndAfter(day, startHm, endHm) {
    const start = this._eventDateTime(day, startHm);
    if (endHm) {
      const end = this._eventDateTime(day, endHm);
      // An end earlier than the start means the event runs past midnight.
      if (end < start) return this._eventDateTime(this._nextDay(day), endHm);
      if (end > start) return end;
    }
    // No end time, or the same time twice: give it an hour.
    const parts = String(startHm || "09:00").split(":");
    const h = (Number(parts[0]) || 0) + 1;
    const m = Number(parts[1]) || 0;
    if (h >= 24) return this._eventDateTime(this._nextDay(day), `${pad(h - 24)}:${pad(m)}`);
    return this._eventDateTime(day, `${pad(h)}:${pad(m)}`);
  }


  _readAddForm() {
    const s = this._sheet;
    const f = this._root && this._root.querySelector("form[data-form=add]");
    if (!s || !f) return;
    const val = (n) => { const el = f.querySelector(`[name=${n}]`); return el ? el.value : undefined; };
    if (val("title") !== undefined) s.title = val("title");
    if (val("day")) s.day = val("day");
    if (val("start") !== undefined) s.start = val("start") || "09:00";
    if (val("end") !== undefined) s.end = val("end");
  }

  async _saveEvent() {
    this._readAddForm();
    const s = this._sheet;
    if (!s || s.type !== "add" || s.busy || !this._hass) return;
    const title = (s.title || "").trim();
    if (!title) {
      s.error = "Give it a name first.";
      this._render();
      return;
    }
    if (!s.cal) {
      s.error = "Pick who it's for.";
      this._render();
      return;
    }
    const data = { entity_id: s.cal, summary: title };
    if (s.allDay) {
      data.start_date = s.day;
      data.end_date = isoDay(addDays(localDate(s.day), 1));
    } else {
      data.start_date_time = this._eventDateTime(s.day, s.start);
      data.end_date_time = this._eventEndAfter(s.day, s.start, s.end);
    }
    s.busy = true;
    s.error = "";
    this._render();
    try {
      await this._hass.callService("calendar", "create_event", data);
      const who = (this._cals().find((c) => c.entity === s.cal) || {}).name;
      this._sheet = null;
      this._render();
      this._showToast(`Added ${title}${who ? ` for ${who}` : ""}`);
      await this._loadEvents();
    } catch (e) {
      s.busy = false;
      s.error = "That didn't save. Check the connection and try again.";
      this._render();
    }
  }

  async _deleteEvent(cal, uid, rid) {
    const ev = this._events.find((e) => e._cal === cal && e.uid === uid && (e.recurrence_id || "") === (rid || ""));
    if (!ev || !this._hass) return;
    const msg = { type: "calendar/event/delete", entity_id: cal, uid };
    if (rid) msg.recurrence_id = rid;
    try {
      await this._hass.connection.sendMessagePromise(msg);
      this._events = this._events.filter((e) => e !== ev);
      if (this._sheet) this._sheet.confirm = "";
      this._render();
      this._showToast(`Removed ${ev.summary || "the event"}`);
      this._loadEvents();
    } catch (e) {
      this._showToast("That event couldn't be removed.", null, "bad");
    }
  }

  _todoIds() {
    return [this._cfg.shopping, ...this._chores().map((c) => c.entity)].filter(Boolean);
  }

  // Chores and groceries arrive the moment anyone changes them, phone included.
  _subscribeTodos() {
    const conn = this._hass && this._hass.connection;
    if (!conn || typeof conn.subscribeMessage !== "function") {
      this._pollTodos = true;
      this._loadTodos();
      return;
    }
    this._todoIds().forEach((id) => {
      if (this._todoUnsubs[id]) return;
      const p = conn.subscribeMessage((msg) => this._onTodoItems(id, (msg && msg.items) || []), {
        type: "todo/item/subscribe",
        entity_id: id,
      });
      this._todoUnsubs[id] = p;
      Promise.resolve(p).catch(() => {
        delete this._todoUnsubs[id];
        this._pollTodos = true;
        this._loadTodoList(id);
      });
    });
  }

  async _loadTodoList(id) {
    try {
      const res = await this._hass.connection.sendMessagePromise({ type: "todo/item/list", entity_id: id });
      this._onTodoItems(id, res.items || []);
    } catch (e) {
      if (!this._todos[id]) this._todos[id] = [];
    }
  }

  async _loadTodos() {
    this._todoAt = Date.now();
    if (!this._hass) return;
    await Promise.all(this._todoIds().map((id) => this._loadTodoList(id)));
  }

  _onTodoItems(id, items) {
    this._noteDoneElsewhere(id, this._todos[id], items);
    this._todos[id] = items;
    if (id === this._cfg.shopping) this._autoLink(items);
    this._queueRender();
  }

  // Checked off on a phone? Show the tick here too.
  _noteDoneElsewhere(id, prev, next) {
    const chore = this._chores().find((c) => c.entity === id);
    if (!chore || !Array.isArray(prev)) return;
    const today = isoDay(this._now);
    const byId = new Map(next.map((it) => [this._todoId(it), it]));
    let changed = false;
    prev.forEach((old) => {
      if (!choreIsDue(old, today)) return;
      const uid = this._todoId(old);
      const cur = byId.get(uid);
      const key = `t:${id}:${uid}`;
      if (!cur || choreIsDue(cur, today) || this._done[key]) return;
      this._done[key] = { who: chore.name, name: old.summary, kind: "todo", entity: id, uid, prevDue: itemDueDay(old), recurring: !!parseWW(old.description) };
      changed = true;
    });
    if (changed) this._saveDone();
  }

  _todoId(item) {
    return item.uid || item.summary;
  }


  async _addTodo(entity, text) {
    const item = (text || "").trim();
    if (!item || !entity || !this._hass) return false;
    const data = { entity_id: entity, item };
    if (entity === this._cfg.shopping) {
      const wid = (this._prefs.staples || {})[this._stapleKey(item)];
      if (wid) data.description = `WM:${wid}`;
    }
    try {
      await this._hass.callService("todo", "add_item", data);
      if (this._pollTodos) this._loadTodoList(entity);
      return true;
    } catch (e) {
      this._showToast("That didn't get added. Try again.", null, "bad");
      return false;
    }
  }

  async _completeChore(entity, item) {
    if (!this._hass || !item) return;
    const who = (this._chores().find((c) => c.entity === entity) || {}).name || "";
    const meta = parseWW(item.description);
    const today = isoDay(this._now);
    const uid = this._todoId(item);
    const key = `t:${entity}:${uid}`;
    const prevDue = itemDueDay(item);
    this._done[key] = { who, name: item.summary, kind: "todo", entity, uid, prevDue, recurring: !!meta };
    this._saveDone();
    const data = { entity_id: entity, item: uid };
    const list = this._todos[entity] || [];
    if (meta) {
      // Repeating chores move to their next day instead of closing.
      const next = nextDueDate(meta, prevDue || today, today);
      this._todos[entity] = list.map((it) => (this._todoId(it) === uid ? { ...it, due: next } : it));
      Object.assign(data, { status: "needs_action", due_date: next });
    } else {
      this._todos[entity] = list.map((it) => (this._todoId(it) === uid ? { ...it, status: "completed" } : it));
      data.status = "completed";
    }
    this._refreshChores();
    this._showToast(`Checked off: ${item.summary}`, { label: "Undo", act: "undo-done", key });
    try {
      await this._hass.callService("todo", "update_item", data);
    } catch (e) {
      delete this._done[key];
      this._saveDone();
      this._showToast("That didn't save. Try again.", null, "bad");
      this._loadTodoList(entity);
    }
  }

  async _toggleHelper(helper, mode) {
    if (!helper || !this._hass) return;
    const c = this._houseChores().find((h) => h.helper === helper) || { helper, name: "Chore", who: "House", mode };
    const turnOn = (mode || c.mode || "done") !== "due";
    const key = `h:${helper}`;
    this._done[key] = { who: c.who || "House", name: c.name, kind: "helper", helper, mode: mode || c.mode || "done" };
    this._saveDone();
    this._helperOverride[helper] = { state: turnOn ? "on" : "off", at: Date.now() };
    // Our own tap is not the sensor finishing the job.
    this._helperDuePrev[helper] = false;
    this._refreshChores();
    this._showToast(`Checked off: ${c.name}`, { label: "Undo", act: "undo-done", key });
    try {
      await this._hass.callService("input_boolean", turnOn ? "turn_on" : "turn_off", { entity_id: helper });
    } catch (e) {
      delete this._helperOverride[helper];
      delete this._done[key];
      this._saveDone();
      this._refreshChores();
      this._showToast("That didn't save. Try again.", null, "bad");
    }
  }

  async _undoDone(key) {
    const d = this._done[key];
    if (!d || !this._hass) return;
    delete this._done[key];
    this._saveDone();
    this._toast = null;
    this._renderToast();
    if (d.kind === "helper") {
      const back = (d.mode || "done") === "due" ? "on" : "off";
      this._helperOverride[d.helper] = { state: back, at: Date.now() };
      this._helperDuePrev[d.helper] = true;
      this._refreshChores();
      await this._hass.callService("input_boolean", back === "on" ? "turn_on" : "turn_off", { entity_id: d.helper }).catch(() => {});
      return;
    }
    const data = { entity_id: d.entity, item: d.uid, status: "needs_action" };
    if (d.recurring) data.due_date = d.prevDue || isoDay(this._now);
    this._todos[d.entity] = (this._todos[d.entity] || []).map((it) => (
      this._todoId(it) === d.uid ? { ...it, status: "needs_action", ...(d.recurring ? { due: data.due_date } : {}) } : it
    ));
    this._refreshChores();
    await this._hass.callService("todo", "update_item", data).catch(() => this._loadTodoList(d.entity));
  }

  async _toggleShop(entity, item) {
    const uid = this._todoId(item);
    const next = item.status === "completed" ? "needs_action" : "completed";
    this._todos[entity] = (this._todos[entity] || []).map((it) => (this._todoId(it) === uid ? { ...it, status: next } : it));
    this._render();
    await this._hass.callService("todo", "update_item", { entity_id: entity, item: uid, status: next })
      .catch(() => this._loadTodoList(entity));
  }

  _readChoreForm() {
    const s = this._sheet;
    if (!s || s.type !== "chore") return;
    const titleEl = this.shadowRoot.querySelector("[name=chore-title]");
    const nEl = this.shadowRoot.querySelector("[name=chore-n]");
    if (titleEl) s.title = titleEl.value;
    if (nEl) s.n = Math.max(2, Number(nEl.value) || 2);
  }

  _choreMetaFromSheet(s) {
    if (s.freq === "once") return null;
    if (s.freq === "every2") return { freq: "every", n: 2 };
    if (s.freq === "every") return { freq: "every", n: Math.max(2, Number(s.n) || 3) };
    const days = Array.isArray(s.days) && s.days.length ? s.days.map(Number) : [this._now.getDay()];
    return { freq: "weekly", days };
  }

  async _saveChore() {
    this._readChoreForm();
    const s = this._sheet;
    if (!s || !s.title || !s.entity || !this._hass) return;
    const title = s.title.trim();
    if (!title) return;
    const meta = this._choreMetaFromSheet(s);
    const description = meta ? encodeWW(meta) : "";
    const due = meta ? firstDueDate(meta, this._now) : isoDay(this._now);
    if (s.uid) {
      const list = this._todos[s.entity] || [];
      const current = list.find((i) => i.uid === s.uid || i.summary === s.uid);
      const sameList = !s.fromEntity || s.fromEntity === s.entity;
      if (current && sameList) {
        const data = {
          entity_id: s.entity,
          item: this._todoId(current),
          rename: title,
          status: "needs_action",
          description,
          due_date: due,
        };
        await this._hass.callService("todo", "update_item", data);
      } else {
        if (s.fromEntity) {
          await this._hass.callService("todo", "remove_item", {
            entity_id: s.fromEntity,
            item: s.uid,
          });
        }
        await this._hass.callService("todo", "add_item", {
          entity_id: s.entity,
          item: title,
          description,
          due_date: due,
        });
      }
    } else {
      const data = { entity_id: s.entity, item: title, due_date: due };
      if (description) data.description = description;
      try {
        await this._hass.callService("todo", "add_item", data);
      } catch (e) {
        await this._hass.callService("todo", "add_item", { entity_id: s.entity, item: title });
      }
    }
    this._sheet = { type: "settings" };
    await this._loadTodos();
  }

  async _deleteChore(entity, uid) {
    if (!entity || !uid || !this._hass) return;
    await this._hass.callService("todo", "remove_item", { entity_id: entity, item: uid });
    this._sheet = { type: "settings" };
    await this._loadTodos();
  }

  async _setMeal(entity, value) {
    await this._hass.callService("input_text", "set_value", { entity_id: entity, value });
  }


  _mealValue(k) {
    const ent = (this._cfg.meals || {})[k];
    const st = ent && this._hass && this._hass.states[ent];
    const v = st ? st.state : "";
    return v && v !== "unknown" && v !== "unavailable" ? v : "";
  }

  _subscribeForecast() {
    const id = this._cfg.weather;
    const conn = this._hass && this._hass.connection;
    if (!id || !conn || this._fcUnsub || typeof conn.subscribeMessage !== "function") return;
    this._fcUnsub = conn.subscribeMessage((msg) => {
      this._forecast = (msg && msg.forecast) || [];
      this._queueRender();
    }, { type: "weather/subscribe_forecast", entity_id: id, forecast_type: "daily" });
    Promise.resolve(this._fcUnsub).catch(() => { this._fcUnsub = null; });
  }

  _aiEntity() {
    if (this._cfg.ai_task) return this._cfg.ai_task;
    const st = this._hass && this._hass.states;
    return st ? Object.keys(st).find((e) => e.startsWith("ai_task.")) || "" : "";
  }

  // Home Assistant's AI Task plans the week from the calendar: quick meals on busy nights.
  async _planMeals() {
    const ai = this._aiEntity();
    if (!ai) {
      this._sheet = { type: "ai-setup" };
      this._render();
      return;
    }
    this._sheet = { type: "ai-plan", busy: true };
    this._render();
    const todayIdx = (this._now.getDay() + 6) % 7;
    const monday = addDays(startOfDay(this._now), -todayIdx);
    const lines = MEAL_KEYS.map((k, i) => {
      const key = isoDay(addDays(monday, i));
      const busy = this._dayList(key)
        .filter((ev) => !ev._allDay && ev._s.getHours() >= 15)
        .map((ev) => `${ev.summary} at ${hm(ev._s)} (${ev._name})`);
      const cur = this._mealValue(k);
      return `${WEEKDAYS_LONG[(i + 1) % 7]}: ${cur ? `already planned as "${cur}"` : "open"}${busy.length ? `; evening plans: ${busy.join(", ")}` : ""}`;
    });
    const favs = (this._prefs.favorites.length ? this._prefs.favorites : DEFAULT_FAVORITES).join(", ");
    const notes = this._prefs.meal_notes || this._cfg.meal_notes || "";
    const structure = {};
    MEAL_KEYS.forEach((k, i) => {
      structure[k] = { description: `Dinner for ${WEEKDAYS_LONG[(i + 1) % 7]}`, required: true, selector: { text: {} } };
    });
    structure.groceries = {
      description: "Groceries to buy for the open nights, short shopping-list names",
      required: true,
      selector: { text: { multiple: true } },
    };
    const instructions = [
      "Plan family dinners for this week for a family of four, two adults and two kids.",
      "Keep any night that is already planned exactly as written.",
      "On nights with evening plans, choose something ready in 30 minutes or leftovers.",
      `Work in some family favorites: ${favs}.`,
      notes ? `Family notes: ${notes}` : "",
      "Use short friendly dinner names under 40 characters.",
      "For groceries list only what to buy for the open nights, one short item each.",
      "",
      ...lines,
    ].filter((l) => l !== null).join("\n");
    try {
      const res = await this._hass.connection.sendMessagePromise({
        type: "call_service",
        domain: "ai_task",
        service: "generate_data",
        service_data: { entity_id: ai, task_name: "WrightWay dinner plan", instructions, structure },
        return_response: true,
      });
      const data = (res && res.response && res.response.data) || {};
      // Someone may have closed the sheet while the helper was thinking.
      if (!this._sheet || this._sheet.type !== "ai-plan") return;
      this._sheet = { type: "ai-plan", plan: data, open: MEAL_KEYS.filter((k) => !this._mealValue(k)) };
    } catch (e) {
      if (!this._sheet || this._sheet.type !== "ai-plan") return;
      this._sheet = { type: "ai-plan", error: "The meal helper didn't answer. Try again in a minute." };
    }
    this._render();
  }

  async _applyPlan() {
    const s = this._sheet;
    if (!s || !s.plan) return;
    const meals = this._cfg.meals || {};
    const plan = s.plan;
    const open = s.open || [];
    this._sheet = null;
    this._render();
    for (const k of open) {
      const v = String(plan[k] || "").trim().slice(0, 80);
      if (v && meals[k]) await this._setMeal(meals[k], v).catch(() => {});
    }
    const have = new Set((this._todos[this._cfg.shopping] || []).filter((it) => it.status !== "completed").map((it) => this._stapleKey(it.summary)));
    const groc = (Array.isArray(plan.groceries) ? plan.groceries : String(plan.groceries || "").split(/\n|,/))
      .map((g) => String(g).replace(/^[-•*\s]+/, "").trim()).filter(Boolean);
    let added = 0;
    for (const g of groc) {
      if (have.has(this._stapleKey(g))) continue;
      have.add(this._stapleKey(g));
      if (await this._addTodo(this._cfg.shopping, g)) added += 1;
    }
    this._showToast(`Dinners planned${added ? ` and ${added} groceries added` : ""}`);
  }

  _showToast(msg, action, tone) {
    this._toastN = (this._toastN || 0) + 1;
    this._toast = { msg, action: action || null, tone: tone || "", id: this._toastN };
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => {
      this._toast = null;
      this._renderToast();
    }, action ? 7000 : 4000);
    this._renderToast();
  }

  _renderToast() {
    const layer = this._toastLayer;
    if (!layer) return;
    const t = this._toast;
    if (!t) {
      layer.innerHTML = "";
      layer.dataset.id = "";
      return;
    }
    if (layer.dataset.id === String(t.id)) return;
    layer.dataset.id = String(t.id);
    layer.innerHTML = `<div class="toast ${esc(t.tone)}"><span>${esc(t.msg)}</span>${t.action
      ? `<button type="button" data-act="${esc(t.action.act)}" data-key="${esc(t.action.key || "")}">${esc(t.action.label)}</button>`
      : ""}</div>`;
  }

  _queueRender() {
    if (this._rq) return;
    this._rq = true;
    const run = () => {
      this._rq = false;
      this._render();
    };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
    else setTimeout(run, 16);
  }


  _tickHome() {
    if (this._view !== "home" || this._slideLock) return;
    const sig = this._homeSig();
    if (sig === this._homeSnap) return;
    this._homeSnap = sig;
    if (this._sheet && this._sheet.type === "light") {
      this._render();
      return;
    }
    const home = this._root && this._root.querySelector(".home");
    if (!home) {
      this._render();
      return;
    }
    const pane = home.querySelector(".area-body");
    const scroll = pane ? pane.scrollTop : 0;
    const wrap = document.createElement("div");
    wrap.innerHTML = this._renderHome();
    const next = wrap.firstElementChild;
    if (!next) return;
    home.replaceWith(next);
    const fresh = next.querySelector(".area-body");
    if (fresh) fresh.scrollTop = scroll;
  }

  _render() {
    if (!this.shadowRoot) return;
    this._ensureFrame();
    this._applyScale();
    const root = this._root;
    const keep = this._captureUi(root);
    this._frame.classList.toggle("night", this._theme() === "night");
    this._picCache = null;
    const s = this._sheet;
    const sheetKey = s ? `${s.type}:${s.day || s.uid || s.entity || ""}` : "";
    const entering = !!sheetKey && sheetKey !== this._sheetKey;
    this._sheetKey = sheetKey;
    root.innerHTML = this._toneStyles() + this._renderApp(entering);
    this._restoreUi(root, keep);
    if (entering) {
      const af = root.querySelector("[data-autofocus]");
      if (af) af.focus({ preventScroll: true });
    }
    this._fitMonth();
    this._placeCamera();
    this._renderToast();
    this._helperSnap = this._helperSig();
    this._homeSnap = this._homeSig();
    this._lockFrame();
  }

  // A background refresh must never eat what someone is in the middle of typing.
  _captureUi(root) {
    const out = { vals: {}, focus: "", sel: null, scroll: {} };
    if (!root) return out;
    const active = this.shadowRoot.activeElement;
    root.querySelectorAll("[data-k]").forEach((el) => {
      if (el === active || el.closest(".overlay")) out.vals[el.dataset.k] = el.value;
    });
    if (active && active.dataset && active.dataset.k) {
      out.focus = active.dataset.k;
      try { out.sel = [active.selectionStart, active.selectionEnd]; } catch (e) { out.sel = null; }
    }
    root.querySelectorAll("[data-sk]").forEach((el) => { out.scroll[el.dataset.sk] = el.scrollTop; });
    return out;
  }

  _restoreUi(root, k) {
    root.querySelectorAll("[data-k]").forEach((el) => {
      if (k.vals[el.dataset.k] !== undefined) el.value = k.vals[el.dataset.k];
    });
    root.querySelectorAll("[data-sk]").forEach((el) => {
      if (k.scroll[el.dataset.sk]) el.scrollTop = k.scroll[el.dataset.sk];
    });
    if (k.focus) {
      const el = root.querySelector(`[data-k="${k.focus}"]`);
      if (el) {
        el.focus({ preventScroll: true });
        if (k.sel && k.sel[0] != null) {
          try { el.setSelectionRange(k.sel[0], k.sel[1]); } catch (e) { /* date and time inputs */ }
        }
      }
    }
  }

  _pp(name) {
    return `pp-${normName(name) || "x"}`;
  }

  // Colour variables per person and per home area, for day and evening.
  _toneStyles() {
    const rules = [];
    const seen = new Set();
    const add = (cls, color) => {
      if (seen.has(cls)) return;
      seen.add(cls);
      const t = tones(color);
      rules.push(`.${cls}{--pt:${t.day.t};--pf:${t.day.f};--pa:${t.day.a};--pm:${t.day.m};--pi:${t.day.i}}`);
      rules.push(`.night .${cls}{--pt:${t.night.t};--pf:${t.night.f};--pa:${t.night.a};--pm:${t.night.m};--pi:${t.night.i}}`);
    };
    this._cals().forEach((c) => add(this._pp(c.name), c.color));
    this._chorePeople().forEach((p) => add(this._pp(p.name), p.color));
    HOME_AREAS.forEach((a) => add(`ar-${a.id}`, a.accent));
    return `<style>${rules.join("")}</style>`;
  }

  _personPic(name) {
    if (!this._hass) return "";
    if (!this._picCache) {
      const cache = {};
      Object.keys(this._hass.states).forEach((id) => {
        if (!id.startsWith("person.")) return;
        const st = this._hass.states[id];
        const p = st.attributes && st.attributes.entity_picture;
        if (p) cache[normName(st.attributes.friendly_name)] = this._hass.hassUrl(p);
      });
      Object.entries(this._cfg.people || {}).forEach(([n, id]) => {
        const st = this._hass.states[id];
        const p = st && st.attributes && st.attributes.entity_picture;
        if (p) cache[normName(n)] = this._hass.hassUrl(p);
      });
      this._picCache = cache;
    }
    return this._picCache[normName(name)] || "";
  }

  _avatar(name) {
    const pic = this._personPic(name);
    const letter = esc(String(name || "?").trim().charAt(0).toUpperCase() || "?");
    return `<span class="av ${this._pp(name)}">${pic ? `<img src="${esc(pic)}" alt="">` : letter}</span>`;
  }

  _renderApp(entering) {
    if (this._phone()) return this._renderPhone(entering);
    const v = this._view;
    const body = v === "home" ? this._renderHome()
      : v === "lists" ? this._renderShop()
        : v === "meals" ? this._renderMeals()
          : this._renderCalendar();
    return `<div class="app">
        ${this._renderRail()}
        <div class="main">
          ${this._renderHeader()}
          <div class="body">${body}</div>
        </div>
      </div>
      ${this._renderSheet(entering)}`;
  }

  _renderPhone(entering) {
    const v = this._view;
    const body = v === "calendar" ? this._phoneCalendar()
      : v === "lists" ? this._phoneLists()
        : v === "meals" ? this._renderMeals()
          : v === "home" ? this._renderHome()
            : v === "photos" ? this._phonePhotos()
              : this._phoneToday();
    const n = this._now;
    const titles = { calendar: "Calendar", lists: "Lists", meals: "Meals", home: "Home", photos: "Photos" };
    const wx = this._weather();
    const temp = wx && wx.attributes && wx.attributes.temperature != null ? `${Math.round(wx.attributes.temperature)}°` : "";
    const tab = (id, icon, label) => `<button type="button" class="p-tab ${v === id ? "on" : ""}" data-act="view" data-view="${id}">${ICONS[icon]}<span>${label}</span></button>`;
    return `<div class="app p-app">
        <header class="p-top">
          <div class="p-title">
            <span class="eyebrow">${WEEKDAYS_LONG[n.getDay()]}, ${MONTHS[n.getMonth()]} ${n.getDate()}${temp ? `<span class="p-wx">${wxIcon(wx.state)}${esc(temp)}</span>` : ""}</span>
            <h1 ${v === "today" ? 'id="greet"' : ""}>${esc(titles[v] || this._greeting())}</h1>
          </div>
          <button type="button" class="icon-btn sm ${v === "photos" ? "on" : ""}" data-act="view" data-view="photos" aria-label="Photos">${ICONS.photos}</button>
          <button type="button" class="icon-btn sm" data-act="settings" aria-label="Settings">${ICONS.gear}</button>
        </header>
        <main class="p-body" data-sk="p-${esc(v)}">${body}</main>
        <nav class="p-tabs">${tab("today", "sun", "Today")}${tab("calendar", "calendar", "Calendar")}${tab("lists", "listcheck", "Lists")}${tab("meals", "meals", "Meals")}${tab("home", "home", "Home")}</nav>
      </div>
      ${this._renderSheet(entering)}`;
  }

  _phoneToday() {
    return `<div class="p-stack">
      <div class="panel agenda"><div class="agenda-scroll" data-sk="agenda">${this._renderAgendaBody()}</div></div>
      ${this._renderDinner()}
      ${this._renderChores()}
      ${this._renderScenes()}
      ${this._phoneCams()}
    </div>`;
  }

  // Camera stills; a tap opens the live view full screen.
  _phoneCams() {
    const cams = this._cameraList();
    if (!cams.length || !this._hass) return "";
    return `<div class="panel p-cams-card"><h3 class="eyebrow">Cameras</h3><div class="p-cams">${cams.map((c) => {
      const st = this._hass.states[c.entity];
      const pic = st && st.attributes && st.attributes.entity_picture ? this._hass.hassUrl(st.attributes.entity_picture) : "";
      return `<button type="button" class="p-cam" data-act="cam-open" data-entity="${esc(c.entity)}">${pic ? `<img src="${esc(pic)}" alt="" loading="lazy">` : ""}<span>${esc(c.name)}</span></button>`;
    }).join("")}</div></div>`;
  }

  _phoneCalendar() {
    const y = this._cursor.getFullYear();
    const m = this._cursor.getMonth();
    const { start, weeks } = monthGrid(y, m);
    const todayKey = isoDay(this._now);
    const sel = this._pDay || todayKey;
    let cells = "";
    for (let i = 0; i < weeks * 7; i += 1) {
      const d = addDays(start, i);
      const key = isoDay(d);
      const who = [...new Set(this._dayList(key).map((ev) => ev._name))].slice(0, 3);
      cells += `<button type="button" class="pc-day ${d.getMonth() !== m ? "other" : ""} ${key === todayKey ? "today" : ""} ${key === sel ? "sel" : ""}" data-act="p-day" data-date="${key}">
        <span class="n">${d.getDate()}</span><span class="dots">${who.map((w) => `<i class="${this._pp(w)}"></i>`).join("")}</span>
      </button>`;
    }
    const sd = localDate(sel);
    const evs = this._dayList(sel);
    const label = sel === todayKey ? "Today" : sel === isoDay(addDays(this._now, 1)) ? "Tomorrow" : WEEKDAYS_LONG[sd.getDay()];
    const rows = evs.map((ev) => `<div class="ag-row ${this._pp(ev._name)}" data-act="day" data-date="${sel}">
        <span class="tm">${esc(eventTimeLabel(ev, sel))}</span><span class="bar"></span>
        <span class="tt">${esc(ev.summary || "Event")}</span>${this._avatar(ev._name)}
      </div>`).join("");
    return `<div class="p-stack">
      <div class="panel p-month">
        <div class="p-mhead"><div class="cal-title">${MONTHS[m]} <span>${y}</span></div>
          <div class="navs"><button type="button" class="icon" data-act="prev" aria-label="Back">${ICONS.chevL}</button><button type="button" data-act="today">Today</button><button type="button" class="icon" data-act="next" aria-label="Forward">${ICONS.chevR}</button></div>
        </div>
        <div class="p-dow">${DAY_LETTERS.map((l) => `<span>${l}</span>`).join("")}</div>
        <div class="p-grid">${cells}</div>
      </div>
      <div class="people p-people">${this._cals().map((c) => `<button type="button" class="pchip ${this._pp(c.name)} ${this._hidden.has(c.entity) ? "off" : ""}" data-act="filter" data-entity="${esc(c.entity)}">${this._avatar(c.name)}${esc(c.name)}</button>`).join("")}</div>
      <div class="panel p-daylist">
        <div class="ag-h"><h3 class="eyebrow">${label}<em>${MONTHS[sd.getMonth()].slice(0, 3)} ${sd.getDate()}</em></h3>
          <button type="button" class="ag-add" data-act="add-on" data-date="${sel}">${ICONS.plus}Add</button></div>
        ${rows || `<div class="ag-empty">Nothing planned</div>`}
      </div>
    </div>`;
  }

  _phoneLists() {
    const tab = this._listTab || "chores";
    return `<div class="p-stack">
      <div class="seg p-seg">
        <button type="button" class="${tab === "chores" ? "on" : ""}" data-act="list-tab" data-tab="chores">Chores</button>
        <button type="button" class="${tab === "shop" ? "on" : ""}" data-act="list-tab" data-tab="shop">Groceries</button>
      </div>
      ${tab === "shop" ? this._renderShop() : `${this._renderChores()}<button type="button" class="add-chore" data-act="settings-tab" data-tab="chores">+ Add or change chores</button>`}
    </div>`;
  }

  async _loadPhonePhotos() {
    try {
      const r = await fetch(`${this._cfg.photos_api}/photos`, { cache: "no-store" });
      this._pPhotos = r.ok ? (await r.json()).photos || [] : [];
    } catch (e) {
      this._pPhotos = [];
    }
    this._render();
  }

  _phonePhotos() {
    if (!this._cfg.photos_api) return `<div class="panel p-hero"><h2>Photos</h2><p>Photos are managed from the WrightWay app.</p></div>`;
    const photos = this._pPhotos;
    if (!photos) return `<div class="panel p-hero"><h2>Loading photos…</h2></div>`;
    const shown = photos.filter((ph) => !ph.hidden).length;
    let who = "";
    try { who = localStorage.getItem("ww-who") || ""; } catch (e) { who = ""; }
    return `<div class="p-stack">
      <div class="panel p-hero">
        <span class="eyebrow">On the kitchen wall</span>
        <h2>${shown} ${shown === 1 ? "photo" : "photos"}</h2>
        <p>They fade in one after another whenever the wall sits idle.</p>
        <label class="btn primary wide">${ICONS.plus}Add photos<input type="file" accept="image/*" multiple hidden data-photo-input="1"></label>
      </div>
      <div class="chips p-who"><span class="eyebrow">Adding as</span>${this._cals().filter((c) => c.name !== "Family").map((c) => `<button type="button" class="chip-btn ${who === c.name ? "on" : ""}" data-act="p-who" data-name="${esc(c.name)}">${esc(c.name)}</button>`).join("")}</div>
      ${photos.length ? `<div class="ph-grid">${photos.map((ph) => `<button type="button" class="ph-cell ${ph.hidden ? "off" : ""}" data-act="p-photo" data-id="${ph.id}"><img src="${esc(ph.thumb)}" alt="" loading="lazy">${ph.hidden ? `<span class="ph-badge">Hidden</span>` : ""}</button>`).join("")}</div>`
        : `<div class="panel p-hero"><p>No photos yet. Add a few and they'll show on the kitchen wall.</p></div>`}
      <p class="note" style="text-align:center">Photos are sized for the wall and saved without location data.</p>
    </div>`;
  }

  _sheetPhoto(s) {
    const ph = (this._pPhotos || []).find((x) => x.id === s.id);
    if (!ph) return "";
    const day = (iso, year) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", ...(year ? { year: "numeric" } : {}) });
    const bits = [`${ph.added_by ? `Added by ${esc(ph.added_by)}` : "Added"} ${day(ph.added_at)}`];
    if (ph.taken_at) bits.push(`taken ${day(ph.taken_at, true)}`);
    return `<div class="dlg">
      <img class="ph-big" src="${esc(ph.full)}" alt="">
      <div class="sub">${bits.join(" · ")}${ph.hidden ? " · hidden from the wall" : ""}</div>
      <div class="actions">
        <button type="button" class="btn ${s.confirm ? "danger" : "ghost"} left" data-act="p-photo-del" data-id="${ph.id}">${s.confirm ? "Tap again to remove" : "Remove"}</button>
        <button type="button" class="btn ${ph.hidden ? "primary" : ""}" data-act="p-photo-hide" data-id="${ph.id}" data-hidden="${ph.hidden ? "0" : "1"}">${ph.hidden ? "Show on the wall" : "Hide from the wall"}</button>
      </div>
    </div>`;
  }

  // One photo per request: progress for a big batch, and one bad file can't sink the rest.
  async _uploadPhotos(files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    let who = "";
    try { who = localStorage.getItem("ww-who") || ""; } catch (e) { who = ""; }
    let added = 0;
    let dupes = 0;
    let failed = 0;
    for (let i = 0; i < list.length; i += 1) {
      this._showToast(list.length > 1 ? `Adding ${i + 1} of ${list.length}…` : "Adding your photo…");
      const fd = new FormData();
      fd.append("files", list[i], list[i].name || "photo.jpg");
      if (who) fd.append("added_by", who);
      try {
        const r = await fetch(`${this._cfg.photos_api}/photos`, { method: "POST", body: fd });
        const res = ((await r.json()).results || [])[0] || {};
        if (res.status === "added") added += 1;
        else if (res.status === "duplicate") dupes += 1;
        else failed += 1;
      } catch (e) {
        failed += 1;
      }
    }
    const parts = [];
    if (added) parts.push(`${added} ${added === 1 ? "photo" : "photos"} added to the wall`);
    if (dupes) parts.push(`${dupes} already there`);
    if (failed) parts.push(`${failed} couldn't be read`);
    this._showToast(parts.join(" · ") || "Nothing was added", null, failed && !added ? "bad" : "");
    this._loadPhonePhotos();
  }

  _renderRail() {
    const b = (view, icon, label) => `<button type="button" class="rail-btn ${this._view === view ? "on" : ""}" data-act="view" data-view="${view}">${ICONS[icon]}${label}</button>`;
    return `<nav class="rail">
      <div class="brand">W</div>
      ${b("calendar", "calendar", "Calendar")}
      ${b("home", "home", "Home")}
      ${b("lists", "shop", "Shopping")}
      ${b("meals", "meals", "Meals")}
      <button type="button" class="rail-btn" data-act="photos-now">${ICONS.photos}Photos</button>
      <div class="gap-fill"></div>
      <button type="button" class="rail-btn" data-act="settings">${ICONS.gear}Settings</button>
    </nav>`;
  }

  _renderHeader() {
    const n = this._now;
    const c = clockParts(n);
    const night = this._theme() === "night";
    return `<header class="top">
      <div class="clock" id="clock">${c.time}<small>${c.ap}</small></div>
      <div class="date"><b>${WEEKDAYS_LONG[n.getDay()]}, ${MONTHS[n.getMonth()]} ${n.getDate()}</b><span id="greet">${esc(this._greeting())}</span></div>
      <div class="spacer"></div>
      ${this._renderWeather()}
      <button type="button" class="icon-btn" data-act="help" aria-label="How to use">${ICONS.help}</button>
      <button type="button" class="icon-btn" data-act="theme-cycle" aria-label="Day or evening">${night ? ICONS.moon : ICONS.sun}</button>
    </header>`;
  }

  _renderWeather() {
    const wx = this._weather();
    if (!wx) return "";
    const a = wx.attributes || {};
    const temp = a.temperature != null ? `${Math.round(a.temperature)}°` : "";
    const todayKey = isoDay(this._now);
    const fc = (this._forecast || [])
      .map((f) => ({ ...f, _d: new Date(f.datetime) }))
      .filter((f) => !Number.isNaN(f._d.getTime()));
    const today = fc.find((f) => isoDay(f._d) === todayKey);
    const later = fc.filter((f) => isoDay(f._d) > todayKey).slice(0, 4);
    const hilo = today && today.temperature != null
      ? ` · H ${Math.round(today.temperature)}°${today.templow != null ? ` L ${Math.round(today.templow)}°` : ""}`
      : "";
    const label = WX_LABEL[wx.state] || String(wx.state || "").replace(/-/g, " ");
    return `<div class="wx">
      <div class="wx-now">${wxIcon(wx.state)}<div><div class="t">${esc(temp)}</div><div class="d">${esc(label)}${esc(hilo)}</div></div></div>
      ${later.length ? `<div class="fc">${later.map((f) => `<div>${WEEKDAYS[f._d.getDay()]}${wxIcon(f.condition)}<b>${Math.round(f.temperature)}°</b>${f.templow != null ? `<i>${Math.round(f.templow)}°</i>` : ""}</div>`).join("")}</div>` : ""}
    </div>`;
  }

  _renderCalendar() {
    const tip = this._prefs.tips !== false
      ? `<div class="tip"><span>Tap any day to add something. Tap a name to show or hide that person. Tap a chore below to check it off.</span><button type="button" data-act="tips-off">Got it</button></div>`
      : "";
    return `<div class="cal-stage">
      <div class="cal-col">
        <div class="panel cal-card">
          ${this._renderCalBar()}
          ${tip}
          ${this._calMode === "week" ? this._renderWeek() : this._renderMonth()}
        </div>
        ${this._renderChores()}
      </div>
      ${this._renderSide()}
    </div>`;
  }

  _renderCalBar() {
    const week = this._calMode === "week";
    let title;
    if (week) {
      const s = this._weekStart;
      const e = addDays(s, 6);
      title = s.getMonth() === e.getMonth()
        ? `${MONTHS[s.getMonth()]} <span>${s.getDate()}–${e.getDate()}</span>`
        : `${MONTHS[s.getMonth()].slice(0, 3)} ${s.getDate()} <span>– ${MONTHS[e.getMonth()].slice(0, 3)} ${e.getDate()}</span>`;
    } else {
      title = `${MONTHS[this._cursor.getMonth()]} <span>${this._cursor.getFullYear()}</span>`;
    }
    const people = this._cals().map((c) => `<button type="button" class="pchip ${this._pp(c.name)} ${this._hidden.has(c.entity) ? "off" : ""}" data-act="filter" data-entity="${esc(c.entity)}">${this._avatar(c.name)}${esc(c.name)}</button>`).join("");
    return `<div class="cal-bar">
      <div class="cal-title">${title}</div>
      <div class="people">${people}</div>
      <div class="seg">
        <button type="button" class="${week ? "" : "on"}" data-act="cal-mode" data-mode="month">Month</button>
        <button type="button" class="${week ? "on" : ""}" data-act="cal-mode" data-mode="week">Week</button>
      </div>
      <div class="navs">
        <button type="button" class="icon" data-act="prev" aria-label="Back">${ICONS.chevL}</button>
        <button type="button" data-act="today">Today</button>
        <button type="button" class="icon" data-act="next" aria-label="Forward">${ICONS.chevR}</button>
      </div>
    </div>`;
  }

  _renderMonth() {
    const y = this._cursor.getFullYear();
    const m = this._cursor.getMonth();
    const { start, weeks } = monthGrid(y, m);
    const todayKey = isoDay(this._now);
    let cells = "";
    for (let i = 0; i < weeks * 7; i += 1) {
      const d = addDays(start, i);
      const key = isoDay(d);
      const evs = this._dayList(key);
      const cls = [
        d.getMonth() !== m ? "other" : "",
        d.getDay() === 0 || d.getDay() === 6 ? "wkend" : "",
        key === todayKey ? "today" : "",
      ].join(" ");
      cells += `<div class="day ${cls}" data-act="day" data-date="${key}">
        <span class="num">${d.getDate()}</span>
        <div class="evs" data-total="${evs.length}">${evs.slice(0, 8).map((ev) => this._evChip(ev, key)).join("")}<div class="more" hidden></div></div>
      </div>`;
    }
    return `<div class="month">
      <div class="dow">${WEEKDAYS.map((w) => `<div>${w}</div>`).join("")}</div>
      <div class="days" style="grid-template-rows:repeat(${weeks},minmax(0,1fr))">${cells}</div>
    </div>`;
  }

  _evChip(ev, key) {
    const t = ev._allDay ? "" : eventTimeLabel(ev, key);
    return `<div class="ev ${ev._allDay ? "allday" : ""} ${this._pp(ev._name)}">${t ? `<span class="tm">${esc(t)}</span>` : ""}<span class="tt">${esc(ev.summary || "Event")}</span></div>`;
  }

  // Show as many events as each day really has room for, measured, not guessed.
  _fitMonth() {
    if (!this._root) return;
    this._root.querySelectorAll(".days .evs").forEach((box) => {
      const chips = Array.from(box.querySelectorAll(".ev"));
      const more = box.querySelector(".more");
      const total = Number(box.dataset.total) || 0;
      chips.forEach((c) => c.classList.remove("cut"));
      if (more) more.hidden = true;
      const limit = box.clientHeight;
      if (!limit || !chips.length || !more) return;
      const last = chips[chips.length - 1];
      if (total <= chips.length && last.offsetTop + last.offsetHeight <= limit + 1) return;
      more.hidden = false;
      // Measure the label with text in it; an empty one is only its padding tall.
      more.textContent = `+${total} more`;
      const room = limit - more.offsetHeight - 3;
      let shown = 0;
      for (const c of chips) {
        if (c.offsetTop + c.offsetHeight <= room + 1) shown += 1;
        else break;
      }
      chips.forEach((c, i) => c.classList.toggle("cut", i >= shown));
      more.textContent = `+${total - shown} more`;
    });
  }

  _renderWeek() {
    const todayKey = isoDay(this._now);
    let cols = "";
    for (let i = 0; i < 7; i += 1) {
      const d = addDays(this._weekStart, i);
      const key = isoDay(d);
      const evs = this._dayList(key);
      cols += `<div class="wday ${key === todayKey ? "today" : ""}">
        <div class="wday-h" data-act="day" data-date="${key}"><span>${WEEKDAYS[d.getDay()]}</span><b>${d.getDate()}</b></div>
        <div class="wlist" data-scroll data-sk="w${i}">${evs.length ? evs.map((ev) => `
          <div class="wev ${ev._allDay ? "allday" : ""} ${this._pp(ev._name)}" data-act="day" data-date="${key}">
            <div class="tm">${esc(eventRangeLabel(ev, key))}</div>
            <div class="tt">${esc(ev.summary || "Event")}</div>
            <div class="who">${esc(ev._name || "")}</div>
          </div>`).join("") : `<div class="wnone">Free</div>`}</div>
        <button type="button" class="wadd" data-act="add-on" data-date="${key}" aria-label="Add">${ICONS.plus}</button>
      </div>`;
    }
    return `<div class="week">${cols}</div>`;
  }

  _renderSide() {
    return `<aside class="side">
      <div class="panel agenda"><div class="agenda-scroll" data-scroll data-sk="agenda">${this._renderAgendaBody()}</div></div>
      ${this._renderDinner()}
      ${this._renderCamCard()}
      ${this._renderScenes()}
    </aside>`;
  }

  _renderAgendaBody() {
    return `${this._agendaBlock(0)}<div class="ag-sep"></div>${this._agendaBlock(1)}`;
  }

  _agendaBlock(offset) {
    const d = addDays(this._now, offset);
    const key = isoDay(d);
    const evs = this._dayList(key);
    const now = this._now.getTime();
    const endOf = (ev) => (ev._e ? ev._e.getTime() : ev._s.getTime() + 60 * 60 * 1000);
    // Two or more finished events fold into one line so tomorrow stays in view.
    const earlier = offset === 0 ? evs.filter((ev) => !ev._allDay && ev._first === key && endOf(ev) <= now) : [];
    const fold = earlier.length >= 2;
    const list = fold ? evs.filter((ev) => !earlier.includes(ev)) : evs;
    const rows = (fold ? `<div class="ag-earlier">${ICONS.check}<span>Earlier: ${earlier.map((ev) => esc(ev.summary || "Event")).join(" · ")}</span></div>` : "") + list.map((ev) => {
      const timed = !ev._allDay;
      const endMs = endOf(ev);
      const past = offset === 0 && timed && endMs <= now;
      const live = offset === 0 && timed && ev._s.getTime() <= now && endMs > now;
      return `<div class="ag-row ${past ? "past" : ""} ${live ? "now" : ""} ${this._pp(ev._name)}" data-act="day" data-date="${key}">
        <span class="tm">${esc(live ? "Now" : eventTimeLabel(ev, key))}</span>
        <span class="bar"></span>
        <span class="tt">${esc(ev.summary || "Event")}</span>
        ${this._avatar(ev._name)}
      </div>`;
    }).join("");
    const label = offset === 0 ? "Today" : "Tomorrow";
    const empty = offset === 0 ? "Nothing on the calendar" : "Nothing planned yet";
    return `<div class="ag-h">
        <h3 class="eyebrow">${label}<em>${WEEKDAYS[d.getDay()]} ${d.getDate()}</em></h3>
        ${offset === 0 ? `<button type="button" class="ag-add" data-act="add-on" data-date="${key}">${ICONS.plus}Add</button>` : ""}
      </div>
      ${rows || `<div class="ag-empty">${empty}</div>`}`;
  }

  _renderDinner() {
    if (!this._cfg.meals) return "";
    const v = this._mealValue(MEAL_KEYS[(this._now.getDay() + 6) % 7]);
    return `<button type="button" class="panel dinner" data-act="view" data-view="meals">
      <span class="ic">${ICONS.meals}</span>
      <span><span class="eyebrow">Dinner tonight</span><span class="val ${v ? "" : "none"}">${esc(v || "Not planned yet · tap to plan")}</span></span>
    </button>`;
  }

  _renderCamCard() {
    const cams = this._cameraList();
    if (!cams.length) return "";
    const live = this._liveCam || this._homeCam;
    return `<div class="panel cam-card">
      <div class="cam-slot" id="cam-slot"></div>
      ${cams.length > 1 ? `<div class="cam-pills" data-scroll>${cams.map((c) => `<button type="button" class="${c.entity === live ? "on" : ""}" data-act="cam" data-entity="${esc(c.entity)}">${esc(c.name)}</button>`).join("")}</div>` : ""}
    </div>`;
  }

  _renderScenes() {
    const scenes = this._cfg.scenes || [];
    if (!scenes.length) return "";
    return `<div class="panel scenes-card">
      <h3 class="eyebrow">Kitchen lights</h3>
      <div class="scenes">${scenes.map((s) => {
        const key = this._sceneKey(s);
        const ico = key === "cooking" ? ICONS.cook : key === "dining" ? ICONS.dine : key === "evening" ? ICONS.moon : ICONS.power;
        return `<button type="button" class="scene ${key}" data-act="scene" data-entity="${esc(s.entity)}">${ico}<span>${esc(s.name || "Scene")}</span></button>`;
      }).join("")}</div>
    </div>`;
  }

  _renderChores() {
    const people = this._chorePeople();
    if (!people.length) return "";
    const today = isoDay(this._now);
    const house = this._houseChores();
    const cols = people.map((p) => {
      const bound = house.filter((h) => (h.who || "House") === p.name);
      const boundNames = new Set(bound.map((h) => normName(h.name)));
      const open = [];
      const openKeys = new Set();
      bound.forEach((h) => {
        const key = `h:${h.helper}`;
        if (!this._helperDue(h)) return;
        open.push({ kind: "helper", h, key });
        openKeys.add(key);
      });
      (p.entity ? this._todos[p.entity] || [] : []).forEach((it) => {
        if (boundNames.has(normName(it.summary)) || !choreIsDue(it, today)) return;
        const key = `t:${p.entity}:${this._todoId(it)}`;
        open.push({ kind: "todo", it, entity: p.entity, key, late: (itemDueDay(it) || today) < today });
        openKeys.add(key);
      });
      const done = Object.entries(this._done)
        .filter(([key, d]) => d.who === p.name && !openKeys.has(key))
        .map(([key, d]) => ({ kind: "done", key, name: d.name }));
      return { p, items: open.concat(done), left: open.length };
    });
    // A shorter screen keeps one row of chores so the calendar still has room.
    const h = this._ch || window.innerHeight;
    const cap = this._phone() ? 12 : h < 900 ? 1 : h < 1000 ? 2 : 3;
    const rows = Math.max(1, Math.min(cap, Math.max(...cols.map((c) => c.items.length))));
    return `<div class="panel chores">
      <div class="ch-h"><h3 class="eyebrow">Today's chores</h3><button type="button" data-act="settings-tab" data-tab="chores">Edit chores</button></div>
      <div class="ch-grid" style="grid-template-columns:repeat(${cols.length},minmax(0,1fr))">${cols.map(({ p, items, left }) => {
        const shown = items.slice(0, rows);
        const extra = items.length - shown.length;
        const cnt = !items.length ? "" : left ? `${left} left` : "All done";
        return `<div class="ch-p ${this._pp(p.name)}">
          <div class="ch-who">${this._avatar(p.name)}<span>${esc(p.name)}</span><span class="cnt ${items.length && !left ? "all" : ""}">${cnt}</span></div>
          ${items.length ? shown.map((i) => this._choreRow(i)).join("") : `<div class="ch-free">Nothing today</div>`}
          ${extra > 0 ? `<div class="ch-more">+${extra} more</div>` : ""}
        </div>`;
      }).join("")}</div>
    </div>`;
  }

  _choreRow(i) {
    const ck = `<span class="ck">${ICONS.check}</span>`;
    if (i.kind === "done") {
      return `<button type="button" class="ch-item done" data-act="undo-done" data-key="${esc(i.key)}">${ck}<span class="nm">${esc(i.name)}</span></button>`;
    }
    if (i.kind === "helper") {
      return `<button type="button" class="ch-item" data-act="helper-toggle" data-helper="${esc(i.h.helper)}" data-mode="${esc(i.h.mode || "done")}">${ck}<span class="nm">${esc(i.h.name)}</span><span class="auto" aria-label="The house keeps track of this one">${ICONS.sensor}</span></button>`;
    }
    return `<button type="button" class="ch-item ${i.late ? "late" : ""}" data-act="todo-toggle" data-entity="${esc(i.entity)}" data-uid="${esc(this._todoId(i.it))}">${ck}<span class="nm">${esc(i.it.summary)}</span>${i.late ? `<span class="late">Late</span>` : ""}</button>`;
  }

  _pic(entity) {
    const st = this._hass && this._hass.states[entity];
    const pic = st && st.attributes && st.attributes.entity_picture;
    if (!pic || !this._hass) return "";
    return this._hass.hassUrl(pic) + "&t=" + encodeURIComponent(st.state || Date.now());
  }

  _deviceIcon(domain, name) {
    if (domain === "fan" || /fan|exchanger/i.test(name || "")) return ICONS.fan;
    if (domain === "cover") return ICONS.cover;
    if (domain === "switch" || domain === "input_boolean") return ICONS.power;
    return ICONS.bulb;
  }


  _notResponding(entity, name) {
    const domain = entity.split(".")[0];
    return `<div class="tile na"><div class="tile-h"><span class="tico">${this._deviceIcon(domain, name)}</span><span class="tmeta"><span class="tname">${esc(name)}</span><span class="tst">Not responding</span></span></div></div>`;
  }

  _deviceTile(entity, name) {
    if (!entity) return "";
    const st = this._hass && this._hass.states[entity];
    if (!st) return "";
    const domain = entity.split(".")[0];
    // An offline light should say so, not quietly disappear from the room.
    if (st.state === "unavailable") return this._notResponding(entity, name);
    if (domain === "light") return this._lightTile(entity, name);
    const on = this._entOn(entity);
    const ico = this._deviceIcon(domain, name);
    const e = esc(entity);
    const head = (status, rgb) => `<div class="tile-h">
        <button type="button" class="tico" data-act="ent-toggle" data-entity="${e}" aria-label="${esc(name)}">${ico}</button>
        <button type="button" class="tmeta" data-act="ent-toggle" data-entity="${e}"><span class="tname">${esc(name)}</span><span class="tst">${esc(status)}</span></button>
      </div>`;
    if (domain === "cover") {
      const open = st.state === "open" || st.state === "opening";
      const status = st.state === "opening" ? "Opening…" : st.state === "closing" ? "Closing…" : open ? "Open" : "Closed";
      return `<div class="tile ${open ? "on" : ""}" style="--rgb:59, 130, 246">${head(status)}
        <div class="pair"><button type="button" class="${open ? "on" : ""}" data-act="cover" data-svc="open_cover" data-entity="${e}">Open</button><button type="button" class="${open ? "" : "on"}" data-act="cover" data-svc="close_cover" data-entity="${e}">Close</button></div>
      </div>`;
    }
    if (domain === "fan") {
      const a = st.attributes || {};
      const pct = a.percentage != null ? Math.round(Number(a.percentage)) : null;
      const speed = (Number(a.supported_features) & 1) === 1;
      const status = on ? (pct != null ? `${pct}%` : "On") : "Off";
      const fill = on ? (pct != null ? pct : 100) : 0;
      return `<div class="tile ${on ? "on" : ""}" style="--rgb:14, 165, 233;--pct:${fill}%">${head(status)}
        ${speed ? `<input class="slider" type="range" min="0" max="100" step="1" value="${on && pct != null ? pct : 0}" data-fan-pct="${e}" aria-label="Speed"/>` : `<button type="button" class="capbtn" data-act="ent-toggle" data-entity="${e}">${on ? "Turn off" : "Turn on"}</button>`}
      </div>`;
    }
    return `<div class="tile ${on ? "on" : ""}">${head(on ? "On" : "Off")}
      <button type="button" class="capbtn" data-act="ent-toggle" data-entity="${e}">${on ? "Turn off" : "Turn on"}</button>
    </div>`;
  }

  _glow(look, name) {
    if (/fan/i.test(name || "")) return "14, 165, 233";
    const [r, g, b] = look.rgb || [232, 150, 40];
    // Near-white bulbs get a warm amber so the icon still reads on a white card.
    return 0.299 * r + 0.587 * g + 0.114 * b > 200 ? "232, 150, 40" : `${r}, ${g}, ${b}`;
  }

  _lightTile(entity, name) {
    const look = this._lightLook(entity);
    if (!look) return "";
    const e = esc(entity);
    const pct = look.on ? look.pct : 0;
    const tune = look.temp || look.color;
    const ico = /fan/i.test(name || "") ? ICONS.fan : ICONS.bulb;
    const status = look.on ? (look.dimmable ? `${look.pct}%` : "On") : "Off";
    return `<div class="tile ${look.on ? "on" : ""}" style="--rgb:${this._glow(look, name)};--pct:${pct}%">
      <div class="tile-h">
        <button type="button" class="tico" data-act="ent-toggle" data-entity="${e}" aria-label="Turn ${esc(name)} ${look.on ? "off" : "on"}">${ico}</button>
        <button type="button" class="tmeta" data-act="ent-toggle" data-entity="${e}"><span class="tname">${esc(name)}</span><span class="tst">${esc(status)}</span></button>
        ${tune ? `<button type="button" class="tune" data-act="light-sheet" data-entity="${e}" data-name="${esc(name)}" aria-label="Colour and warmth">${ICONS.tune}</button>` : ""}
      </div>
      ${look.dimmable
        ? `<input class="slider" type="range" min="1" max="255" value="${look.on ? look.bright || 1 : 1}" data-bright="${e}" aria-label="Brightness"/>`
        : `<button type="button" class="capbtn" data-act="ent-toggle" data-entity="${e}">${look.on ? "Turn off" : "Turn on"}</button>`}
    </div>`;
  }

  _renderSection(sec) {
    const tiles = (sec.entities || []).map((e) => this._deviceTile(this._resolveEnt(e), e.name)).join("");
    if (!tiles.replace(/\s/g, "")) return "";
    const ids = this._sectionLightIds(sec);
    const anyOn = ids.some((id) => this._entOn(id));
    const adapt = ADAPTIVE[sec.id];
    const hasAdapt = adapt && this._hass && this._hass.states[adapt];
    const room = esc(sec.id);
    const scenes = sec.id === "kitchen"
      ? (this._cfg.scenes || []).map((s) => `<button type="button" class="mood" data-act="scene" data-entity="${esc(s.entity)}">${esc(s.name)}</button>`).join("")
      : "";
    return `<section class="sec">
      <div class="sec-h">
        <h3 class="eyebrow">${esc(sec.name)}</h3>
        ${ids.length ? `<div class="moods">
          <button type="button" class="mood" data-act="room-mood" data-room="${room}" data-mood="bright">Bright</button>
          <button type="button" class="mood" data-act="room-mood" data-room="${room}" data-mood="relax">Relax</button>
          <button type="button" class="mood" data-act="room-mood" data-room="${room}" data-mood="night">Night</button>
          ${scenes}
          ${hasAdapt ? `<button type="button" class="mood icon ${this._entOn(adapt) ? "on" : ""}" data-act="ent-toggle" data-entity="${esc(adapt)}" aria-label="Follow the sun">${ICONS.sun}</button>` : ""}
          <button type="button" class="mood icon ${anyOn ? "on" : ""}" data-act="room-all" data-room="${room}" data-on="${anyOn ? "0" : "1"}" aria-label="All lights">${ICONS.power}</button>
        </div>` : ""}
      </div>
      <div class="tiles">${tiles}</div>
    </section>`;
  }

  _areaSummary(tab) {
    if (tab === "vacuum") {
      const st = this._entState("sensor.roborock_qrevo_pro_status") || this._entState("vacuum.roborock_qrevo_pro") || "";
      const s = st.replace(/_/g, " ");
      return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
    }
    if (tab === "garage") {
      // Door state is a safety question, so say exactly what each one is doing.
      const moving = GARAGE_DOORS.find((d) => ["opening", "closing"].includes(this._entState(d.entity)));
      if (moving) return `${moving.name} is ${this._entState(moving.entity)}`;
      const open = GARAGE_DOORS.filter((d) => this._entOn(d.entity));
      if (open.length === 1) return `${open[0].name} is open`;
      return open.length ? `${open.length} doors are open` : "All doors closed";
    }
    let lights = 0;
    let other = 0;
    (HOME_SECTIONS[tab] || []).forEach((sec) => this._sectionEntities(sec).forEach((id) => {
      const d = id.split(".")[0];
      if (d === "cover" || !this._entOn(id)) return;
      if (d === "light" && !/fan/i.test(id)) lights += 1;
      else other += 1;
    }));
    const parts = [];
    if (lights) parts.push(`${lights} ${lights === 1 ? "light" : "lights"} on`);
    if (other) parts.push(`${other} ${other === 1 ? "other thing" : "other things"} on`);
    return parts.length ? parts.join(" · ") : "Everything is off";
  }

  _renderHome() {
    const tab = this._homeTab || "main";
    const nav = HOME_AREAS.map((a) => {
      const n = this._areaOnCount(a.id);
      return `<button type="button" class="area ar-${a.id} ${tab === a.id ? "on" : ""}" data-act="home-tab" data-tab="${esc(a.id)}">
        <span class="ai">${ICONS[a.icon] || ICONS.home}</span><span class="nm">${esc(a.name)}</span>${n ? `<span class="ct">${n}</span>` : ""}
      </button>`;
    }).join("");
    const area = HOME_AREAS.find((a) => a.id === tab) || HOME_AREAS[1];
    let body = "";
    if (tab === "vacuum") body = this._renderVacuum();
    else if (tab === "garage") body = this._renderGarage();
    else body = (HOME_SECTIONS[tab] || []).map((sec) => this._renderSection(sec)).join("");
    return `<div class="home">
      <nav class="panel areas">${nav}</nav>
      <div class="area-body" data-sk="area-${esc(tab)}">
        <div class="area-top"><div><h2>${esc(area.name)}</h2><p>${esc(this._areaSummary(tab))}</p></div></div>
        ${body}
      </div>
    </div>`;
  }

  _numTile(entity, name) {
    const st = this._hass && this._hass.states[entity];
    if (!st) return "";
    if (st.state === "unavailable") return this._notResponding(entity, name);
    const a = st.attributes || {};
    const val = Number(st.state);
    if (!Number.isFinite(val)) return "";
    const min = a.min != null ? Number(a.min) : 0;
    const max = a.max != null ? Number(a.max) : 100;
    const step = a.step != null ? Number(a.step) : 1;
    const unit = a.unit_of_measurement === "Percent" ? "%" : (a.unit_of_measurement || "");
    const pct = max === min ? 0 : Math.round(((val - min) / (max - min)) * 100);
    const e = esc(entity);
    return `<div class="tile on" style="--rgb:14, 165, 233;--pct:${pct}%">
      <div class="tile-h">
        <span class="tico">${ICONS.drop}</span>
        <span class="tmeta"><span class="tname">${esc(name)}</span><span class="tst" data-unit="${esc(unit)}">${Math.round(val)}${esc(unit)}</span></span>
      </div>
      <div class="slide-row">
        <button type="button" class="step" data-act="num-step" data-entity="${e}" data-dir="-1" aria-label="Lower">−</button>
        <input class="slider flat" type="range" min="${min}" max="${max}" step="${step}" value="${val}" data-num="${e}" aria-label="${esc(name)}"/>
        <button type="button" class="step" data-act="num-step" data-entity="${e}" data-dir="1" aria-label="Higher">+</button>
      </div>
    </div>`;
  }

  _climateTile() {
    const id = "climate.garage_thermostat";
    const st = this._hass && this._hass.states[id];
    if (!st) return "";
    if (st.state === "unavailable") return this._notResponding(id, "Thermostat");
    const heat = st.state === "heat";
    const a = st.attributes || {};
    const target = a.temperature != null ? Number(a.temperature) : null;
    const cur = a.current_temperature != null ? Number(a.current_temperature) : null;
    const status = `${heat ? "Heating" : "Off"}${target != null ? ` · set ${Math.round(target)}°` : ""}${cur != null ? ` · now ${Math.round(cur)}°` : ""}`;
    return `<div class="tile ${heat ? "on" : ""}" style="--rgb:234, 88, 12">
      <div class="tile-h">
        <button type="button" class="tico" data-act="clim-mode" data-entity="${id}" data-mode="${heat ? "off" : "heat"}" aria-label="Heat on or off">${ICONS.thermo}</button>
        <span class="tmeta"><span class="tname">Thermostat</span><span class="tst">${esc(status)}</span></span>
        ${target != null ? `<div class="stepper"><button type="button" data-act="clim-step" data-dir="-1" aria-label="Cooler">−</button><button type="button" data-act="clim-step" data-dir="1" aria-label="Warmer">+</button></div>` : ""}
      </div>
      <div class="pair"><button type="button" class="${heat ? "" : "on"}" data-act="clim-mode" data-entity="${id}" data-mode="off">Off</button><button type="button" class="${heat ? "on" : ""}" data-act="clim-mode" data-entity="${id}" data-mode="heat">Heat</button></div>
    </div>`;
  }

  _renderGarage() {
    const cam = this._pic("camera.garage_high");
    const tesla = this._entOn("binary_sensor.tesla_wall_connector_vehicle_connected");
    const teslaSt = (this._entState("sensor.tesla_wall_connector_status") || "").replace(/_/g, " ");
    const cost = Number(this._entState("sensor.current_charge_cost"));
    const words = {
      charging: "Charging", "charging reduced": "Charging slowly", "waiting car": "Plugged in",
      connected: "Plugged in", scheduled: "Charging later", negotiating: "Starting to charge",
      disconnected: "Not plugged in", "not connected": "Not plugged in", booting: "Charger starting up",
    };
    const teslaLine = tesla ? words[teslaSt] || "Plugged in" : "Not plugged in";
    const charging = /^charging/.test(teslaSt);
    const teslaCost = charging && Number.isFinite(cost) ? ` · $${cost.toFixed(2)} so far` : "";
    const tempN = Number(this._entState("sensor.temperature_sensor"));
    const humN = Number(this._entState("sensor.temperature_sensor_humidity_sensor"));
    const temp = Number.isFinite(tempN) ? `${Math.round(tempN)}°` : "—";
    const hum = Number.isFinite(humN) ? `${Math.round(humN)}%` : "—";
    const doors = GARAGE_DOORS.map((d) => {
      const st = this._hass && this._hass.states[d.entity];
      if (!st) return "";
      if (st.state === "unavailable") return `<div class="door"><div class="name"><span>${esc(d.name)}</span><span>Not responding</span></div><div class="gvis"><div class="panel-d"></div></div></div>`;
      const open = this._entOn(d.entity);
      const word = st.state === "opening" ? "Opening…" : st.state === "closing" ? "Closing…" : open ? "Open" : "Closed";
      return `<button type="button" class="door ${open ? "open" : ""}" data-act="ent-toggle" data-entity="${esc(d.entity)}">
        <div class="name"><span>${esc(d.name)}</span><span>${esc(word)}</span></div>
        <div class="gvis"><div class="panel-d"></div></div>
      </button>`;
    }).join("");
    const tiles = (list) => list.map((e) => this._deviceTile(e.entity, e.name)).join("");
    return `<div class="hero">
        <div class="snap">${cam ? `<img src="${esc(cam)}" alt="Garage">` : ""}<span class="tag">Garage camera</span></div>
        <div class="stack">
          <div class="panel stat ${tesla ? "on" : ""}"><span class="si">${ICONS.car}</span><div><div class="big">${esc(teslaLine)}</div><div class="sub">Tesla${esc(teslaCost)}</div></div></div>
          <div class="panel stat"><span class="si">${ICONS.thermo}</span><div><div class="big">${esc(temp)}</div><div class="sub">In the garage</div></div></div>
          <div class="panel stat"><span class="si">${ICONS.drop}</span><div><div class="big">${esc(hum)}</div><div class="sub">Humidity</div></div></div>
        </div>
      </div>
      <section class="sec"><div class="sec-h"><h3 class="eyebrow">Doors</h3></div><div class="doors">${doors}</div></section>
      <section class="sec"><div class="sec-h"><h3 class="eyebrow">Climate</h3></div><div class="tiles">
        ${this._climateTile()}
        ${this._numTile("input_number.garage_humidity_setpoint", "Humidity target")}
        ${this._deviceTile("input_boolean.enable_garage_humidity_sensor", "Use humidity target")}
        ${this._deviceTile("switch.air_exchanger", "Air exchanger")}
        ${this._deviceTile("input_boolean.fan_periodic_run", "Run fans on a timer")}
      </div></section>
      <section class="sec"><div class="sec-h"><h3 class="eyebrow">Fans</h3></div><div class="tiles">${tiles(GARAGE_FANS)}</div></section>
      <section class="sec"><div class="sec-h"><h3 class="eyebrow">Door lights</h3></div><div class="tiles">${tiles(GARAGE_LIGHTS)}</div></section>
      <section class="sec"><div class="sec-h"><h3 class="eyebrow">Outside</h3></div><div class="tiles">${tiles(HOME_OUTSIDE)}</div></section>`;
  }

  _renderVacuum() {
    const vac = this._hass && this._hass.states["vacuum.roborock_qrevo_pro"];
    const vstate = vac ? vac.state : "unknown";
    const batt = Math.max(0, Math.min(100, Number(this._entState("sensor.roborock_qrevo_pro_battery")) || 0));
    const status = (this._entState("sensor.roborock_qrevo_pro_status") || vstate).replace(/_/g, " ");
    const room = this._entState("sensor.roborock_qrevo_pro_current_room") || "";
    const mode = this._entState("select.kitchen_roborock_qrevo_pro_cleaning_mode");
    const speed = vac && vac.attributes ? vac.attributes.fan_speed : "";
    const map = this._pic("image.roborock_qrevo_pro_upstairs");
    const cleaning = vstate === "cleaning" || status.includes("clean") || status.includes("mop");
    const opt = (ent, label) => `<button type="button" class="chip-btn ${this._entOn(ent) ? "on" : ""}" data-act="ent-toggle" data-entity="${esc(ent)}">${esc(label)}</button>`;
    const speeds = (vac && vac.attributes && vac.attributes.fan_speed_list ? vac.attributes.fan_speed_list : ["quiet", "balanced", "turbo", "max"])
      .filter((s) => !["off", "custom", "smart_mode"].includes(s));
    const nice = (s) => { const t = String(s).replace(/_/g, " "); return t.charAt(0).toUpperCase() + t.slice(1); };
    return `<div class="hero">
        <div class="snap map">${map ? `<img src="${esc(map)}" alt="Vacuum map">` : ""}<span class="tag">${esc(room ? `Now in ${room}` : "Upstairs map")}</span></div>
        <div class="stack">
          <div class="panel stat ${cleaning ? "on" : ""}"><span class="si">${ICONS.vac}</span><div style="flex:1"><div class="big">${esc(nice(status))}</div><div class="sub">${batt}% battery</div><div class="meter"><span style="width:${batt}%"></span></div></div></div>
          <div class="btn-row">
            <button type="button" class="btn primary" data-act="vac" data-cmd="start">${ICONS.play}Start</button>
            <button type="button" class="btn" data-act="vac" data-cmd="pause">${ICONS.pause}Pause</button>
            <button type="button" class="btn" data-act="vac" data-cmd="return_to_base">${ICONS.dock}Dock</button>
          </div>
        </div>
      </div>
      <section class="sec"><div class="sec-h"><h3 class="eyebrow">Send to a room</h3></div><div class="opts">${HOME_VACUUM_ROOMS.map((r) => opt(r.entity, r.name)).join("")}</div></section>
      <section class="sec"><div class="sec-h"><h3 class="eyebrow">How to clean</h3></div><div class="opts">
        ${["vacuum", "vac_and_mop", "mop"].map((o) => `<button type="button" class="chip-btn ${mode === o ? "on" : ""}" data-act="set-option" data-entity="select.kitchen_roborock_qrevo_pro_cleaning_mode" data-option="${o}">${o === "vac_and_mop" ? "Vacuum and mop" : o === "vacuum" ? "Vacuum" : "Mop only"}</button>`).join("")}
        ${opt("input_boolean.vacuum_qp_twice", "Clean twice")}
        ${opt("input_boolean.vacuum_qp_mopping", "Mop")}
        ${opt("input_boolean.mop_when_gone_next", "Mop when we leave")}
        ${opt("input_boolean.auto_vacuum_enabled", "Automatic")}
      </div></section>
      <section class="sec"><div class="sec-h"><h3 class="eyebrow">Suction</h3></div><div class="opts">
        ${speeds.map((s) => `<button type="button" class="chip-btn ${speed === s ? "on" : ""}" data-act="set-fan" data-speed="${esc(s)}">${esc(nice(s))}</button>`).join("")}
      </div></section>`;
  }

  _renderShop() {
    const id = this._cfg.shopping;
    if (!id) return `<div class="panel shop-list"><div class="gempty">No shopping list is set up yet.</div></div>`;
    const items = this._todos[id] || [];
    const open = items.filter((it) => it.status !== "completed");
    const done = items.filter((it) => it.status === "completed");
    const linked = open.filter((it) => walmartId(it.description));
    const staples = Object.keys(this._prefs.staples || {}).length;
    return `<div class="shop">
      <div class="panel shop-list">
        <div class="shop-h"><h2>Groceries</h2><span>${open.length ? `${open.length} to buy` : "All set"}</span></div>
        <form class="add-bar" data-form="shop" autocomplete="off">
          <input class="inp" name="item" data-k="shop-item" placeholder="Add milk, bananas, bread…" enterkeyhint="done" autocorrect="off"/>
          <button type="submit" class="btn primary">${ICONS.plus}Add</button>
        </form>
        <div class="glist" data-sk="glist">
          ${open.length ? open.map((it) => this._groceryRow(id, it)).join("") : `<div class="gempty">The list is empty. Add something above.</div>`}
          ${done.length ? `<div class="gdone-h"><h3 class="eyebrow">In the cart · ${done.length}</h3><button type="button" class="btn sm ghost" data-act="shop-clear">Clear</button></div>${done.map((it) => this._groceryRow(id, it)).join("")}` : ""}
        </div>
      </div>
      <div class="walmart">
        <div class="panel wm-card">
          <div class="wm-logo"><span class="i">${ICONS.bag}</span>Walmart</div>
          <p>${linked.length
            ? `${linked.length} of ${open.length} ${open.length === 1 ? "item is" : "items are"} linked to a Walmart product and ready for your cart.`
            : "Link an item to its Walmart product once. After that, the whole list goes to your cart in one tap."}</p>
          <button type="button" class="btn walmart-go" data-act="wm-cart" ${linked.length ? "" : "disabled"}>${ICONS.shop}${linked.length ? `Send ${linked.length} to my Walmart cart` : "Send to my Walmart cart"}</button>
          <div class="btn-row">
            <button type="button" class="btn" data-act="shop-app">Open the app</button>
            <button type="button" class="btn" data-act="shop-open">Walmart.com</button>
          </div>
        </div>
        <div class="panel help-card">
          <h3 class="eyebrow">Linking an item</h3>
          <ol class="steps">
            <li>Tap Link next to an item, then Find it on Walmart.</li>
            <li>On the product you buy, tap Share, then Copy link.</li>
            <li>Paste it in and Save. The wall remembers it${staples ? ` · ${staples} remembered so far` : ""}.</li>
          </ol>
        </div>
      </div>
    </div>`;
  }

  _groceryRow(entity, it) {
    const done = it.status === "completed";
    const wid = walmartId(it.description);
    const uid = esc(this._todoId(it));
    return `<div class="grow ${done ? "done" : ""}">
      <button type="button" class="gck" data-act="shop-toggle" data-uid="${uid}"><span class="ck">${ICONS.check}</span><span class="nm">${esc(it.summary)}</span></button>
      ${done ? "" : `<button type="button" class="wm-link ${wid ? "on" : ""}" data-act="wm-link" data-uid="${uid}">${wid ? `${ICONS.check}Walmart` : `${ICONS.link}Link`}</button>`}
    </div>`;
  }

  _renderMeals() {
    const todayIdx = (this._now.getDay() + 6) % 7;
    const monday = addDays(startOfDay(this._now), -todayIdx);
    const meals = this._cfg.meals || {};
    const favs = this._prefs.favorites.length ? this._prefs.favorites : DEFAULT_FAVORITES;
    return `<div class="meals-v">
      <div class="meals-h">
        <div><h2>This week's dinners</h2><p>Tap a day to plan it. Tonight's dinner shows on the calendar.</p></div>
        <button type="button" class="btn" data-act="meal-ai">${ICONS.sparkle}Plan my week</button>
      </div>
      <div class="mgrid">${MEAL_KEYS.map((k, i) => {
        const ent = meals[k];
        const d = addDays(monday, i);
        return `<label class="panel mcard ${i === todayIdx ? "today" : ""} ${i < todayIdx ? "past" : ""}" data-k-day="${k}">
          <span class="md"><b>${MEAL_LABELS[i]}</b><em>${d.getDate()}</em></span>
          ${i === todayIdx ? `<span class="mtag">Tonight</span>` : ""}
          <textarea class="minp" rows="3" maxlength="80" data-meal="${esc(ent || "")}" data-k="meal-${k}" placeholder="What's for dinner?" ${ent ? "" : "disabled"}>${esc(this._mealValue(k))}</textarea>
          ${this._eveningPlans(isoDay(d))}
        </label>`;
      }).join("")}</div>
      <div class="panel favs">
        <h3 class="eyebrow">Family favorites</h3>
        <p>Tap a day above, then a favorite to drop it in.</p>
        <div class="chips">${favs.map((f) => `<button type="button" class="fav" data-act="meal-fav" data-v="${esc(f)}">${esc(f)}</button>`).join("")}<button type="button" class="fav add" data-act="fav-edit">Edit favorites</button></div>
      </div>
    </div>`;
  }

  // Busy evenings, so whoever plans dinner can see it's a quick-meal night.
  _eveningPlans(key) {
    const evs = this._dayList(key).filter((ev) => !ev._allDay && ev._first === key && ev._s.getHours() >= 15 && ev._s.getHours() < 21);
    if (!evs.length) return `<div class="mbusy free"><span class="eyebrow">That evening</span><span>Nothing planned</span></div>`;
    return `<div class="mbusy"><span class="eyebrow">That evening</span>${evs.map((ev) => `<div class="mb-row ${this._pp(ev._name)}"><span class="bar"></span><span>${esc(ev.summary || "Event")}</span><em>${esc(hm(ev._s))}</em></div>`).join("")}</div>`;
  }

  _renderSheet(entering) {
    const s = this._sheet;
    if (!s) return "";
    let inner = "";
    if (s.type === "settings") inner = this._renderSettings();
    else if (s.type === "chore") inner = this._renderChoreForm();
    else if (s.type === "day") inner = this._sheetDay(s);
    else if (s.type === "add") inner = this._sheetAdd(s);
    else if (s.type === "light") inner = this._sheetLight(s);
    else if (s.type === "wm-link") inner = this._sheetWalmart(s);
    else if (s.type === "ai-setup") inner = this._sheetAiSetup();
    else if (s.type === "ai-plan") inner = this._sheetAiPlan(s);
    else if (s.type === "fav") inner = this._sheetFavorites();
    else if (s.type === "photo") inner = this._sheetPhoto(s);
    if (!inner) return "";
    return `<div class="overlay ${entering ? "enter" : ""}" data-act="close">${inner}</div>`;
  }

  _sheetDay(s) {
    const d = localDate(s.day);
    const evs = this._dayList(s.day);
    const rows = evs.map((ev) => {
      const canDel = !!ev.uid && (this._calFeatures(ev._cal) & 2) === 2;
      const k = `${ev._cal}|${ev.uid || ""}|${ev.recurrence_id || ""}`;
      const asking = s.confirm === k;
      const del = asking
        ? `<button type="button" class="btn sm danger" data-act="ev-del" data-cal="${esc(ev._cal)}" data-uid="${esc(ev.uid)}" data-rid="${esc(ev.recurrence_id || "")}">Remove</button><button type="button" class="btn sm ghost" data-act="ev-keep">Keep</button>`
        : canDel ? `<button type="button" class="x" data-act="ev-ask" data-ek="${esc(k)}" aria-label="Remove">${ICONS.trash}</button>` : "";
      return `<div class="drow ${this._pp(ev._name)} ${asking ? "confirm" : ""}">
        <span class="tm">${esc(eventRangeLabel(ev, s.day))}</span>
        <span class="tt">${esc(ev.summary || "Event")}<span class="who">${esc(ev._name || "")}</span></span>
        ${del}
      </div>`;
    }).join("");
    return `<div class="dlg">
      <h2>${WEEKDAYS_LONG[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}</h2>
      <div class="sub">${evs.length ? `${evs.length} ${evs.length === 1 ? "thing" : "things"} on this day.` : "Nothing planned yet."}</div>
      ${rows ? `<div class="dlist">${rows}</div>` : ""}
      <div class="actions">
        <button type="button" class="btn ghost" data-act="close">Close</button>
        <button type="button" class="btn primary" data-act="add-on" data-date="${esc(s.day)}">${ICONS.plus}Add something</button>
      </div>
    </div>`;
  }

  _sheetAdd(s) {
    const cals = this._cals();
    return `<form class="dlg" data-form="add" autocomplete="off">
      <h2>Add to the calendar</h2>
      <div class="sub">Everyone sees it right away.</div>
      ${s.error ? `<div class="err">${esc(s.error)}</div>` : ""}
      <div class="field"><span class="eyebrow">What's happening?</span>
        <input class="inp" name="title" data-k="add-title" data-autofocus value="${esc(s.title || "")}" placeholder="Soccer practice, dentist, date night…" enterkeyhint="done"/></div>
      <div class="field"><span class="eyebrow">Who is it for?</span>
        <div class="who-row">${cals.map((c) => `<button type="button" class="${this._pp(c.name)} ${s.cal === c.entity ? "on" : ""}" data-act="who" data-entity="${esc(c.entity)}">${this._avatar(c.name)}${esc(c.name)}</button>`).join("")}</div></div>
      <div class="field"><span class="eyebrow">Day</span><input class="inp" type="date" name="day" data-k="add-day" value="${esc(s.day)}"/></div>
      <button type="button" class="switch-row" data-act="all-day"><span>All day</span><span class="sw ${s.allDay ? "on" : ""}"></span></button>
      ${s.allDay ? "" : `<div class="row2">
        <div class="field"><span class="eyebrow">Starts</span><input class="inp" type="time" name="start" data-k="add-start" value="${esc(s.start || "09:00")}"/></div>
        <div class="field"><span class="eyebrow">Ends</span><input class="inp" type="time" name="end" data-k="add-end" value="${esc(s.end || "")}"/></div>
      </div>`}
      <div class="actions">
        <button type="button" class="btn ghost" data-act="close">Cancel</button>
        <button type="submit" class="btn primary" ${s.busy ? "disabled" : ""}>${s.busy ? "Saving…" : "Save"}</button>
      </div>
    </form>`;
  }

  _sheetLight(s) {
    const look = this._lightLook(s.entity);
    if (!look) return "";
    const name = s.name || (look.st.attributes && look.st.attributes.friendly_name) || "Light";
    const e = esc(s.entity);
    const colors = LIGHT_DOTS.concat([[255, 72, 64], [255, 140, 20], [80, 200, 120], [64, 128, 255], [150, 90, 255], [255, 105, 180]]);
    return `<div class="dlg" style="--rgb:${this._glow(look, name)};--pct:${look.on ? look.pct : 0}%">
      <h2>${esc(name)}</h2>
      <div class="sub">${look.on ? `On · ${look.pct}%` : "Off"}</div>
      ${look.dimmable ? `<div class="field"><span class="eyebrow">Brightness</span><input class="slider flat" type="range" min="1" max="255" value="${look.bright || 1}" data-bright="${e}"/></div>` : ""}
      ${look.temp ? `<div class="field"><span class="eyebrow">Warm to cool</span><input class="slider ct" type="range" min="${look.minK}" max="${look.maxK}" value="${look.kelvin || 3000}" data-ct="${e}"/></div>` : ""}
      ${look.color ? `<div class="field"><span class="eyebrow">Colour</span><div class="dots">${colors.map((c) => `<button type="button" class="dotc" data-act="set-rgb" data-entity="${e}" data-rgb="${c.join(",")}" style="background:rgb(${c.join(",")})" aria-label="Colour"></button>`).join("")}</div></div>` : ""}
      <div class="actions">
        <button type="button" class="btn left" data-act="ent-toggle" data-entity="${e}">${ICONS.power}${look.on ? "Turn off" : "Turn on"}</button>
        <button type="button" class="btn primary" data-act="close">Done</button>
      </div>
    </div>`;
  }

  _sheetWalmart(s) {
    const item = (this._todos[this._cfg.shopping] || []).find((it) => this._todoId(it) === s.uid);
    const name = item ? item.summary : "this item";
    const wid = item ? walmartId(item.description) : "";
    return `<form class="dlg" data-form="wm" autocomplete="off">
      <h2>Link ${esc(name)} to Walmart</h2>
      <div class="sub">Do this once. After that, ${esc(name)} goes straight into your Walmart cart whenever it's on the list.</div>
      ${s.error ? `<div class="err">${esc(s.error)}</div>` : ""}
      <ol class="steps">
        <li>Find the exact product you buy.</li>
        <li>On its page, tap Share, then Copy link.</li>
        <li>Paste the link below and tap Save.</li>
      </ol>
      <div class="actions" style="justify-content:flex-start;margin:18px 0 20px"><button type="button" class="btn" data-act="wm-find" data-q="${esc(name)}">${ICONS.external}Find it on Walmart</button></div>
      <div class="field"><span class="eyebrow">Walmart product link</span>
        <input class="inp" name="wm-url" data-k="wm-url" data-autofocus value="${wid ? `https://www.walmart.com/ip/${esc(wid)}` : ""}" placeholder="https://www.walmart.com/ip/…" inputmode="url"/></div>
      <div class="actions">
        ${wid ? `<button type="button" class="btn danger left" data-act="wm-unlink">Remove link</button>` : ""}
        <button type="button" class="btn ghost" data-act="close">Cancel</button>
        <button type="submit" class="btn primary">Save</button>
      </div>
    </form>`;
  }

  _sheetAiSetup() {
    return `<div class="dlg">
      <h2>Plan the week with AI</h2>
      <div class="sub">WrightWay can plan the week's dinners around the calendar, with quick meals on busy nights, then put the groceries on the list.</div>
      <p class="note">This needs an AI assistant connected to Home Assistant. In Home Assistant go to Settings, Devices &amp; services, Add integration, and pick Anthropic, OpenAI or Google Gemini. It shows up here on its own once it's added.</p>
      <div class="actions"><button type="button" class="btn primary" data-act="close">Got it</button></div>
    </div>`;
  }

  _sheetAiPlan(s) {
    if (s.busy) {
      return `<div class="dlg"><h2>Planning dinners…</h2><div class="busy"><span class="spin"></span>Looking at this week's calendar</div></div>`;
    }
    if (s.error || !s.plan) {
      return `<div class="dlg"><h2>Plan the week</h2><div class="err">${esc(s.error || "Nothing came back.")}</div>
        <div class="actions"><button type="button" class="btn ghost" data-act="close">Close</button><button type="button" class="btn primary" data-act="meal-ai">Try again</button></div></div>`;
    }
    const open = new Set(s.open || []);
    const groc = Array.isArray(s.plan.groceries) ? s.plan.groceries : String(s.plan.groceries || "").split(/\n|,/);
    const g = groc.map((x) => String(x).trim()).filter(Boolean);
    return `<div class="dlg wide">
      <h2>Here's a plan</h2>
      <div class="sub">Nights you already planned stay the same. Use it as is, or close and change anything by hand.</div>
      <div class="plan-list">${MEAL_KEYS.map((k, i) => `<div class="plan-row"><b>${MEAL_LABELS[i]}</b><span>${esc(open.has(k) ? s.plan[k] || "" : this._mealValue(k))}</span>${open.has(k) ? "" : `<em class="note" style="margin:0">already planned</em>`}</div>`).join("")}</div>
      ${g.length ? `<div class="plan-groc"><b>Adds to groceries:</b> ${esc(g.join(", "))}</div>` : ""}
      <div class="actions"><button type="button" class="btn ghost" data-act="close">Not now</button><button type="button" class="btn primary" data-act="ai-apply">${ICONS.check}Use this plan</button></div>
    </div>`;
  }

  _sheetFavorites() {
    const favs = this._prefs.favorites.length ? this._prefs.favorites : DEFAULT_FAVORITES;
    return `<form class="dlg" data-form="fav" autocomplete="off">
      <h2>Family favorites</h2>
      <div class="sub">The dinners you make all the time. The meal helper works them in too.</div>
      <div class="chips" style="margin-bottom:18px">${favs.map((f) => `<button type="button" class="chip-btn" data-act="fav-del" data-v="${esc(f)}">${esc(f)} ✕</button>`).join("")}</div>
      <div class="field"><span class="eyebrow">Add a favorite</span><div class="add-bar"><input class="inp" name="fav" data-k="fav" data-autofocus maxlength="40" placeholder="Taco Tuesday, Grandma's chili…"/><button type="submit" class="btn primary">${ICONS.plus}Add</button></div></div>
      <div class="field"><span class="eyebrow">Anything the meal helper should know?</span><textarea class="inp" style="height:96px;padding-top:14px;resize:none" data-meal-notes="1" data-k="meal-notes" placeholder="No mushrooms. Ben is vegetarian on Fridays.">${esc(this._prefs.meal_notes || "")}</textarea></div>
      <div class="actions"><button type="button" class="btn primary" data-act="close">Done</button></div>
    </form>`;
  }

  _calendarOptions() {
    if (!this._hass) return [];
    return Object.keys(this._hass.states)
      .filter((id) => id.startsWith("calendar."))
      .map((id) => ({
        entity: id,
        name: (this._hass.states[id].attributes && this._hass.states[id].attributes.friendly_name) || id,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  _setupItems(entity) {
    return (this._todos[entity] || []).filter((it) => parseWW(it.description) || it.status !== "completed");
  }


  _renderSettings() {
    const tab = (this._sheet && this._sheet.tab) || "chores";
    const t = (id, label) => `<button type="button" class="${tab === id ? "on" : ""}" data-act="settings-tab" data-tab="${id}">${label}</button>`;
    let body = "";
    if (tab === "help") body = this._settingsHelp();
    else if (tab === "people") body = this._settingsPeople();
    else if (tab === "display") body = this._settingsDisplay();
    else if (tab === "camera") body = this._settingsSetup();
    else body = this._settingsChores();
    return `<div class="dlg wide" data-sk="settings">
      <h2>Settings</h2>
      <div class="tabs">${t("help", "How to use")}${t("chores", "Chores")}${t("people", "People")}${this._phone() ? "" : t("display", "Screen")}${t("camera", "Setup")}</div>
      ${body}
      <div class="actions"><button type="button" class="btn primary" data-act="close">Done</button></div>
    </div>`;
  }

  _settingsHelp() {
    const item = (icon, title, text) => `<div class="help-item"><span class="hi">${ICONS[icon]}</span><div><b>${title}</b><p>${text}</p></div></div>`;
    return `<div class="help-grid">
      ${item("calendar", "Calendar", "Tap a day to see it or add something. Pick who it's for, type what's happening, and Save. Week shows the next seven days in columns.")}
      ${item("check", "Chores", "Today's chores sit under the calendar. Tap one to check it off. Tapped the wrong one? Tap it again, or hit Undo.")}
      ${item("sensor", "Chores the house tracks", "Some chores check themselves off, like the litter box when it cleans. Those show a little signal icon.")}
      ${item("shop", "Shopping", "Type milk, bananas, whatever you need. Link an item to Walmart once, and the whole list can go to your cart in one tap.")}
      ${item("meals", "Meals", "Tap a day and type dinner. Tonight's dinner shows on the calendar for everyone.")}
      ${item("home", "Home", "Lights, garage doors, fans and the vacuum. Tap the round icon to turn something on or off, and slide the bar for brightness.")}
      ${item("photos", "Photos", "When nobody has tapped for a while, family photos fill the screen. Tap anywhere to come back. Photos on the left starts them now.")}
      ${item("moon", "Evening", "The screen dims to dark at 7 PM and brightens in the morning. The sun and moon button up top switches it by hand.")}
    </div>`;
  }

  _settingsChores() {
    const chores = this._chores();
    return `<div class="sub" style="margin-top:0">Who does what, and how often it comes back. Checking one off marks it done until its next day.</div>
      <div class="setup">${chores.map((c) => {
        const items = this._setupItems(c.entity);
        return `<div class="pblock ${this._pp(c.name)}">
          <h4>${this._avatar(c.name)}${esc(c.name)}</h4>
          ${items.length ? items.map((it) => `<div class="crow">
            <div class="grow2"><div>${esc(it.summary)}</div><div class="meta">${esc(freqLabel(parseWW(it.description)))}</div></div>
            <button type="button" class="tiny" data-act="chore-edit" data-entity="${esc(c.entity)}" data-uid="${esc(it.uid || it.summary)}">Edit</button>
            <button type="button" class="tiny danger" data-act="chore-del" data-entity="${esc(c.entity)}" data-uid="${esc(it.uid || it.summary)}">Remove</button>
          </div>`).join("") : `<div class="meta" style="padding:6px 0 2px;color:var(--ink-3)">No chores yet.</div>`}
          <button type="button" class="add-chore" data-act="chore-new" data-entity="${esc(c.entity)}">+ Add a chore for ${esc(c.name)}</button>
        </div>`;
      }).join("")}</div>`;
  }

  _settingsPeople() {
    const opts = this._calendarOptions();
    const count = {};
    opts.forEach((o) => { count[o.name] = (count[o.name] || 0) + 1; });
    // Home Assistant can have three calendars all called "Family"; tell them apart.
    const label = (o) => (count[o.name] > 1 ? `${o.name} (${o.entity.replace("calendar.", "")})` : o.name);
    return `<div class="sub" style="margin-top:0">Pick each person's colour and which calendar is theirs. Saved on this screen.</div>
      ${this._cals().map((c) => `<div class="prow">
        <div class="order">
          <button type="button" data-act="person-up" data-name="${esc(c.name)}" aria-label="Move up">↑</button>
          <button type="button" data-act="person-down" data-name="${esc(c.name)}" aria-label="Move down">↓</button>
        </div>
        ${this._avatar(c.name)}
        <span class="nm">${esc(c.name)}</span>
        <div class="sws">${PERSON_SWATCHES.map((h) => `<button type="button" class="swc ${h.toLowerCase() === String(c.color).toLowerCase() ? "on" : ""}" data-act="pref-color" data-name="${esc(c.name)}" data-color="${h}" style="background:${h}" aria-label="Colour"></button>`).join("")}
          <input type="color" data-pref-color="${esc(c.name)}" value="${esc(/^#[0-9a-f]{6}$/i.test(c.color) ? c.color : "#94a3b8")}" aria-label="Any colour"/></div>
        <select class="inp sm" data-pref-cal="${esc(c.name)}">${opts.map((o) => `<option value="${esc(o.entity)}" ${o.entity === c.entity ? "selected" : ""}>${esc(label(o))}</option>`).join("")}</select>
      </div>`).join("")}`;
  }

  _settingsDisplay() {
    const theme = (this._prefs && this._prefs.theme) || "auto";
    const idle = this._idleWait();
    const photo = this._photoWait();
    const sleep = this._prefs && Number(this._prefs.sleep_minutes);
    const chips = (list, cur, act, key) => `<div class="chips">${list.map(([v, l]) => `<button type="button" class="chip-btn ${cur === v ? "on" : ""}" data-act="${act}" data-${key}="${v}">${l}</button>`).join("")}</div>`;
    const n = this._photos().length;
    return `<div class="set-sec"><h3 class="eyebrow">Size on screen</h3>
        ${chips([[0.9, "Smaller"], [1, "Standard"], [1.12, "Larger"], [1.25, "Largest"]], Number(this._prefs.size) || 1, "size-set", "size")}
        <p class="note">Larger makes everything easier to read from across the room, with a little less on screen.</p></div>
      <div class="set-sec"><h3 class="eyebrow">Day and evening</h3>
        ${chips([["auto", "Automatic"], ["light", "Always day"], ["night", "Always evening"]], theme, "theme", "theme")}
        <p class="note">Automatic turns dark at 7 PM and light again at 6:30 in the morning.</p></div>
      <div class="set-sec"><h3 class="eyebrow">Photos start after nobody taps for</h3>
        ${chips([[30, "30 seconds"], [60, "1 minute"], [90, "90 seconds"], [120, "2 minutes"], [300, "5 minutes"], [0, "Never"]], idle, "idle-sec", "sec")}</div>
      <div class="set-sec"><h3 class="eyebrow">Each photo stays for</h3>
        ${chips([[8, "8 seconds"], [12, "12 seconds"], [20, "20 seconds"], [45, "45 seconds"], [60, "1 minute"]], photo, "photo-sec", "sec")}</div>
      <div class="set-sec"><h3 class="eyebrow">Turn the screen off after photos</h3>
        ${chips([[0, "Never"], [5, "5 minutes"], [15, "15 minutes"], [30, "30 minutes"], [-1, "Only in the evening"]], sleep, "sleep-min", "min")}</div>
      <div class="set-sec"><h3 class="eyebrow">Family photos</h3>
        <div class="kv"><span>Photos found</span><span class="${n ? "ok" : "no"}">${n ? `${n} photos` : "None yet, showing the clock instead"}</span></div>
        <p class="note">${this._cfg.photos_url ? "Add or remove photos from the WrightWay app on your phone (Photos tab)." : "Easiest: in Home Assistant open Media, then My media, make a folder called family, and upload JPEG photos. iPhone HEIC photos won't show; export them as JPEG."}</p>
        <div class="field" style="margin-top:14px"><span class="eyebrow">iCloud shared album link</span>
          <input class="inp sm" data-pref-icloud data-k="icloud" placeholder="https://www.icloud.com/sharedalbum/#…" value="${esc((this._prefs && this._prefs.icloud_album) || "")}"/></div>
        <p class="note">${esc(this._icloudNote || "In Photos: album, Share, Shared Album, turn on Public Website, copy the link.")}</p></div>`;
  }

  _settingsSetup() {
    const staples = Object.keys(this._prefs.staples || {}).length;
    const ai = this._aiEntity();
    const dpr = Math.round((window.devicePixelRatio || 1) * 100) / 100;
    return `<div class="set-sec"><h3 class="eyebrow">This screen</h3>
        <div class="kv"><span>The browser reports</span><span>${this._vw} × ${this._vh} · pixel ratio ${dpr}</span></div>
        <div class="kv"><span>WrightWay draws</span><span>a ${this._cw} × ${this._ch} layout at ${Math.round((this._scale || 1) * 100)}%</span></div></div>
      <div class="set-sec"><h3 class="eyebrow">Camera</h3>
        <button type="button" class="switch-row" data-act="mute-toggle"><span>Keep camera sound off</span><span class="sw ${this._muted() ? "on" : ""}"></span></button></div>
      <div class="set-sec"><h3 class="eyebrow">Walmart</h3>
        <div class="kv"><span>Products the wall remembers</span><span>${staples}</span></div>
        ${staples ? `<div class="actions" style="justify-content:flex-start;margin-top:12px"><button type="button" class="btn sm danger" data-act="staples-forget">Forget all linked products</button></div>` : ""}</div>
      <div class="set-sec"><h3 class="eyebrow">Meal helper</h3>
        <div class="kv"><span>AI assistant</span><span class="${ai ? "ok" : "no"}">${ai ? esc(ai) : "Not connected"}</span></div></div>
      <div class="set-sec"><h3 class="eyebrow">Calendars on the wall</h3>
        ${this._cals().map((c) => `<div class="kv"><span>${esc(c.name)}</span><span>${esc(c.entity)}</span></div>`).join("")}</div>`;
  }

  _renderChoreForm() {
    const s = this._sheet;
    const chores = this._chores();
    const f = (id, label) => `<button type="button" class="chip-btn ${s.freq === id ? "on" : ""}" data-act="chore-freq" data-freq="${id}">${label}</button>`;
    return `<form class="dlg" data-form="chore" autocomplete="off">
      <h2>${s.uid ? "Edit chore" : "New chore"}</h2>
      <div class="sub">Who does it, and how often it comes back.</div>
      <div class="field"><span class="eyebrow">Chore</span><input class="inp" name="chore-title" data-k="chore-title" data-autofocus placeholder="Take out trash, feed the cat…" value="${esc(s.title || "")}"/></div>
      <div class="field"><span class="eyebrow">Who</span><div class="who-row">${chores.map((c) => `<button type="button" class="${this._pp(c.name)} ${s.entity === c.entity ? "on" : ""}" data-act="chore-who" data-entity="${esc(c.entity)}">${this._avatar(c.name)}${esc(c.name)}</button>`).join("")}</div></div>
      <div class="field"><span class="eyebrow">Repeats</span><div class="chips">${f("weekly", "On certain days")}${f("every2", "Every other day")}${f("every", "Every few days")}${f("once", "Just once")}</div></div>
      ${s.freq === "weekly" ? `<div class="field"><span class="eyebrow">Which days</span><div class="daysel">${DAY_LETTERS.map((l, i) => `<button type="button" class="${(s.days || []).map(Number).includes(i) ? "on" : ""}" data-act="chore-day" data-day="${i}" aria-label="${WEEKDAYS_LONG[i]}">${l}</button>`).join("")}</div></div>` : ""}
      ${s.freq === "every" ? `<div class="n-row">Every <input class="inp sm" name="chore-n" type="number" min="2" max="30" value="${esc(s.n || 3)}"/> days</div>` : ""}
      <div class="actions">
        <button type="button" class="btn ghost left" data-act="settings-tab" data-tab="chores">Back</button>
        ${s.uid ? `<button type="button" class="btn danger" data-act="chore-del" data-entity="${esc(s.entity)}" data-uid="${esc(s.uid)}">Remove</button>` : ""}
        <button type="submit" class="btn primary">Save</button>
      </div>
    </form>`;
  }


  _onClick(e) {
    const card = e.target.closest && e.target.closest(".mcard");
    if (card) this._mealFocus = card.dataset.kDay;
    const t = e.target.closest && e.target.closest("[data-act]");
    if (!t) return;
    // The backdrop closes a sheet, but not a tap that started inside it.
    if (t.classList.contains("overlay") && e.target !== t) return;
    const act = t.dataset.act;
    const d = t.dataset;
    const hass = this._hass;
    const now = new Date();

    switch (act) {
      case "view":
        this._view = d.view;
        this._sheet = null;
        if (this._view === "home") this._homeTab = this._homeTab || "main";
        if (this._view === "photos") this._loadPhonePhotos();
        break;
      case "p-day":
        this._pDay = d.date;
        break;
      case "list-tab":
        this._listTab = d.tab;
        break;
      case "cam-open":
        this._liveCam = d.entity;
        this._camFull = true;
        this._idleAt = Date.now();
        this._placeCamera();
        return;
      case "p-who": {
        let cur = "";
        try { cur = localStorage.getItem("ww-who") || ""; localStorage.setItem("ww-who", cur === d.name ? "" : d.name); } catch (e) { /* private mode */ }
        break;
      }
      case "p-photo":
        this._sheet = { type: "photo", id: Number(d.id) };
        break;
      case "p-photo-hide":
        fetch(`${this._cfg.photos_api}/photos/${d.id}/hidden`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hidden: d.hidden === "1" }) })
          .then(() => {
            this._sheet = null;
            this._showToast(d.hidden === "1" ? "Hidden from the wall" : "Back on the wall");
            this._loadPhonePhotos();
          });
        return;
      case "p-photo-del":
        if (!this._sheet || !this._sheet.confirm) {
          this._sheet = { ...this._sheet, confirm: true };
          break;
        }
        fetch(`${this._cfg.photos_api}/photos/${d.id}`, { method: "DELETE" }).then(() => {
          this._sheet = null;
          this._showToast("Removed from the wall");
          this._loadPhonePhotos();
        });
        return;
      case "photos-now":
        // Look for new photos first, so one just added from a phone is in the show.
        this._loadPhotos().finally(() => {
          this._saverForced = true;
          this._startSaver();
        });
        return;
      case "cal-mode":
        if (d.mode === this._calMode) return;
        this._calMode = d.mode === "week" ? "week" : "month";
        this._prefs.calMode = this._calMode;
        this._savePrefs();
        if (this._calMode === "week") {
          const inMonth = this._cursor.getFullYear() === now.getFullYear() && this._cursor.getMonth() === now.getMonth();
          this._weekStart = startOfWeek(inMonth ? now : this._cursor);
        } else {
          this._cursor = new Date(this._weekStart.getFullYear(), this._weekStart.getMonth(), 1);
        }
        this._loadEvents();
        break;
      case "prev":
      case "next": {
        const dir = act === "next" ? 1 : -1;
        if (this._calMode === "week") this._weekStart = addDays(this._weekStart, 7 * dir);
        else this._cursor = new Date(this._cursor.getFullYear(), this._cursor.getMonth() + dir, 1);
        if (this._phone()) {
          const inMonth = this._cursor.getFullYear() === now.getFullYear() && this._cursor.getMonth() === now.getMonth();
          this._pDay = inMonth ? isoDay(now) : isoDay(this._cursor);
        }
        this._loadEvents();
        break;
      }
      case "today":
        this._pDay = isoDay(now);
        this._cursor = new Date(now.getFullYear(), now.getMonth(), 1);
        this._weekStart = startOfWeek(now);
        this._loadEvents();
        break;
      case "day":
        this._openDay(d.date);
        return;
      case "add-on":
        this._openAdd(d.date);
        return;
      case "close":
        this._sheet = null;
        break;
      case "settings":
        this._sheet = { type: "settings", tab: "chores" };
        break;
      case "settings-tab":
        this._sheet = { type: "settings", tab: d.tab };
        break;
      case "help":
        this._sheet = { type: "settings", tab: "help" };
        break;
      case "tips-off":
        this._prefs.tips = false;
        this._savePrefs();
        break;
      case "theme-cycle": {
        const cur = this._prefs.theme || "auto";
        this._prefs.theme = cur === "auto" ? "night" : cur === "night" ? "light" : "auto";
        this._savePrefs();
        this._showToast(this._prefs.theme === "auto" ? "Day and evening switch on their own" : this._prefs.theme === "night" ? "Evening look, until you change it" : "Day look, until you change it");
        break;
      }
      case "theme":
        this._prefs.theme = d.theme || "auto";
        this._savePrefs();
        break;
      case "idle-sec":
        this._prefs.idle_seconds = Number(d.sec);
        this._savePrefs();
        break;
      case "photo-sec":
        this._prefs.photo_seconds = Number(d.sec);
        this._savePrefs();
        break;
      case "size-set":
        this._prefs.size = Number(d.size) || 1;
        this._savePrefs();
        break;
      case "sleep-min":
        this._prefs.sleep_minutes = Number(d.min);
        this._savePrefs();
        break;
      case "filter":
        if (this._hidden.has(d.entity)) this._hidden.delete(d.entity);
        else this._hidden.add(d.entity);
        break;
      case "who":
        this._readAddForm();
        if (this._sheet) this._sheet.cal = d.entity;
        break;
      case "all-day":
        this._readAddForm();
        if (this._sheet) this._sheet.allDay = !this._sheet.allDay;
        break;
      case "ev-ask":
        if (this._sheet) this._sheet.confirm = d.ek;
        break;
      case "ev-keep":
        if (this._sheet) this._sheet.confirm = "";
        break;
      case "ev-del":
        this._deleteEvent(d.cal, d.uid, d.rid);
        return;
      case "todo-toggle": {
        const item = (this._todos[d.entity] || []).find((i) => this._todoId(i) === d.uid);
        if (item) this._completeChore(d.entity, item);
        return;
      }
      case "helper-toggle":
        this._toggleHelper(d.helper, d.mode);
        return;
      case "undo-done":
        this._undoDone(d.key);
        return;
      case "shop-toggle": {
        const id = this._cfg.shopping;
        const item = (this._todos[id] || []).find((i) => this._todoId(i) === d.uid);
        if (item) this._toggleShop(id, item);
        return;
      }
      case "shop-clear":
        if (hass && this._cfg.shopping) {
          hass.callService("todo", "remove_completed_items", { entity_id: this._cfg.shopping })
            .catch(() => this._showToast("Couldn't clear the list.", null, "bad"));
        }
        return;
      case "shop-app":
        this._openWalmart({ app: true });
        return;
      case "shop-open":
        this._openWalmart({});
        return;
      case "wm-cart":
        this._walmartCart();
        return;
      case "wm-sent":
        this._toast = null;
        this._renderToast();
        this._markSent();
        return;
      case "wm-link":
        this._sheet = { type: "wm-link", uid: d.uid };
        break;
      case "wm-find":
        this._openWalmart({ query: d.q });
        return;
      case "wm-unlink": {
        const input = this._root.querySelector("[name=wm-url]");
        if (input) input.value = "";
        this._saveWalmartLink();
        return;
      }
      case "staples-forget":
        this._prefs.staples = {};
        this._savePrefs();
        this._showToast("Forgot all linked products");
        break;
      case "cam":
        this._switchCamera(d.entity);
        return;
      case "cam-tap":
        this._camFull = !this._camFull;
        this._idleAt = Date.now();
        this._placeCamera();
        return;
      case "cam-close":
        this._camFull = false;
        this._placeCamera();
        return;
      case "scene":
        t.classList.add("flash");
        t.blur();
        setTimeout(() => t.classList.remove("flash"), 260);
        this._pressScene(d.entity);
        return;
      case "home-tab":
        this._homeTab = d.tab;
        break;
      case "ent-toggle": {
        const tile = t.closest(".tile");
        if (tile) {
          const on = tile.classList.toggle("on");
          if (!on) tile.style.setProperty("--pct", "0%");
        }
        this._toggleEntity(d.entity).catch(() => this._showToast("That didn't respond. Try again.", null, "bad"));
        if (this._sheet && this._sheet.type === "light") setTimeout(() => this._render(), 600);
        return;
      }
      case "light-sheet":
        this._sheet = { type: "light", entity: d.entity, name: d.name };
        break;
      case "set-rgb": {
        const rgb = (d.rgb || "").split(",").map(Number);
        if (rgb.length === 3 && hass) hass.callService("light", "turn_on", { entity_id: d.entity, rgb_color: rgb, brightness: 200 });
        return;
      }
      case "cover":
        if (hass) hass.callService("cover", d.svc, { entity_id: d.entity });
        return;
      case "clim-mode":
        if (hass) hass.callService("climate", "set_hvac_mode", { entity_id: d.entity, hvac_mode: d.mode });
        return;
      case "clim-step": {
        const st = hass && hass.states["climate.garage_thermostat"];
        if (!st) return;
        const a = st.attributes || {};
        const cur = Number(a.temperature);
        if (!Number.isFinite(cur)) return;
        const next = Math.min(Number(a.max_temp) || 90, Math.max(Number(a.min_temp) || 45, cur + (d.dir === "-1" ? -1 : 1)));
        hass.callService("climate", "set_temperature", { entity_id: "climate.garage_thermostat", temperature: next });
        return;
      }
      case "num-step": {
        const st = hass && hass.states[d.entity];
        if (!st) return;
        const a = st.attributes || {};
        const step = Number(a.step) || 1;
        const min = a.min != null ? Number(a.min) : 0;
        const max = a.max != null ? Number(a.max) : 100;
        const next = Math.min(max, Math.max(min, Number(st.state) + (d.dir === "-1" ? -step : step)));
        hass.callService("input_number", "set_value", { entity_id: d.entity, value: next });
        return;
      }
      case "vac":
        this._vacuumCmd(d.cmd);
        return;
      case "set-option":
        if (hass) hass.callService("select", "select_option", { entity_id: d.entity, option: d.option });
        return;
      case "set-fan":
        if (hass) hass.callService("vacuum", "set_fan_speed", { entity_id: "vacuum.roborock_qrevo_pro", fan_speed: d.speed });
        return;
      case "room-all":
        this._roomPower(d.room, d.on === "1");
        return;
      case "room-mood":
        this._roomMood(d.room, d.mood);
        return;
      case "person-up":
      case "person-down": {
        const names = this._cals().map((c) => c.name);
        const i = names.indexOf(d.name);
        const j = act === "person-up" ? i - 1 : i + 1;
        if (i >= 0 && j >= 0 && j < names.length) {
          [names[i], names[j]] = [names[j], names[i]];
          this._prefs.order = names.concat(DEFAULT_ORDER.filter((n) => !names.includes(n)));
          this._savePrefs();
        }
        break;
      }
      case "pref-color":
        this._prefs.colors[d.name] = d.color;
        this._savePrefs();
        break;
      case "mute-toggle":
        this._prefs.muted = !this._muted();
        this._savePrefs();
        this._applyMute();
        break;
      case "chore-new":
        this._sheet = {
          type: "chore", entity: d.entity, fromEntity: d.entity, uid: null, title: "",
          freq: "weekly", days: [now.getDay()], n: 3,
        };
        break;
      case "chore-edit": {
        const item = (this._todos[d.entity] || []).find((i) => i.uid === d.uid || i.summary === d.uid);
        const meta = item ? parseWW(item.description) : null;
        let freq = "once";
        let n = 3;
        let days = [now.getDay()];
        if (meta && meta.freq === "weekly") {
          freq = "weekly";
          days = (meta.days || []).map(Number);
        } else if (meta && meta.freq === "every" && Number(meta.n) === 2) {
          freq = "every2";
          n = 2;
        } else if (meta && (meta.freq === "every" || meta.freq === "daily")) {
          freq = "every";
          n = meta.freq === "daily" ? 1 : Math.max(2, Number(meta.n) || 3);
          if (n === 1) {
            freq = "weekly";
            days = [0, 1, 2, 3, 4, 5, 6];
          }
        }
        this._sheet = {
          type: "chore", entity: d.entity, fromEntity: d.entity, uid: d.uid,
          title: item ? item.summary : "", freq, days, n,
        };
        break;
      }
      case "chore-who":
        this._readChoreForm();
        this._sheet.entity = d.entity;
        break;
      case "chore-freq":
        this._readChoreForm();
        this._sheet.freq = d.freq;
        break;
      case "chore-day": {
        this._readChoreForm();
        const day = Number(d.day);
        const days = new Set((this._sheet.days || []).map(Number));
        if (days.has(day)) days.delete(day);
        else days.add(day);
        this._sheet.days = Array.from(days).sort();
        this._sheet.freq = "weekly";
        break;
      }
      case "chore-del":
        this._deleteChore(d.entity, d.uid).catch(() => this._showToast("Couldn't remove that chore.", null, "bad"));
        return;
      case "meal-ai":
        this._planMeals();
        return;
      case "ai-apply":
        this._applyPlan();
        return;
      case "meal-fav": {
        const idx = (now.getDay() + 6) % 7;
        const k = this._mealFocus || MEAL_KEYS[idx];
        const ent = (this._cfg.meals || {})[k];
        if (!ent) return;
        const box = this._root.querySelector(`[data-k="meal-${k}"]`);
        if (box) box.value = d.v;
        this._setMeal(ent, d.v).catch(() => {});
        this._showToast(`${d.v} on ${WEEKDAYS_LONG[(MEAL_KEYS.indexOf(k) + 1) % 7]}`);
        return;
      }
      case "fav-edit":
        this._sheet = { type: "fav" };
        break;
      case "fav-del": {
        const list = (this._prefs.favorites.length ? this._prefs.favorites : DEFAULT_FAVORITES).filter((f) => f !== d.v);
        this._prefs.favorites = list.length ? list : [];
        this._savePrefs();
        break;
      }
      default:
        return;
    }
    this._render();
  }

  _onSubmit(e) {
    const form = e.target;
    if (!form.dataset || !form.dataset.form) return;
    e.preventDefault();
    const kind = form.dataset.form;
    if (kind === "add") this._saveEvent();
    if (kind === "chore") this._saveChore().catch(() => this._showToast("That chore didn't save. Try again.", null, "bad"));
    if (kind === "wm") this._saveWalmartLink();
    if (kind === "shop") {
      const input = form.querySelector("[name=item]");
      const v = input ? input.value : "";
      if (input) input.value = "";
      this._addTodo(this._cfg.shopping, v);
      if (input) input.focus();
    }
    if (kind === "fav") {
      const input = form.querySelector("[name=fav]");
      const v = (input && input.value ? input.value : "").trim().slice(0, 40);
      if (v) {
        const list = (this._prefs.favorites.length ? this._prefs.favorites : DEFAULT_FAVORITES).slice();
        if (!list.includes(v)) list.push(v);
        this._prefs.favorites = list;
        this._savePrefs();
      }
      if (input) input.value = "";
      this._render();
    }
  }

  _onChange(e) {
    const t = e.target;
    if (t.dataset.photoInput !== undefined && t.files) {
      this._uploadPhotos(t.files);
      t.value = "";
      return;
    }
    if (t.dataset.meal) {
      const v = String(t.value || "").replace(/\s+/g, " ").trim().slice(0, 80);
      this._setMeal(t.dataset.meal, v).catch(() => this._showToast("That dinner didn't save.", null, "bad"));
    }
    if (t.dataset.mealNotes) {
      this._prefs.meal_notes = String(t.value || "").slice(0, 300);
      this._savePrefs();
    }
    if (t.name === "chore-n" && this._sheet && this._sheet.type === "chore") {
      this._sheet.n = Math.max(2, Number(t.value) || 2);
    }
    if (t.name === "chore-title" && this._sheet && this._sheet.type === "chore") {
      this._sheet.title = t.value;
    }
    if (t.dataset.prefColor) {
      this._prefs.colors[t.dataset.prefColor] = t.value;
      this._savePrefs();
      this._render();
    }
    if (t.dataset.prefCal) {
      this._prefs.calEntities[t.dataset.prefCal] = t.value;
      this._savePrefs();
      this._loadEvents();
      this._render();
    }
    if (t.dataset.prefIcloud !== undefined) {
      this._prefs.icloud_album = t.value.trim();
      this._savePrefs();
      this._icloudNote = "Loading…";
      this._loadPhotos().then(() => this._render());
    }
  }

  _onInput(e) {
    const t = e.target;
    const hass = this._hass;
    if (!hass || !t.dataset) return;
    const box = t.closest && t.closest(".tile, .dlg");
    const setPct = (pct, label) => {
      if (!box) return;
      box.style.setProperty("--pct", `${pct}%`);
      const tst = box.querySelector(".tst");
      if (tst && label !== undefined) tst.textContent = label;
    };
    if (t.dataset.bright) {
      const val = Math.max(1, Math.min(255, Number(t.value) || 1));
      const pct = Math.round((val / 255) * 100);
      if (box) box.classList.add("on");
      setPct(pct, `${pct}%`);
      clearTimeout(this._brightT);
      this._brightT = setTimeout(() => {
        hass.callService("light", "turn_on", { entity_id: t.dataset.bright, brightness: val });
      }, 80);
    }
    if (t.dataset.ct) {
      const val = Number(t.value);
      if (box) box.classList.add("on");
      clearTimeout(this._ctT);
      this._ctT = setTimeout(() => {
        hass.callService("light", "turn_on", { entity_id: t.dataset.ct, color_temp_kelvin: val });
      }, 80);
    }
    if (t.dataset.fanPct) {
      const val = Math.max(0, Math.min(100, Number(t.value) || 0));
      if (box) box.classList.toggle("on", val > 0);
      setPct(val, val ? `${val}%` : "Off");
      clearTimeout(this._fanT);
      this._fanT = setTimeout(() => {
        hass.callService("fan", "set_percentage", { entity_id: t.dataset.fanPct, percentage: val });
      }, 80);
    }
    if (t.dataset.num) {
      const val = Number(t.value);
      const min = Number(t.min);
      const max = Number(t.max);
      const tst = box && box.querySelector(".tst");
      setPct(max === min ? 0 : Math.round(((val - min) / (max - min)) * 100), `${Math.round(val)}${tst ? tst.dataset.unit || "" : ""}`);
      clearTimeout(this._numT);
      this._numT = setTimeout(() => {
        hass.callService("input_number", "set_value", { entity_id: t.dataset.num, value: val });
      }, 80);
    }
  }

  _onKey(e) {
    if (e.key !== "Enter") return;
    const t = e.target;
    // Dinner boxes are one line in Home Assistant, so Enter saves.
    if (t.tagName === "TEXTAREA" && t.dataset && t.dataset.meal !== undefined) {
      e.preventDefault();
      t.blur();
    }
  }
}


customElements.define("wrightway-calendar-card", WrightWayCalendarCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "wrightway-calendar-card",
  name: "WrightWay",
  description: "The family kitchen wall: calendar, chores, shopping, meals, home and photos",
  preview: true,
});
