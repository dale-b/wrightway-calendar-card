/**
 * WrightWay Calendar Card — Skylight-style family month calendar for Home Assistant.
 * type: custom:wrightway-calendar-card
 */
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MEAL_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const MEAL_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CSS = `
:host {
  display: block;
  height: 100%;
  min-height: 100vh;
  font-family: "Avenir Next", "Segoe UI", "Nunito", ui-sans-serif, system-ui, sans-serif;
  color: #1c1917;
  --ink: #1c1917;
  --muted: #78716c;
  --line: #e7e5e4;
  --paper: #ffffff;
  --wash: #fafaf9;
  --weekend: #f5f5f4;
  --accent: #ea580c;
  --fab: #2563eb;
}
* { box-sizing: border-box; }
.app {
  display: flex;
  height: 100%;
  min-height: 100vh;
  background: var(--paper);
  overflow: hidden;
}
.rail {
  width: 88px;
  flex-shrink: 0;
  background: #f4f4f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 0 16px;
  gap: 4px;
  border-right: 1px solid var(--line);
}
.logo {
  width: 38px; height: 38px;
  border-radius: 12px;
  background: #1c1917;
  color: #fff;
  font-weight: 700;
  font-size: 20px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.rail-btn {
  width: 72px;
  border: 0;
  background: transparent;
  color: var(--muted);
  padding: 10px 4px 8px;
  border-radius: 14px;
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.rail-btn svg { width: 22px; height: 22px; }
.rail-btn.active { background: #fff; color: var(--ink); box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px 4px 16px;
  gap: 12px;
  flex-shrink: 0;
}
.when {
  font-family: "Iowan Old Style", Palatino, "Palatino Linotype", Georgia, serif;
  font-size: clamp(22px, 2.3vw, 32px);
  font-weight: 600;
  letter-spacing: -0.02em;
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}
.when .time { font-size: 0.72em; font-weight: 500; color: #44403c; }
.wx { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 15px; }
.wx .temp { color: var(--ink); font-weight: 600; }
.tools { display: flex; align-items: center; gap: 8px; }
.tools button, .pill {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 999px;
  padding: 8px 14px;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: var(--ink);
}
.tools button:hover { background: var(--wash); }
.legend { display: flex; gap: 8px; flex-wrap: wrap; padding: 0 16px 6px; flex-shrink: 0; }
.today-box {
  margin: 0 16px 8px;
  background: var(--wash);
  border-radius: 16px;
  padding: 10px 14px 8px;
  flex-shrink: 0;
  max-height: 148px;
  overflow: auto;
}
.today-box h4 {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--muted);
}
.today-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 4px 0;
  font-size: 15px;
}
.today-row .tm {
  flex: 0 0 72px;
  font-weight: 700;
  font-size: 13px;
  color: var(--muted);
}
.today-row .sum { font-weight: 650; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.today-row .who-tag {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  flex-shrink: 0;
}
.today-empty { color: var(--muted); font-size: 14px; padding: 4px 0; }
.tabs { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 12px; }
.tabs button {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 999px;
  padding: 8px 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.tabs button.on { background: #1c1917; color: #fff; border-color: #1c1917; }
.people-row {
  display: grid;
  grid-template-columns: 36px 36px 40px minmax(80px, 1fr) minmax(140px, 1.4fr);
  gap: 8px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
}
.people-row input[type=color] {
  width: 36px; height: 36px; border: 0; padding: 0; background: none; cursor: pointer;
}
.switch {
  display: flex; align-items: center; gap: 10px;
  font-weight: 700; padding: 10px 0;
}
.cam-full {
  position: absolute; inset: 0; z-index: 35;
  background: #000;
}
.cam-full #live-cam-full,
.cam-full ha-camera-stream,
.cam-full video,
.cam-full img {
  width: 100%; height: 100%; object-fit: contain; display: block;
}
.cam-full .hint {
  position: absolute; top: 16px; right: 16px;
  background: rgba(0,0,0,.55); color: #fff;
  font-weight: 700; font-size: 14px;
  padding: 8px 14px; border-radius: 999px;
  pointer-events: none;
}
.chip {
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 6px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  opacity: 1;
  padding: 4px 8px;
  border-radius: 999px;
}
.chip.off { opacity: 0.35; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.banner {
  margin: 0 16px 6px;
  background: #fde8e8;
  color: #9f1239;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}
.grid-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 8px 0 8px;
}
.dow {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  border-top: 1px solid var(--line);
}
.dow div {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 0 3px;
  border-left: 1px solid var(--line);
}
.dow div:first-child { border-left: 0; }
.days {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  grid-template-rows: repeat(6, minmax(0, 1fr));
  border-top: 1px solid var(--line);
}
.day {
  min-height: 0;
  overflow: hidden;
  border-left: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 3px 5px 2px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  background: #fff;
}
.day:nth-child(7n+1) { border-left: 0; }
.day.weekend { background: var(--weekend); }
.day.other { background: #fcfcfb; }
.day.other .num { color: #a8a29e; }
.day-head {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2px;
  flex-shrink: 0;
}
.num {
  font-size: 13px;
  font-weight: 600;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink);
}
.day.today .num {
  background: var(--accent);
  color: #fff;
  border-radius: 50%;
}
.evs { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
.ev {
  border-radius: 6px;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 650;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1c1917;
}
.more { font-size: 11px; font-weight: 700; color: var(--muted); padding: 1px 4px; }
.pane { flex: 1; min-height: 0; overflow: auto; padding: 8px 28px 28px; }
h2 { font-size: 22px; margin: 8px 0 14px; }
.todo { list-style: none; margin: 0; padding: 0; }
.todo li {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
  font-size: 16px;
}
.todo input[type=checkbox] { width: 18px; height: 18px; }
.todo .done { text-decoration: line-through; color: var(--muted); }
.add-row { display: flex; gap: 8px; margin-top: 12px; }
.add-row input, .dlg input, .dlg select {
  flex: 1;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px;
  font: inherit;
  font-size: 16px;
}
.add-row button, .dlg .save {
  background: var(--fab);
  color: #fff;
  border: 0;
  border-radius: 12px;
  padding: 10px 16px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.chore-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}
.chore-col {
  background: var(--wash);
  border-radius: 18px;
  padding: 14px;
}
.chore-grid .chore-col { min-height: 200px; }
.chore-col h3 { margin: 0 0 10px; font-size: 16px; display: flex; align-items: center; gap: 8px; }
.meals {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}
.meal {
  background: var(--wash);
  border-radius: 16px;
  padding: 12px;
}
.meal.today { background: #ffedd5; }
.meal label { display: block; font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
.meal input { width: 100%; border: 0; background: transparent; font: inherit; font-size: 16px; font-weight: 600; }
.fab {
  position: absolute;
  right: 28px;
  bottom: 24px;
  width: 56px; height: 56px;
  border-radius: 50%;
  background: var(--fab);
  color: #fff;
  border: 0;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(37,99,235,.35);
}
.app.home .fab { display: none; }
.overlay {
  position: absolute; inset: 0;
  background: rgba(28,25,23,.28);
  display: flex; align-items: center; justify-content: center;
  z-index: 20;
  padding: 24px;
}
.dlg {
  background: #fff;
  width: min(420px, 92vw);
  max-height: 80vh;
  overflow: auto;
  border-radius: 24px;
  padding: 22px 22px 18px;
  box-shadow: 0 24px 60px rgba(0,0,0,.18);
}
.dlg h3 { margin: 0 0 4px; font-size: 26px; font-weight: 650; }
.dlg .sub { color: var(--muted); margin-bottom: 14px; font-size: 14px; }
.dlg-ev {
  border-radius: 14px;
  padding: 10px 12px;
  margin-bottom: 8px;
}
.dlg-ev .t { font-weight: 700; }
.dlg-ev .m { font-size: 13px; color: #44403c; margin-top: 2px; }
.who { display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0; }
.who button {
  border: 2px solid transparent;
  border-radius: 999px;
  padding: 6px 12px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.who button.on { border-color: #1c1917; }
.dlg .row { display: flex; gap: 8px; margin: 8px 0; }
.dlg .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
.dlg .ghost { background: transparent; border: 0; font: inherit; font-weight: 600; cursor: pointer; color: var(--muted); }
.gear {
  width: 40px; height: 40px; padding: 0 !important;
  display: flex; align-items: center; justify-content: center;
}
.gear svg { width: 20px; height: 20px; }
.stage { flex: 1; min-height: 0; display: flex; }
.cal-col { flex: 1.15; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
.chore-wrap {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--line);
  background: #fafaf9;
  max-height: min(32vh, calc(var(--chore-rows, 1) * 46px + 58px));
}
.chore-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px 4px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--muted);
  flex-shrink: 0;
}
.chore-head button {
  border: 0; background: transparent; color: var(--muted);
  cursor: pointer; padding: 4px; display: flex; align-items: center;
}
.chore-head button svg { width: 18px; height: 18px; }
.chore-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  padding: 0 16px 8px;
  overflow: auto;
}
.chore-person { min-width: 0; }
.chore-person .who {
  font-size: 11px; font-weight: 800; letter-spacing: .06em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 4px;
  display: flex; align-items: center; gap: 6px;
}
.chore-person .todo li {
  font-size: 14px;
  padding: 7px 10px;
  gap: 8px;
  border-bottom: 0;
  background: #fff;
  border-radius: 10px;
  margin-bottom: 6px;
  min-height: 40px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.chore-person .todo li:active { background: #ecfdf5; }
.chore-person .todo input[type=checkbox] { width: 18px; height: 18px; flex-shrink: 0; pointer-events: none; }
.chore-person .todo li.late span { color: #c2410c; }
.chore-empty { color: var(--muted); font-size: 13px; padding: 6px 0; }
.dlg.wide { width: min(720px, 94vw); }
.freq { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
.freq button, .daysel button {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 999px;
  padding: 8px 12px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.freq button.on, .daysel button.on {
  background: #1c1917;
  color: #fff;
  border-color: #1c1917;
}
.daysel { display: flex; gap: 6px; flex-wrap: wrap; margin: 8px 0; }
.daysel button { width: 40px; padding: 8px 0; }
.n-row { display: flex; align-items: center; gap: 8px; margin: 8px 0; font-size: 15px; }
.n-row input { width: 72px; flex: none; }
.setup { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.setup .person-block { background: var(--wash); border-radius: 16px; padding: 12px; }
.setup h4 { margin: 0 0 8px; font-size: 15px; display: flex; align-items: center; gap: 8px; }
.chore-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 0; border-bottom: 1px solid var(--line); font-size: 14px;
}
.chore-row .grow { flex: 1; min-width: 0; }
.chore-row .meta { font-size: 12px; color: var(--muted); }
.chore-row .tiny {
  border: 0; background: transparent; color: var(--muted);
  font: inherit; font-weight: 700; cursor: pointer; padding: 4px 6px;
}
.chore-row .tiny.danger { color: #9f1239; }
.add-chore {
  margin-top: 8px; border: 1px dashed var(--line); background: #fff;
  border-radius: 10px; padding: 8px 10px; font: inherit; font-weight: 700;
  cursor: pointer; width: 100%; color: var(--ink);
}
.dock {
  width: 300px;
  flex-shrink: 0;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 16px 8px 8px;
  transition: width .25s ease;
}
.cam-box {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #111;
  aspect-ratio: 16/9;
  flex-shrink: 0;
  cursor: pointer;
}
.cam-box img, .cam-box ha-camera-stream, .cam-box video {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.cam-tag {
  position: absolute; left: 10px; bottom: 10px;
  background: rgba(0,0,0,.55); color: #fff;
  font-size: 12px; font-weight: 700;
  padding: 4px 8px; border-radius: 999px;
}
.cam-alert {
  display: none;
  position: absolute; inset: 0;
  align-items: flex-start; justify-content: center;
  padding-top: 10px;
  pointer-events: none;
}
.cam-alert.on { display: flex; }
.cam-alert span {
  background: #ea580c; color: #fff; font-weight: 800; font-size: 13px;
  padding: 4px 10px; border-radius: 999px;
}
.thumbs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.thumbs button {
  position: relative;
  border: 2px solid transparent; padding: 0; border-radius: 10px; overflow: hidden;
  aspect-ratio: 16/10; cursor: pointer; background: #ddd;
  -webkit-tap-highlight-color: transparent;
}
.thumbs button.on { border-color: #1c1917; }
.thumbs img { width: 100%; height: 100%; object-fit: cover; display: block; }
.thumbs .lbl {
  position: absolute; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,.55); color: #fff;
  font-size: 10px; font-weight: 800; padding: 2px 4px; text-align: center;
}
.scenes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.scenes button {
  border: 0;
  border-radius: 16px;
  min-height: 64px;
  padding: 10px 8px;
  font: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  color: #1c1917;
  -webkit-tap-highlight-color: transparent;
}
.scenes button:focus { outline: none; }
.scenes button:active, .scenes button.flash { filter: brightness(0.92); transform: scale(0.98); }
.shop {
  flex: 1; min-height: 0; display: grid;
  grid-template-columns: minmax(340px, 1fr) minmax(280px, 1fr);
  gap: 16px; padding: 8px 20px 20px;
}
.shop-side h2 { margin-top: 0; }
.shop-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.shop-actions button {
  border: 1px solid var(--line); background: #fff; border-radius: 12px;
  padding: 14px 12px; font: inherit; font-weight: 700; cursor: pointer;
  font-size: 16px; min-height: 48px;
}
.shop-actions .primary { background: var(--fab); color: #fff; border: 0; }
.shop-note { font-size: 13px; color: var(--muted); margin-top: 8px; line-height: 1.35; }
.shop-main { display: flex; flex-direction: column; gap: 12px; }
.shop-tile {
  flex: 1; min-height: 120px;
  border: 0; border-radius: 18px;
  background: #0053e2; color: #fff;
  font: inherit; font-size: 22px; font-weight: 800;
  cursor: pointer; padding: 20px;
  display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start;
  gap: 6px; text-align: left;
}
.shop-tile span { font-size: 14px; font-weight: 600; opacity: .9; }
.shop-tile.web { background: #0f172a; }
.shop input[data-shop-search] {
  font-size: 20px; padding: 14px 14px; min-height: 52px;
}
.show {
  position: absolute; inset: 0; z-index: 40;
  background: #111;
}
.show img { width: 100%; height: 100%; object-fit: cover; }
.show-meta {
  position: absolute; left: 28px; bottom: 28px; color: #fff;
  text-shadow: 0 2px 12px rgba(0,0,0,.5);
  font-family: Palatino, Georgia, serif;
  font-size: 42px;
}
`;

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pad(n) { return String(n).padStart(2, "0"); }

function isoDay(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

function eventDayKey(ev) {
  const s = ev.start || {};
  if (s.date) return s.date;
  if (s.dateTime) return s.dateTime.slice(0, 10);
  return "";
}

function eventTimeLabel(ev) {
  const s = ev.start || {};
  if (s.date) return "All day";
  if (!s.dateTime) return "";
  const d = new Date(s.dateTime);
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return m ? `${h}:${pad(m)} ${ap}` : `${h} ${ap}`;
}

function contrastInk(hex) {
  const c = hex.replace("#", "");
  if (c.length < 6) return "#1c1917";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const y = (r * 299 + g * 587 + b * 114) / 1000;
  return y < 150 ? "#fff" : "#1c1917";
}

function weatherLabel(state) {
  return (state || "").replace(/-/g, " ");
}

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

/* Decorative home stills until family photos are configured. Not your family. */
const PLACEHOLDER_PHOTOS = [
  "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1920&q=80",
];

const ICONS = {
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  lists: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  tasks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 13l4 4L19 7"/></svg>',
  meals: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 3v8a4 4 0 008 0V3M8 3v18M16 8v13M16 8s3-1 3-4-3-3-3-3"/></svg>',
  shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 7h15l-1.5 9h-12L5 4H2"/><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"/></svg>',
};

class WrightWayCalendarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._cfg = {};
    this._view = "calendar";
    this._cursor = new Date();
    this._cursor.setDate(1);
    this._events = [];
    this._hidden = new Set();
    this._todos = {};
    this._sheet = null;
    this._now = new Date();
    this._timer = null;
    this._fetching = false;
    this._idleAt = Date.now();
    this._slideOn = false;
    this._slideIdx = 0;
    this._homeCam = null;
    this._liveCam = null;
    this._helperSnap = "";
    this._helperOverride = {};
    this._camFull = false;
    this._prefs = { muted: true, order: DEFAULT_ORDER.slice(), colors: {}, calEntities: {} };
    this._loadPrefs();
  }

  setConfig(config) {
    this._cfg = config || {};
    if (config && config.camera) this._homeCam = config.camera;
    if (!this._liveCam) this._liveCam = (config && config.camera) || null;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._timer) {
      this._timer = setInterval(() => {
        this._now = new Date();
        this._tickClock();
        this._tickIdle();
        this._tickAlert();
        this._tickHelpers();
        this._applyMute();
      }, 1000);
      this._loadEvents();
      this._loadTodos();
      this._render();
    }
  }

  get hass() { return this._hass; }

  getCardSize() { return 16; }

  getGridOptions() {
    return { columns: "full", rows: 8, min_rows: 6 };
  }

  connectedCallback() {
    if (!this._bound) {
      this._bound = true;
      this.shadowRoot.addEventListener("click", (e) => {
        this._idleAt = Date.now();
        if (this._slideOn) {
          this._slideOn = false;
          this._tickIdle();
          if (!e.target.closest("[data-act]")) return;
        }
        this._onClick(e);
      });
      this.shadowRoot.addEventListener("pointerdown", () => { this._idleAt = Date.now(); });
      this.shadowRoot.addEventListener("pointerup", (e) => {
        const input = e.target.closest("input:not([type=checkbox]), textarea");
        if (input && typeof input.focus === "function") input.focus();
      });
      this.shadowRoot.addEventListener("submit", (e) => {
        if (e.target.dataset && e.target.dataset.form) this._onSubmit(e);
      });
      this.shadowRoot.addEventListener("change", (e) => this._onChange(e));
      this.shadowRoot.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        if (e.target.dataset && e.target.dataset.todoInput) {
          this._addTodo(e.target.dataset.todoInput, e.target.value);
        }
        if (e.target.matches("[data-shop-search]")) {
          this._addTodo(this._cfg.shopping, e.target.value);
          e.target.value = "";
        }
      });
    }
    this._render();
  }

  disconnectedCallback() {
    if (this._timer) clearInterval(this._timer);
    if (this._slideTimer) clearInterval(this._slideTimer);
  }

  _loadPrefs() {
    try {
      const raw = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") || {};
      this._prefs = {
        muted: raw.muted !== false,
        order: Array.isArray(raw.order) && raw.order.length ? raw.order : DEFAULT_ORDER.slice(),
        colors: raw.colors || {},
        calEntities: raw.calEntities || {},
      };
    } catch (e) {
      this._prefs = { muted: true, order: DEFAULT_ORDER.slice(), colors: {}, calEntities: {} };
    }
  }

  _savePrefs() {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(this._prefs)); } catch (e) { /* kiosk may block */ }
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
    if (this._helperOverride && this._helperOverride[id]) return this._helperOverride[id];
    const st = this._hass && this._hass.states[id];
    return st ? st.state : "";
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
    const sig = this._helperSig();
    if (sig === this._helperSnap) return;
    this._helperSnap = sig;
    const wrap = this.shadowRoot.querySelector(".chore-wrap");
    if (!wrap || this._view !== "calendar") return;
    const tmp = document.createElement("div");
    tmp.innerHTML = this._renderChoreBar();
    const next = tmp.firstElementChild;
    if (next) wrap.replaceWith(next);
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
    const listed = this._cfg.photos;
    if (Array.isArray(listed) && listed.length) return listed;
    return PLACEHOLDER_PHOTOS;
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

  _tickClock() {
    const el = this.shadowRoot.querySelector(".time");
    if (!el) return;
    const n = this._now;
    let h = n.getHours();
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    el.textContent = `${h}:${pad(n.getMinutes())} ${ap}`;
    const show = this.shadowRoot.querySelector(".show-meta");
    if (show) {
      show.textContent = `${n.toLocaleDateString("en-US", { weekday: "long" })}  ${h}:${pad(n.getMinutes())} ${ap}`;
    }
  }

  _tickAlert() {
    const badge = this.shadowRoot.querySelector(".cam-alert");
    if (badge) badge.classList.toggle("on", this._alertOn());
  }

  _tickIdle() {
    if (this._camFull) return;
    const sec = Number(this._cfg.idle_seconds);
    const wait = Number.isFinite(sec) ? sec : 90;
    if (wait <= 0) return;
    const due = Date.now() - this._idleAt > wait * 1000;
    const overlay = this.shadowRoot.getElementById("slideshow");
    if (!overlay) return;
    if (due && !this._slideOn) {
      this._slideOn = true;
      this._advanceSlide();
      if (this._slideTimer) clearInterval(this._slideTimer);
      this._slideTimer = setInterval(() => this._advanceSlide(), 12000);
    }
    if (!due && this._slideOn) {
      this._slideOn = false;
      if (this._slideTimer) clearInterval(this._slideTimer);
    }
    overlay.hidden = !this._slideOn;
  }

  _advanceSlide() {
    const photos = this._photos();
    const img = this.shadowRoot.getElementById("slide-img");
    if (!img) return;
    if (!photos.length) {
      img.src = PLACEHOLDER_PHOTOS[0];
      return;
    }
    this._slideIdx = (this._slideIdx + 1) % photos.length;
    img.src = photos[this._slideIdx];
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

  _mountCamera() {
    const hostId = this._camFull ? "live-cam-full" : "live-cam";
    const host = this.shadowRoot.getElementById(hostId);
    const id = this._liveCam || this._homeCam || this._cfg.camera;
    if (!host || !this._hass || !id) return;
    if (host.dataset.mounted === id && host.firstElementChild) {
      this._applyMute();
      return;
    }
    const st = this._hass.states[id];
    if (!st) return;
    host.innerHTML = "";
    host.dataset.mounted = id;
    if (customElements.get("ha-camera-stream")) {
      const el = document.createElement("ha-camera-stream");
      el.hass = this._hass;
      el.stateObj = st;
      el.muted = this._muted();
      el.style.width = "100%";
      el.style.height = "100%";
      el.style.objectFit = this._camFull ? "contain" : "cover";
      host.appendChild(el);
    } else if (st.attributes.entity_picture) {
      const img = document.createElement("img");
      img.alt = this._cameraLabel(id);
      const tick = () => {
        const cur = this._hass.states[id];
        if (!cur || !cur.attributes.entity_picture) return;
        img.src = this._hass.hassUrl(cur.attributes.entity_picture) + "&t=" + Date.now();
      };
      tick();
      if (this._snapTimer) clearInterval(this._snapTimer);
      this._snapTimer = setInterval(tick, 2500);
      host.appendChild(img);
    }
    this._applyMute();
  }

  _switchCamera(entity) {
    this._liveCam = entity || this._homeCam || this._cfg.camera;
    const host = this.shadowRoot.getElementById("live-cam");
    if (host) host.dataset.mounted = "";
    this._mountCamera();
    const tag = this.shadowRoot.querySelector(".cam-tag");
    if (tag) tag.textContent = this._cameraLabel(this._liveCam);
    this.shadowRoot.querySelectorAll(".thumbs button").forEach((btn) => {
      btn.classList.toggle("on", btn.dataset.entity === this._liveCam);
    });
  }

  async _pressScene(entity) {
    if (!entity || !this._hass) return;
    await this._hass.callService("input_button", "press", { entity_id: entity });
  }

  _sceneColor(scene) {
    if (scene && scene.color) return scene.color;
    const name = String((scene && scene.name) || "").toLowerCase();
    if (name.includes("cook")) return "#fdba74";
    if (name.includes("din")) return "#fde68a";
    if (name.includes("even")) return "#c4b5fd";
    if (name.includes("off") || name.includes("light")) return "#e7e5e4";
    return "#e2e8f0";
  }

  _openWalmart({ app = false, query = "" } = {}) {
    const q = (query || "").trim();
    const url = q
      ? `https://www.walmart.com/search?q=${encodeURIComponent(q)}`
      : (this._cfg.walmart || "https://www.walmart.com/shop");
    const pkg = this._cfg.walmart_app || "com.walmart.android";
    const fully = window.fully;
    if (app && fully && typeof fully.startApplication === "function") {
      try {
        fully.startApplication(pkg);
        return;
      } catch (e) { /* fall through */ }
    }
    window.open(url, "_blank", "noopener");
  }

  async _loadEvents() {
    if (!this._hass || this._fetching) return;
    const cals = this._cals();
    if (!cals.length) return;
    this._fetching = true;
    const y = this._cursor.getFullYear();
    const m = this._cursor.getMonth();
    const start = startOfMonthGrid(y, m);
    const end = new Date(start);
    end.setDate(start.getDate() + 42);
    const startIso = start.toISOString();
    const endIso = end.toISOString();
    try {
      const batches = await Promise.all(
        cals.map(async (c) => {
          try {
            const rows = await this._hass.callApi(
              "GET",
              `calendars/${c.entity}?start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`
            );
            return (rows || []).map((ev) => ({ ...ev, _cal: c.entity, _color: c.color, _name: c.name }));
          } catch (e) {
            return [];
          }
        })
      );
      this._events = batches.flat();
    } finally {
      this._fetching = false;
      this._render();
    }
  }

  async _loadTodos() {
    if (!this._hass) return;
    const ids = [
      this._cfg.shopping,
      ...this._chores().map((c) => c.entity),
    ].filter(Boolean);
    for (const id of ids) {
      try {
        const res = await this._hass.connection.sendMessagePromise({
          type: "todo/item/list",
          entity_id: id,
        });
        this._todos[id] = res.items || [];
      } catch (e) {
        this._todos[id] = [];
      }
    }
    this._render();
  }

  _eventsOn(dayKey) {
    return this._events.filter((ev) => {
      if (this._hidden.has(ev._cal)) return false;
      const s = ev.start || {};
      const e = ev.end || {};
      const start = s.date || (s.dateTime || "").slice(0, 10);
      let end = e.date || (e.dateTime || "").slice(0, 10);
      if (s.date && e.date && end > start) {
        // all-day end is exclusive
        const ed = new Date(end + "T12:00:00");
        ed.setDate(ed.getDate() - 1);
        end = isoDay(ed);
      }
      return start && dayKey >= start && dayKey <= (end || start);
    });
  }

  _openDay(date) {
    this._sheet = { type: "day", date };
    this._render();
  }

  _openAdd(date) {
    const cals = this._cals();
    this._sheet = {
      type: "add",
      date: date || new Date(),
      cal: cals[0] && cals[0].entity,
      title: "",
      allDay: true,
    };
    this._render();
  }

  async _saveEvent() {
    const s = this._sheet;
    if (!s || !s.title || !this._hass) return;
    const day = isoDay(s.date);
    const data = { entity_id: s.cal, summary: s.title.trim() };
    if (s.allDay) {
      data.start_date = day;
      const n = new Date(s.date);
      n.setDate(n.getDate() + 1);
      data.end_date = isoDay(n);
    } else {
      data.start_date_time = `${day}T09:00:00`;
      data.end_date_time = `${day}T10:00:00`;
    }
    await this._hass.callService("calendar", "create_event", data);
    this._sheet = null;
    await this._loadEvents();
  }

  _todoId(item) {
    return item.uid || item.summary;
  }

  async _addTodo(entity, text) {
    const item = (text || "").trim();
    if (!item || !this._hass) return;
    await this._hass.callService("todo", "add_item", { entity_id: entity, item });
    await this._loadTodos();
  }

  async _toggleTodo(entity, item) {
    const list = this._todos[entity] || [];
    const meta = parseWW(item.description);
    const today = isoDay(this._now);
    if (meta && item.status !== "completed") {
      const due = itemDueDay(item) || today;
      const next = nextDueDate(meta, due, today);
      this._todos[entity] = list.map((it) => (
        (it.uid === item.uid || it.summary === item.summary)
          ? { ...it, due: { date: next } }
          : it
      ));
      this._render();
      try {
        await this._hass.callService("todo", "update_item", {
          entity_id: entity,
          item: this._todoId(item),
          status: "needs_action",
          due_date: next,
        });
      } catch (e) { /* reload will restore */ }
      await this._loadTodos();
      return;
    }
    const next = item.status === "completed" ? "needs_action" : "completed";
    this._todos[entity] = list.map((it) => (
      (it.uid === item.uid || it.summary === item.summary)
        ? { ...it, status: next }
        : it
    ));
    this._render();
    try {
      await this._hass.callService("todo", "update_item", {
        entity_id: entity,
        item: this._todoId(item),
        status: next,
      });
    } catch (e) { /* reload will restore */ }
    await this._loadTodos();
  }

  async _toggleHelper(helper, mode) {
    if (!helper || !this._hass) return;
    const service = (mode || "done") === "due" ? "turn_off" : "turn_on";
    this._helperOverride = { ...(this._helperOverride || {}), [helper]: service === "turn_on" ? "on" : "off" };
    this._tickHelpers();
    await this._hass.callService("input_boolean", service, { entity_id: helper });
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

  _onClick(e) {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    // Backdrop has data-act=close. Ignore that when the click started inside the dialog.
    if (t.classList.contains("overlay") && e.target !== t) return;
    const act = t.dataset.act;
    if (act === "view") this._view = t.dataset.view;
    if (act === "prev") {
      this._cursor = new Date(this._cursor.getFullYear(), this._cursor.getMonth() - 1, 1);
      this._loadEvents();
    }
    if (act === "next") {
      this._cursor = new Date(this._cursor.getFullYear(), this._cursor.getMonth() + 1, 1);
      this._loadEvents();
    }
    if (act === "today") {
      this._cursor = new Date();
      this._cursor.setDate(1);
      this._loadEvents();
    }
    if (act === "day") this._openDay(new Date(t.dataset.date + "T12:00:00"));
    if (act === "add") this._openAdd(this._sheet && this._sheet.date ? this._sheet.date : new Date());
    if (act === "close") this._sheet = null;
    if (act === "settings") this._sheet = { type: "settings", tab: (this._sheet && this._sheet.tab) || "chores" };
    if (act === "settings-tab") this._sheet = { type: "settings", tab: t.dataset.tab };
    if (act === "person-up" || act === "person-down") {
      const names = this._cals().map((c) => c.name);
      const i = names.indexOf(t.dataset.name);
      const j = act === "person-up" ? i - 1 : i + 1;
      if (i >= 0 && j >= 0 && j < names.length) {
        const swap = names[i];
        names[i] = names[j];
        names[j] = swap;
        this._prefs.order = names.concat(DEFAULT_ORDER.filter((n) => !names.includes(n)));
        this._savePrefs();
      }
    }
    if (act === "cam-full") {
      this._camFull = true;
      this._idleAt = Date.now();
    }
    if (act === "cam-close") {
      this._camFull = false;
    }
    if (act === "mute-toggle") {
      this._prefs.muted = !this._muted();
      this._savePrefs();
      this._applyMute();
    }
    if (act === "chore-new") {
      this._sheet = {
        type: "chore",
        entity: t.dataset.entity,
        fromEntity: t.dataset.entity,
        uid: null,
        title: "",
        freq: "weekly",
        days: [this._now.getDay()],
        n: 3,
      };
    }
    if (act === "chore-edit") {
      const list = this._todos[t.dataset.entity] || [];
      const item = list.find((i) => i.uid === t.dataset.uid || i.summary === t.dataset.uid);
      const meta = item ? parseWW(item.description) : null;
      let freq = "once";
      let n = 3;
      let days = [this._now.getDay()];
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
        type: "chore",
        entity: t.dataset.entity,
        fromEntity: t.dataset.entity,
        uid: t.dataset.uid,
        title: item ? item.summary : "",
        freq,
        days,
        n,
      };
    }
    if (act === "chore-who" && this._sheet) {
      this._readChoreForm();
      this._sheet.entity = t.dataset.entity;
    }
    if (act === "chore-freq" && this._sheet) {
      this._readChoreForm();
      this._sheet.freq = t.dataset.freq;
    }
    if (act === "chore-day" && this._sheet) {
      this._readChoreForm();
      const day = Number(t.dataset.day);
      const days = new Set((this._sheet.days || []).map(Number));
      if (days.has(day)) days.delete(day);
      else days.add(day);
      this._sheet.days = Array.from(days).sort();
      this._sheet.freq = "weekly";
    }
    if (act === "chore-save") {
      this._saveChore();
      return;
    }
    if (act === "chore-del") {
      this._deleteChore(t.dataset.entity, t.dataset.uid);
      return;
    }
    if (act === "filter") {
      const id = t.dataset.entity;
      if (this._hidden.has(id)) this._hidden.delete(id);
      else this._hidden.add(id);
    }
    if (act === "who") this._sheet.cal = t.dataset.entity;
    if (act === "save") {
      this._saveEvent();
      return;
    }
    if (act === "todo-add") {
      const input = this.shadowRoot.querySelector(`[data-todo-input="${t.dataset.entity}"]`);
      this._addTodo(t.dataset.entity, input && input.value);
      return;
    }
    if (act === "todo-toggle") {
      const list = this._todos[t.dataset.entity] || [];
      const item = list.find((i) => i.uid === t.dataset.uid || i.summary === t.dataset.uid);
      if (item) this._toggleTodo(t.dataset.entity, item);
      return;
    }
    if (act === "helper-toggle") {
      this._toggleHelper(t.dataset.helper, t.dataset.mode);
      return;
    }
    if (act === "scene") {
      t.classList.add("flash");
      t.blur();
      setTimeout(() => t.classList.remove("flash"), 220);
      this._pressScene(t.dataset.entity);
      return;
    }
    if (act === "cam") {
      this._switchCamera(t.dataset.entity);
      return;
    }
    if (act === "cam-home") {
      this._switchCamera(this._homeCam || this._cfg.camera);
      return;
    }
    if (act === "shop-add") {
      const input = this.shadowRoot.querySelector("[data-shop-search]");
      const q = input && input.value;
      this._addTodo(this._cfg.shopping, q);
      if (input) input.value = "";
      return;
    }
    if (act === "shop-type") {
      const q = window.prompt("Add to the grocery list");
      if (q) this._addTodo(this._cfg.shopping, q);
      return;
    }
    if (act === "shop-open") {
      const input = this.shadowRoot.querySelector("[data-shop-search]");
      this._openWalmart({ query: input && input.value });
      return;
    }
    if (act === "shop-app") {
      this._openWalmart({ app: true });
      return;
    }
    this._render();
  }

  _onSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (form.dataset.form === "add") {
      const title = form.querySelector("[name=title]").value;
      this._sheet.title = title;
      this._sheet.allDay = form.querySelector("[name=allday]").checked;
      this._saveEvent();
    }
    if (form.dataset.form === "chore") {
      this._saveChore();
    }
  }

  _onChange(e) {
    const t = e.target;
    if (t.dataset.meal) {
      this._setMeal(t.dataset.meal, t.value);
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
    if (t.dataset.prefMute) {
      this._prefs.muted = t.checked;
      this._savePrefs();
      this._applyMute();
    }
  }

  _renderHeader() {
    const n = this._now;
    let h = n.getHours();
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const time = `${h}:${pad(n.getMinutes())} ${ap}`;
    const dateStr = `${n.toLocaleDateString("en-US", { weekday: "short" })}, ${MONTHS[n.getMonth()].slice(0, 3)} ${n.getDate()}`;
    const wx = this._weather();
    const temp = wx && wx.attributes && wx.attributes.temperature != null
      ? `${Math.round(wx.attributes.temperature)}°`
      : "";
    const cond = wx ? weatherLabel(wx.state) : "";
    return `
      <div class="top">
        <div class="when">
          <span>${esc(dateStr)}</span>
          <span class="time">${esc(time)}</span>
        </div>
        <div class="wx"><span class="temp">${esc(temp)}</span><span>${esc(cond)}</span></div>
        <div class="tools">
          <button data-act="prev" title="Previous">‹</button>
          <button data-act="today">Today</button>
          <button data-act="next" title="Next">›</button>
          <button class="gear" data-act="settings" title="Settings">${ICONS.gear}</button>
        </div>
      </div>`;
  }

  _todayEvents() {
    const key = isoDay(this._now);
    return this._eventsOn(key).slice().sort((a, b) => {
      const ta = eventTimeLabel(a);
      const tb = eventTimeLabel(b);
      if (ta === "All day" && tb !== "All day") return -1;
      if (tb === "All day" && ta !== "All day") return 1;
      const sa = a.start && a.start.dateTime ? a.start.dateTime : ta;
      const sb = b.start && b.start.dateTime ? b.start.dateTime : tb;
      return String(sa).localeCompare(String(sb));
    });
  }

  _renderToday() {
    const evs = this._todayEvents();
    return `<div class="today-box">
      <h4>Today</h4>
      ${evs.length ? evs.map((ev) => `
        <div class="today-row">
          <span class="tm">${esc(eventTimeLabel(ev))}</span>
          <span class="sum" style="color:${esc(ev._color)}">${esc(ev.summary || "Event")}</span>
          <span class="who-tag">${esc(ev._name || "")}</span>
        </div>`).join("") : `<div class="today-empty">Nothing on the calendar today</div>`}
    </div>`;
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

  _renderLegend() {
    return `<div class="legend">${this._cals().map((c) => `
      <button class="chip ${this._hidden.has(c.entity) ? "off" : ""}" data-act="filter" data-entity="${esc(c.entity)}">
        <span class="dot" style="background:${esc(c.color)}"></span>${esc(c.name)}
      </button>`).join("")}</div>`;
  }

  _renderMonth() {
    const y = this._cursor.getFullYear();
    const m = this._cursor.getMonth();
    const start = startOfMonthGrid(y, m);
    const todayKey = isoDay(this._now);
    const cells = [];
    for (let i = 0; i < 42; i += 1) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = isoDay(d);
      const other = d.getMonth() !== m;
      const weekend = d.getDay() === 0 || d.getDay() === 6;
      const today = key === todayKey;
      const evs = this._eventsOn(key);
      const max = 1;
      const show = evs.slice(0, max);
      const extra = evs.length > max ? evs.length - max : 0;
      cells.push(`
        <div class="day ${other ? "other" : ""} ${weekend ? "weekend" : ""} ${today ? "today" : ""}" data-act="day" data-date="${key}">
          <div class="day-head"><span class="num">${d.getDate()}</span></div>
          <div class="evs">
            ${show.map((ev) => `
              <div class="ev" style="background:${esc(ev._color)};color:${contrastInk(ev._color)}">
                ${esc(eventTimeLabel(ev))} ${esc(ev.summary || "")}
              </div>`).join("")}
            ${extra ? `<div class="more">${extra} more</div>` : ""}
          </div>
        </div>`);
    }
    return `
      <div class="stage">
        <div class="cal-col">
          ${this._renderLegend()}
          ${this._renderToday()}
          <div class="grid-wrap">
            <div class="dow">${WEEKDAYS.map((w) => `<div>${w}</div>`).join("")}</div>
            <div class="days">${cells.join("")}</div>
          </div>
        </div>
        ${this._renderDock()}
      </div>`;
  }

  _renderDock() {
    const cams = this._cameraList();
    const scenes = this._cfg.scenes || [];
    const live = this._liveCam || this._homeCam || this._cfg.camera;
    return `
      <aside class="dock">
        <div class="cam-box" data-act="cam-full" title="Open camera full screen">
          <div id="live-cam"></div>
          <div class="cam-tag">${esc(this._cameraLabel(live))}</div>
          <div class="cam-alert ${this._alertOn() ? "on" : ""}"><span>Car in the driveway</span></div>
        </div>
        ${cams.length ? `<div class="thumbs">${cams.map((c) => {
          const st = this._hass && this._hass.states[c.entity];
          const pic = st && st.attributes && st.attributes.entity_picture
            ? this._hass.hassUrl(st.attributes.entity_picture)
            : "";
          return `<button class="${c.entity === live ? "on" : ""}" data-act="cam" data-entity="${esc(c.entity)}" title="${esc(c.name)}">
            ${pic ? `<img src="${esc(pic)}" alt="">` : ""}
            <span class="lbl">${esc(c.name)}</span>
          </button>`;
        }).join("")}</div>` : ""}
        ${scenes.length ? `<div class="scenes">${scenes.map((s) =>
          `<button type="button" data-act="scene" data-entity="${esc(s.entity)}" style="background:${esc(this._sceneColor(s))}">${esc(s.name || "Scene")}</button>`
        ).join("")}</div>` : ""}
      </aside>`;
  }

  _renderChoreBar() {
    const people = this._chorePeople();
    if (!people.length) return "";
    const today = isoDay(this._now);
    const house = this._houseChores();
    const lists = people.map((p) => {
      const bound = house.filter((h) => (h.who || "House") === p.name);
      const boundNames = new Set(bound.map((h) => normName(h.name)));
      const helpers = bound.filter((h) => this._helperDue(h));
      const todos = p.entity
        ? (this._todos[p.entity] || [])
          .filter((it) => choreIsDue(it, today) && !boundNames.has(normName(it.summary)))
          .slice(0, 6)
        : [];
      return { person: p, helpers, todos };
    });
    const rows = Math.max(1, Math.min(4, Math.max(0, ...lists.map((l) => l.helpers.length + l.todos.length))));
    return `<div class="chore-wrap" style="--chore-rows:${rows}">
      <div class="chore-head">
        <span>Today's chores — tap to check off</span>
        <button data-act="settings" title="Set up chores">${ICONS.gear}</button>
      </div>
      <div class="chore-bar">${lists.map(({ person: c, helpers, todos }) => {
        const empty = !helpers.length && !todos.length;
        return `<div class="chore-person">
          <div class="who"><span class="dot" style="background:${esc(c.color || "#aaa")}"></span>${esc(c.name)}</div>
          ${empty ? `<div class="chore-empty">All clear</div>` : `<ul class="todo">
            ${helpers.map((h) => `
              <li data-act="helper-toggle" data-helper="${esc(h.helper)}" data-mode="${esc(h.mode || "done")}">
                <input type="checkbox" tabindex="-1"/>
                <span>${esc(h.name)}</span>
              </li>`).join("")}
            ${todos.map((it) => {
              const late = (itemDueDay(it) || today) < today;
              return `<li class="${late ? "late" : ""}" data-act="todo-toggle" data-entity="${esc(c.entity)}" data-uid="${esc(it.uid || it.summary)}">
                <input type="checkbox" tabindex="-1" ${it.status === "completed" ? "checked" : ""}/>
                <span>${esc(it.summary)}</span>
              </li>`;
            }).join("")}
          </ul>`}
        </div>`;
      }).join("")}</div>
    </div>`;
  }

  _renderShop() {
    const shop = this._cfg.shopping;
    return `<div class="shop">
      <div class="shop-side">
        <h2>Groceries</h2>
        ${shop ? this._renderTodos(shop) : "<p>No shopping list.</p>"}
        <div class="add-row">
          <input data-shop-search inputmode="text" enterkeyhint="done" autocomplete="off" autocorrect="off" placeholder="Milk, bananas…"/>
        </div>
        <div class="shop-actions">
          <button class="primary" data-act="shop-add">Add to list</button>
          <button data-act="shop-type">Type an item</button>
        </div>
        <p class="shop-note">Type on this list — that’s the family grocery list. Walmart’s website on the tablet often needs a long-press to type, so shopping happens in the Walmart app or site on the right.</p>
      </div>
      <div class="shop-main">
        <button class="shop-tile" data-act="shop-app">Walmart app<span>Opens the app on this tablet if it’s installed</span></button>
        <button class="shop-tile web" data-act="shop-open">Walmart website<span>Opens walmart.com in a new tab</span></button>
      </div>
    </div>`;
  }

  _renderTodos(entity, compact) {
    const all = this._todos[entity] || [];
    const items = compact
      ? all.filter((it) => it.status !== "completed").slice(0, 4)
      : all;
    return `<ul class="todo">${items.map((it) => `
      <li>
        <input type="checkbox" data-act="todo-toggle" data-entity="${esc(entity)}" data-uid="${esc(it.uid || it.summary)}" ${it.status === "completed" ? "checked" : ""}/>
        <span class="${it.status === "completed" ? "done" : ""}">${esc(it.summary)}</span>
      </li>`).join("")}</ul>
      ${compact ? "" : `<div class="add-row">
        <input data-todo-input="${esc(entity)}" placeholder="Add an item"/>
        <button data-act="todo-add" data-entity="${esc(entity)}">Add</button>
      </div>`}`;
  }

  _renderLists() {
    const shop = this._cfg.shopping;
    return `<div class="pane"><h2>Shopping list</h2>${shop ? this._renderTodos(shop) : "<p>No shopping list configured.</p>"}</div>`;
  }

  _renderMeals() {
    const meals = this._cfg.meals || {};
    const today = this._now.getDay();
    const mondayFirst = (today + 6) % 7;
    return `<div class="pane"><h2>This week's dinners</h2>
      <div class="meals">${MEAL_KEYS.map((k, i) => {
        const ent = meals[k];
        const val = ent && this._hass && this._hass.states[ent] ? this._hass.states[ent].state : "";
        const show = val && val !== "unknown" && val !== "unavailable" ? val : "";
        return `<div class="meal ${i === mondayFirst ? "today" : ""}">
          <label>${MEAL_LABELS[i]}</label>
          <input data-meal="${esc(ent || "")}" value="${esc(show)}" placeholder="—" ${ent ? "" : "disabled"}/>
        </div>`;
      }).join("")}</div></div>`;
  }

  _setupItems(entity) {
    return (this._todos[entity] || []).filter((it) => parseWW(it.description) || it.status !== "completed");
  }

  _renderSettings() {
    const tab = (this._sheet && this._sheet.tab) || "chores";
    const tabs = `
      <div class="tabs">
        <button type="button" class="${tab === "chores" ? "on" : ""}" data-act="settings-tab" data-tab="chores">Chores</button>
        <button type="button" class="${tab === "people" ? "on" : ""}" data-act="settings-tab" data-tab="people">People & calendars</button>
        <button type="button" class="${tab === "camera" ? "on" : ""}" data-act="settings-tab" data-tab="camera">Camera</button>
      </div>`;
    let body = "";
    if (tab === "people") {
      const opts = this._calendarOptions();
      body = `<div class="sub">Order, color, and which Home Assistant calendar each person uses. Saved on this tablet.</div>
        ${this._cals().map((c) => `
          <div class="people-row">
            <button type="button" class="tiny" data-act="person-up" data-name="${esc(c.name)}">↑</button>
            <button type="button" class="tiny" data-act="person-down" data-name="${esc(c.name)}">↓</button>
            <input type="color" data-pref-color="${esc(c.name)}" value="${esc(c.color)}"/>
            <strong>${esc(c.name)}</strong>
            <select data-pref-cal="${esc(c.name)}">
              ${opts.map((o) => `<option value="${esc(o.entity)}" ${o.entity === c.entity ? "selected" : ""}>${esc(o.name)}</option>`).join("")}
            </select>
          </div>`).join("")}`;
    } else if (tab === "camera") {
      body = `<div class="sub">Kitchen panel camera. Tap the live picture on Home for full screen.</div>
        <label class="switch">
          <input type="checkbox" data-pref-mute="1" ${this._muted() ? "checked" : ""}/>
          Mute camera audio
        </label>
        <p class="shop-note">On by default so the kitchen stays quiet. Uncheck if you want doorbell or driveway sound.</p>`;
    } else {
      const chores = this._chores();
      body = `<div class="sub">Who does what, and how often it comes back. Checking one off the home screen marks it done until the next time.</div>
        <div class="setup">${chores.map((c) => {
          const items = this._setupItems(c.entity);
          return `<div class="person-block">
            <h4><span class="dot" style="background:${esc(c.color || "#aaa")}"></span>${esc(c.name)}</h4>
            ${items.map((it) => `
              <div class="chore-row">
                <div class="grow">
                  <div>${esc(it.summary)}</div>
                  <div class="meta">${esc(freqLabel(parseWW(it.description)))}</div>
                </div>
                <button class="tiny" data-act="chore-edit" data-entity="${esc(c.entity)}" data-uid="${esc(it.uid || it.summary)}">Edit</button>
                <button class="tiny danger" data-act="chore-del" data-entity="${esc(c.entity)}" data-uid="${esc(it.uid || it.summary)}">Remove</button>
              </div>`).join("")}
            <button type="button" class="add-chore" data-act="chore-new" data-entity="${esc(c.entity)}">+ Add a chore</button>
          </div>`;
        }).join("")}</div>`;
    }
    return `<div class="overlay" data-act="close"><div class="dlg wide">
      <h3>Settings</h3>
      ${tabs}
      ${body}
      <div class="actions">
        <button class="ghost" data-act="close">Done</button>
      </div>
    </div></div>`;
  }

  _renderChoreForm() {
    const s = this._sheet;
    const chores = this._chores();
    return `<div class="overlay" data-act="close"><form class="dlg" data-form="chore">
      <h3>${s.uid ? "Edit chore" : "New chore"}</h3>
      <div class="sub">Assign it, then pick how often it repeats.</div>
      <input name="chore-title" placeholder="Take out trash, feed the cat…" value="${esc(s.title || "")}" required autofocus/>
      <div class="who">${chores.map((c) => `
        <button type="button" class="${s.entity === c.entity ? "on" : ""}" data-act="chore-who" data-entity="${esc(c.entity)}" style="background:${esc(c.color)}">${esc(c.name)}</button>`).join("")}</div>
      <div class="freq">
        <button type="button" class="${s.freq === "weekly" ? "on" : ""}" data-act="chore-freq" data-freq="weekly">Days of the week</button>
        <button type="button" class="${s.freq === "every2" ? "on" : ""}" data-act="chore-freq" data-freq="every2">Every other day</button>
        <button type="button" class="${s.freq === "every" ? "on" : ""}" data-act="chore-freq" data-freq="every">Every few days</button>
        <button type="button" class="${s.freq === "once" ? "on" : ""}" data-act="chore-freq" data-freq="once">Once</button>
      </div>
      ${s.freq === "weekly" ? `<div class="daysel">${DAY_LETTERS.map((letter, i) => `
        <button type="button" class="${(s.days || []).map(Number).includes(i) ? "on" : ""}" data-act="chore-day" data-day="${i}">${letter}</button>`).join("")}</div>` : ""}
      ${s.freq === "every" ? `<div class="n-row">Every <input name="chore-n" type="number" min="2" max="30" value="${esc(s.n || 3)}"/> days</div>` : ""}
      <div class="actions">
        <button type="button" class="ghost" data-act="settings">Back</button>
        ${s.uid ? `<button type="button" class="ghost" data-act="chore-del" data-entity="${esc(s.entity)}" data-uid="${esc(s.uid)}">Remove</button>` : ""}
        <button class="save" type="submit">Save</button>
      </div>
    </form></div>`;
  }

  _renderSheet() {
    if (!this._sheet) return "";
    if (this._sheet.type === "settings") return this._renderSettings();
    if (this._sheet.type === "chore") return this._renderChoreForm();
    if (this._sheet.type === "day") {
      const d = this._sheet.date;
      const key = isoDay(d);
      const evs = this._eventsOn(key);
      const label = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
      return `<div class="overlay" data-act="close"><div class="dlg">
        <h3>${esc(label)}</h3>
        <div class="sub">${evs.length} event${evs.length === 1 ? "" : "s"}</div>
        ${evs.map((ev) => `
          <div class="dlg-ev" style="background:${esc(ev._color)}33">
            <div class="t">${esc(ev.summary || "")}</div>
            <div class="m">${esc(eventTimeLabel(ev))} · ${esc(ev._name || "")}</div>
          </div>`).join("")}
        <div class="actions">
          <button class="ghost" data-act="close">Close</button>
          <button class="save" data-act="add">Add event</button>
        </div>
      </div></div>`;
    }
    const s = this._sheet;
    const cals = this._cals();
    return `<div class="overlay" data-act="close"><form class="dlg" data-form="add">
      <h3>New event</h3>
      <div class="sub">${esc(MONTHS[s.date.getMonth()])} ${s.date.getDate()}</div>
      <input name="title" placeholder="What's happening?" required autofocus/>
      <div class="who">${cals.map((c) => `
        <button type="button" class="${s.cal === c.entity ? "on" : ""}" data-act="who" data-entity="${esc(c.entity)}" style="background:${esc(c.color)}">${esc(c.name)}</button>`).join("")}</div>
      <label><input type="checkbox" name="allday" checked/> All day</label>
      <div class="actions">
        <button type="button" class="ghost" data-act="close">Cancel</button>
        <button class="save" type="submit">Save</button>
      </div>
    </form></div>`;
  }

  _render() {
    if (this._view === "tasks") this._view = "calendar";
    const view = this._view;
    const home = view === "calendar";
    const body =
      view === "lists" ? this._renderShop()
        : view === "meals" ? this._renderMeals()
          : this._renderMonth();
    const n = this._now;
    let hh = n.getHours();
    const ap = hh >= 12 ? "PM" : "AM";
    hh = hh % 12 || 12;
    this.shadowRoot.innerHTML = `
      <style>${CSS}</style>
      <div class="app ${home ? "home" : ""}">
        <nav class="rail">
          <div class="logo">W</div>
          <button class="rail-btn ${view === "calendar" ? "active" : ""}" data-act="view" data-view="calendar">${ICONS.calendar}Calendar</button>
          <button class="rail-btn ${view === "lists" ? "active" : ""}" data-act="view" data-view="lists">${ICONS.shop}Shop</button>
          <button class="rail-btn ${view === "meals" ? "active" : ""}" data-act="view" data-view="meals">${ICONS.meals}Meals</button>
        </nav>
        <div class="main">
          ${this._renderHeader()}
          ${body}
          ${home ? this._renderChoreBar() : ""}
          <button class="fab" data-act="add" title="Add">+</button>
          ${this._renderSheet()}
          ${this._camFull ? `<div class="cam-full" data-act="cam-close">
            <div id="live-cam-full"></div>
            <div class="hint">Tap to close</div>
          </div>` : ""}
          <div class="show" id="slideshow" hidden>
            <img id="slide-img" alt="">
            <div class="show-meta">${esc(n.toLocaleDateString("en-US", { weekday: "long" }))}  ${hh}:${pad(n.getMinutes())} ${ap}</div>
          </div>
        </div>
      </div>`;
    this._mountCamera();
    this._helperSnap = this._helperSig();
  }
}

customElements.define("wrightway-calendar-card", WrightWayCalendarCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "wrightway-calendar-card",
  name: "WrightWay Calendar",
  description: "Skylight-style family month calendar for wall tablets",
  preview: true,
});
