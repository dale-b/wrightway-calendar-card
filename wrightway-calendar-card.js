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
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  overscroll-behavior: none;
  touch-action: manipulation;
  z-index: 1;
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
  flex-direction: row;
  align-items: stretch;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--paper);
  overflow: hidden;
  overscroll-behavior: none;
  touch-action: manipulation;
}
.rail {
  width: 88px;
  flex: 0 0 88px;
  align-self: stretch;
  height: auto;
  min-height: 0;
  background: #f4f4f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0 12px;
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
.rail-btn.settings { margin-top: auto; }
.main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
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
.month-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 16px 6px;
  flex-shrink: 0;
}
.month-bar .title {
  font-family: "Iowan Old Style", Palatino, "Palatino Linotype", Georgia, serif;
  font-size: clamp(22px, 2.4vw, 34px);
  font-weight: 600;
  letter-spacing: -0.02em;
}
.legend { display: flex; gap: 8px; flex-wrap: wrap; padding: 0 16px 6px; flex-shrink: 0; }
.agenda {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin: 0 16px 8px;
  flex-shrink: 0;
}
.today-box {
  margin: 0;
  background: var(--wash);
  border-radius: 16px;
  padding: 8px 12px 6px;
  max-height: 96px;
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
.home {
  flex: 1; min-height: 0; overflow: hidden;
  padding: 0 16px 12px;
  display: flex; flex-direction: column;
}
.home > .tabs { margin: 0 0 10px; flex-shrink: 0; }
.home-split {
  flex: 1; min-height: 0;
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 16px;
}
.room-nav {
  display: flex; flex-direction: column; gap: 2px;
  min-height: 0; overflow: hidden;
}
.room-nav button {
  display: flex; align-items: center; gap: 8px;
  border: 0; background: transparent;
  border-radius: 12px; padding: 7px 8px;
  font: inherit; font-weight: 700; font-size: 13px;
  text-align: left; cursor: pointer; color: var(--ink);
}
.room-nav button.on { background: #ffedd5; }
.room-nav .lamp-orb { width: 26px; height: 26px; margin: 0; flex-shrink: 0; }
.room-nav .lamp-orb svg { width: 14px; height: 14px; }
.room-detail { min-width: 0; min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
.home-head {
  display: flex; align-items: center; gap: 10px;
  margin: 0 0 14px;
}
.home-head h2 { margin: 0; font-size: 26px; font-weight: 650; }
.home-head .back {
  border: 1px solid var(--line); background: #fff; border-radius: 999px;
  padding: 8px 14px; font: inherit; font-weight: 700; cursor: pointer;
}
.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}
.ctl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}
.room-tile, .ctl, .device {
  border: 0;
  border-radius: 20px;
  background: var(--wash);
  color: var(--ink);
  -webkit-tap-highlight-color: transparent;
  animation: rise .35s ease both;
}
.room-tile {
  min-height: 72px;
  padding: 10px 12px;
  font: inherit;
  font-weight: 800;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.room-tile .ico {
  width: 36px; height: 36px; border-radius: 12px;
  background: #fff; display: flex; align-items: center; justify-content: center;
  margin-bottom: 10px;
}
.room-tile .ico svg { width: 20px; height: 20px; }
.room-tile:active, .ctl:active, .device-hit:active { transform: scale(0.98); }
.room-tile.on, .ctl.on, .device.on { background: #ffedd5; }
.ctl.busy, .device.busy { background: #ffedd5; }
.ctl {
  min-height: 64px; padding: 10px 12px;
  font: inherit; font-weight: 800; font-size: 14px;
  text-align: left; cursor: pointer;
  display: flex; flex-direction: column; justify-content: space-between;
}
.ctl .st, .device .st, .room-tile .st {
  font-size: 13px; font-weight: 600; color: var(--muted); margin-top: 6px;
}
.device {
  padding: 14px 16px 12px;
  display: flex; flex-direction: column; gap: 8px;
}
.device-hit {
  border: 0; background: transparent; padding: 0;
  font: inherit; font-weight: 800; font-size: 16px;
  text-align: left; cursor: pointer; color: inherit;
  display: flex; justify-content: space-between; align-items: center; gap: 8px;
  width: 100%;
}
.device input[type=range] {
  width: 100%; accent-color: var(--accent); height: 22px;
}
.chip-row { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 14px; }
.opt {
  border: 1px solid var(--line); background: #fff; border-radius: 999px;
  padding: 10px 16px; font: inherit; font-weight: 700; font-size: 14px;
  cursor: pointer; color: var(--ink);
}
.opt.on { background: #1c1917; color: #fff; border-color: #1c1917; }
.vac-layout, .gar-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 10px;
  align-items: stretch;
  flex: 0 0 auto;
  max-height: 240px;
}
.map-card, .gar-cam {
  background: #111; border-radius: 16px; overflow: hidden; min-height: 200px; max-height: 240px;
  position: relative;
}
.map-card img, .gar-cam img {
  width: 100%; height: 100%; object-fit: contain; display: block; background: #111;
}
.gar-cam img { object-fit: cover; min-height: 200px; max-height: 240px; }
.map-card .cap, .gar-cam .cap {
  position: absolute; left: 12px; bottom: 12px;
  background: rgba(0,0,0,.5); color: #fff; font-size: 12px; font-weight: 700;
  padding: 4px 8px; border-radius: 999px;
}
.vac-side, .gar-side { display: flex; flex-direction: column; gap: 10px; }
.stat {
  background: var(--wash); border-radius: 20px; padding: 16px 18px;
}
.stat .big { font-size: 28px; font-weight: 700; letter-spacing: -0.03em; }
.stat .sub { color: var(--muted); font-weight: 600; font-size: 13px; margin-top: 2px; }
.batt {
  height: 8px; border-radius: 99px; background: #e7e5e4; overflow: hidden; margin-top: 10px;
}
.batt span { display: block; height: 100%; background: #16a34a; border-radius: 99px; }
.gdoors { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.gdoor {
  background: var(--wash); border-radius: 16px; padding: 8px 10px 10px;
  cursor: pointer; border: 0; font: inherit; text-align: left; color: inherit;
}
.gdoor .name { font-weight: 800; font-size: 14px; display: flex; justify-content: space-between; }
.gvis {
  margin-top: 8px; height: 44px; border-radius: 10px; background: #d6d3d1;
  position: relative; overflow: hidden;
}
.gvis .panel {
  position: absolute; left: 8%; right: 8%; top: 10%; height: 80%;
  background: repeating-linear-gradient(#78716c, #78716c 10px, #57534e 10px, #57534e 12px);
  border-radius: 4px; transition: transform .45s ease;
}
.gdoor.open .gvis .panel { transform: translateY(-78%); }
.gdoor.open { background: #ffedd5; }
.home-note { color: var(--muted); font-size: 14px; margin: 0 0 12px; }
.sec-title {
  font-size: 13px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
  color: var(--muted); margin: 16px 0 8px;
}
@keyframes rise {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
.lamp-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  align-content: start;
}
.lamp {
  --glow: #ffd7a8;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 8px 10px 8px;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 34px;
  grid-template-areas: "orb name pwr" "orb slide pwr" "dots dots dots";
  gap: 2px 8px;
  align-items: center;
  transition: background .2s ease, border-color .2s ease;
}
.lamp.on {
  background: #fffaf3;
  border-color: #fed7aa;
}
.lamp-orb {
  grid-area: orb;
  width: 36px; height: 36px; border-radius: 50%;
  border: 0; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  background: #e7e5e4; color: #78716c;
  transition: background .25s ease, box-shadow .25s ease, color .25s ease;
}
.lamp-orb svg { width: 18px; height: 18px; }
.lamp.on .lamp-orb {
  background: var(--glow);
  color: #1c1917;
  box-shadow: 0 0 14px var(--glow);
}
.lamp-orb:active { transform: scale(0.94); }
.lamp-meta { grid-area: name; min-width: 0; }
.lamp-name { font-weight: 800; font-size: 14px; letter-spacing: -0.02em; }
.lamp-pct { color: var(--muted); font-size: 11px; font-weight: 600; }
.lamp-pwr {
  grid-area: pwr;
  width: 32px; height: 32px; border-radius: 50%;
  border: 1px solid var(--line); background: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center; color: var(--muted);
}
.lamp.on .lamp-pwr { background: #1c1917; color: #fff; border-color: #1c1917; }
.lamp-pwr svg { width: 16px; height: 16px; }
.lamp-sliders {
  grid-area: slide;
  display: flex; flex-direction: column; gap: 4px;
  min-width: 0; max-width: 280px;
}
.slide {
  display: grid; grid-template-columns: 16px 1fr; gap: 6px; align-items: center;
}
.slide span { font-size: 11px; }
.slide input[type=range] {
  width: 100%; max-width: 260px; height: 18px; appearance: none; background: transparent;
  touch-action: pan-x;
}
.slide input[type=range]::-webkit-slider-runnable-track {
  height: 6px; border-radius: 99px; background: var(--track, #e7e5e4);
}
.slide input[type=range]::-webkit-slider-thumb {
  appearance: none; width: 16px; height: 16px; border-radius: 50%;
  background: #fff; border: 2px solid #1c1917; margin-top: -5px;
}
.dots { grid-area: dots; display: flex; gap: 6px; flex-wrap: wrap; padding: 2px 0 0 0; }
.dotc {
  width: 18px; height: 18px; border-radius: 50%; border: 2px solid #fff;
  box-shadow: 0 0 0 1px #d6d3d1; cursor: pointer; padding: 0;
}
.dotc:active { transform: scale(0.92); }
.moods { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 10px; flex-shrink: 0; }
.mood {
  border: 0; border-radius: 999px; padding: 6px 12px;
  font: inherit; font-weight: 800; font-size: 12px; cursor: pointer;
}
.room-hero {
  display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-shrink: 0;
}
.room-hero .lamp-orb { width: 36px; height: 36px; flex-shrink: 0; }
.room-hero h2 { margin: 0; font-size: 22px; font-weight: 650; letter-spacing: -0.03em; }
.room-hero .acts { margin-left: auto; display: flex; gap: 6px; }
.sun-btn, .pwr-btn {
  width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid var(--line); background: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.sun-btn.on, .pwr-btn.on { background: #1c1917; color: #fff; border-color: #1c1917; }
.sun-btn svg, .pwr-btn svg { width: 18px; height: 18px; }
.room-tile .lamp-orb {
  width: 28px; height: 28px; margin-bottom: 6px; pointer-events: none;
}
.room-tile .lamp-orb svg { width: 16px; height: 16px; }
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
.app.cal .fab, .app.controls .fab { display: none; }
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
.stage { flex: 1; min-height: 0; display: flex; overflow: hidden; }
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
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 21h6v.5a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 21.5V21zm.5-2h5l.5-1.2A7 7 0 0012 3a7 7 0 00-3 13.8L9.5 19z"/></svg>',
  power: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v9"/><path d="M7.5 6.2a7 7 0 109 0"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
};

const LIGHT_DOTS = [
  [255, 244, 229],
  [255, 214, 170],
  [255, 186, 120],
  [255, 147, 41],
  [255, 255, 255],
  [186, 214, 255],
];

const ADAPTIVE = {
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

const HOME_ROOMS = [
  { id: "kitchen", name: "Kitchen", entities: [
    { entity: "light.kitchen_lights", name: "Kitchen lights" },
    { entity: "light.kitchen_island_lights", name: "Island" },
    { entity: "light.under_cabinet_lights_nanoleaf_light_strip", name: "Under cabinet" },
    { entity: "light.above_cabinet_lights_nanoleaf_light_strip", name: "Above cabinet" },
  ]},
  { id: "living", name: "Living room", entities: [
    { entity: "light.living_room_lights", name: "Living room lights" },
    { entity: "light.bookshelf_lights", name: "Bookshelf" },
    { entity: "fan.living_room_fan", name: "Ceiling fan" },
    { entity: "cover.living_room_shade", name: "Shade" },
    { entity: "switch.living_room_stairs", name: "Stairs" },
  ]},
  { id: "dining", name: "Dining", entities: [
    { entity: "light.dining_room_lights", name: "Dining lights" },
    { entity: "cover.dining_room_shade", name: "Shade" },
  ]},
  { id: "mudroom", name: "Mudroom", entities: [
    { entity: "light.mudroom_lights", name: "Mudroom lights" },
  ]},
  { id: "pantry", name: "Pantry", entities: [
    { entity: "light.pantry_lights", name: "Pantry lights" },
  ]},
  { id: "master", name: "Master bedroom", entities: [
    { entity: "light.master_bedroom_lights", name: "Bedroom lights" },
    { entity: "light.master_bedroom_dales_lamp", name: "Dale’s lamp" },
    { entity: "fan.master_bedroom_fan", name: "Ceiling fan" },
  ]},
  { id: "master_bath", name: "Master bath", entities: [
    { entity: "light.master_bathroom_lights", name: "Bath lights" },
    { entity: "light.master_shower_fan", name: "Shower fan" },
    { entity: "light.master_toilet_fan", name: "Toilet fan" },
  ]},
  { id: "ben", name: "Ben’s room", entities: [
    { entity: "light.bens_room_lights", name: "Lights" },
    { entity: "light.ben_s_nightlight", name: "Nightlight" },
    { entity: "fan.bens_room_fan", name: "Ceiling fan" },
    { entity: "fan.ben_s_noise_fan_switch", name: "Noise fan" },
  ]},
  { id: "david", name: "David’s room", entities: [
    { entity: "light.davids_room_lights", name: "Lights" },
    { entity: "light.david_s_nightlight", name: "Nightlight" },
    { entity: "fan.davids_room_fan", name: "Ceiling fan" },
  ]},
  { id: "guest", name: "Guest room", entities: [
    { entity: "fan.guest_room_fan", name: "Ceiling fan" },
  ]},
  { id: "office", name: "Office", entities: [
    { entity: "fan.office_fan", name: "Ceiling fan" },
  ]},
  { id: "kids_bath", name: "Kids’ bath", entities: [
    { entity: "light.kid_s_bathroom_fan", name: "Fan" },
  ]},
  { id: "half_bath", name: "Half bath", entities: [
    { entity: "light.half_bath_fan", name: "Fan" },
  ]},
  { id: "basement", name: "Basement", entities: [
    { entity: "light.basement_living_room", name: "Living room" },
    { entity: "light.basement_play_area", name: "Play area" },
    { entity: "light.bar_lights", name: "Bar lights" },
  ]},
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
    this._homeTab = "rooms";
    this._homeRoom = null;
    this._homeSnap = "";
    this._slideLock = false;
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
        this._tickHome();
        this._applyMute();
      }, 1000);
      this._loadEvents();
      this._loadTodos();
      this._render();
    }
  }

  get hass() { return this._hass; }

  getCardSize() { return 24; }

  getGridOptions() {
    return { columns: "full", rows: 18, min_rows: 12 };
  }

  connectedCallback() {
    if (!this._bound) {
      this._bound = true;
      this.shadowRoot.addEventListener("touchmove", (e) => {
        if (e.target.closest("input[type=range], .today-box, .dlg, .shop, .pane")) return;
        e.preventDefault();
      }, { passive: false });
      this.shadowRoot.addEventListener("wheel", (e) => {
        if (e.target.closest(".today-box, .dlg, .shop, .pane")) return;
        e.preventDefault();
      }, { passive: false });
      this.shadowRoot.addEventListener("click", (e) => {
        this._idleAt = Date.now();
        if (this._slideOn) {
          this._slideOn = false;
          this._tickIdle();
          if (!e.target.closest("[data-act]")) return;
        }
        this._onClick(e);
      });
      this.shadowRoot.addEventListener("input", (e) => this._onInput(e));
      this.shadowRoot.addEventListener("pointerdown", (e) => {
        this._idleAt = Date.now();
        if (e.target.matches("input[type=range]")) this._slideLock = true;
      });
      this.shadowRoot.addEventListener("pointerup", (e) => {
        if (e.target.matches("input[type=range]")) this._slideLock = false;
        const input = e.target.closest("input:not([type=checkbox]):not([type=range]), textarea");
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
    this._lockFrame();
    this._render();
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

  _entState(id) {
    const st = this._hass && this._hass.states[id];
    return st ? st.state : "";
  }

  _entOn(id) {
    const s = this._entState(id);
    return s === "on" || s === "open" || s === "opening" || s === "cleaning" || s === "returning";
  }

  _homeEntities() {
    const ids = [];
    HOME_ROOMS.forEach((r) => r.entities.forEach((e) => ids.push(e.entity)));
    HOME_OUTSIDE.forEach((e) => ids.push(e.entity));
    HOME_VACUUM_ROOMS.forEach((e) => ids.push(e.entity));
    ids.push("vacuum.roborock_qrevo_pro", "input_boolean.auto_vacuum_enabled");
    ids.push("input_boolean.vacuum_qp_twice", "input_boolean.vacuum_qp_mopping", "input_boolean.mop_when_gone_next");
    ids.push("select.kitchen_roborock_qrevo_pro_cleaning_mode", "sensor.roborock_qrevo_pro_battery");
    ids.push("sensor.roborock_qrevo_pro_status", "image.roborock_qrevo_pro_upstairs");
    GARAGE_DOORS.forEach((d) => ids.push(d.entity));
    ids.push("camera.garage_high", "binary_sensor.tesla_wall_connector_vehicle_connected");
    ids.push("climate.garage_thermostat", "switch.air_exchanger");
    (this._cfg.scenes || []).forEach((s) => ids.push(s.entity));
    return ids;
  }

  _homeSig() {
    return this._homeEntities().map((id) => `${id}:${this._entState(id)}`).join("|");
  }

  _tickHome() {
    if (this._view !== "home" || this._slideLock) return;
    const sig = this._homeSig();
    if (sig === this._homeSnap) return;
    this._homeSnap = sig;
    this._render();
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

  _roomLightIds(room) {
    return (room.entities || []).map((e) => e.entity).filter((id) => id.startsWith("light."));
  }

  async _roomPower(roomId, on) {
    const room = HOME_ROOMS.find((r) => r.id === roomId);
    if (!room || !this._hass) return;
    const ids = this._roomLightIds(room).filter((id) => this._hass.states[id] && this._hass.states[id].state !== "unavailable");
    if (!ids.length) return;
    await this._hass.callService("light", on ? "turn_on" : "turn_off", { entity_id: ids });
  }

  async _roomMood(roomId, mood) {
    const room = HOME_ROOMS.find((r) => r.id === roomId);
    if (!room || !this._hass) return;
    const ids = this._roomLightIds(room).filter((id) => {
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
    let start = startOfMonthGrid(y, m);
    let end = new Date(start);
    end.setDate(start.getDate() + 42);
    const today = new Date(this._now);
    today.setHours(0, 0, 0, 0);
    const extraStart = new Date(today);
    extraStart.setDate(today.getDate() - 1);
    const extraEnd = new Date(today);
    extraEnd.setDate(today.getDate() + 3);
    if (extraStart < start) start = extraStart;
    if (extraEnd > end) end = extraEnd;
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
    if (act === "view") {
      this._view = t.dataset.view;
      if (this._view === "home") {
        this._homeTab = "rooms";
        this._homeRoom = "kitchen";
      }
    }
    if (act === "home-tab") {
      this._homeTab = t.dataset.tab;
      if (this._homeTab === "rooms" && !this._homeRoom) this._homeRoom = "kitchen";
    }
    if (act === "home-room") this._homeRoom = t.dataset.room;
    if (act === "home-back") this._homeRoom = "kitchen";
    if (act === "ent-toggle") {
      this._toggleEntity(t.dataset.entity);
      return;
    }
    if (act === "vac") {
      this._vacuumCmd(t.dataset.cmd);
      return;
    }
    if (act === "set-option") {
      this._hass.callService("select", "select_option", { entity_id: t.dataset.entity, option: t.dataset.option });
      return;
    }
    if (act === "set-fan") {
      this._hass.callService("vacuum", "set_fan_speed", { entity_id: "vacuum.roborock_qrevo_pro", fan_speed: t.dataset.speed });
      return;
    }
    if (act === "set-rgb") {
      const rgb = (t.dataset.rgb || "").split(",").map(Number);
      if (rgb.length === 3 && this._hass) {
        this._hass.callService("light", "turn_on", { entity_id: t.dataset.entity, rgb_color: rgb, brightness: 200 });
      }
      return;
    }
    if (act === "room-all") {
      this._roomPower(t.dataset.room, t.dataset.on === "1");
      return;
    }
    if (act === "room-mood") {
      this._roomMood(t.dataset.room, t.dataset.mood);
      return;
    }
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

  _onInput(e) {
    const t = e.target;
    if (t.dataset.bright && this._hass) {
      const val = Math.max(1, Math.min(255, Number(t.value) || 1));
      clearTimeout(this._brightT);
      this._brightT = setTimeout(() => {
        this._hass.callService("light", "turn_on", { entity_id: t.dataset.bright, brightness: val });
      }, 80);
    }
    if (t.dataset.ct && this._hass) {
      const val = Number(t.value);
      clearTimeout(this._ctT);
      this._ctT = setTimeout(() => {
        this._hass.callService("light", "turn_on", { entity_id: t.dataset.ct, color_temp_kelvin: val });
      }, 80);
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
      </div>`;
  }

  _renderMonthBar() {
    const y = this._cursor.getFullYear();
    const m = this._cursor.getMonth();
    return `<div class="month-bar">
      <div class="title">${esc(MONTHS[m])} ${y}</div>
      <div class="tools">
        <button data-act="prev" title="Previous month">‹</button>
        <button data-act="today">Today</button>
        <button data-act="next" title="Next month">›</button>
      </div>
    </div>`;
  }

  _dayEvents(offset) {
    const d = new Date(this._now);
    d.setDate(d.getDate() + (offset || 0));
    const key = isoDay(d);
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

  _renderAgendaCol(title, evs, empty) {
    return `<div class="today-box">
      <h4>${esc(title)}</h4>
      ${evs.length ? evs.map((ev) => `
        <div class="today-row">
          <span class="tm">${esc(eventTimeLabel(ev))}</span>
          <span class="sum" style="color:${esc(ev._color)}">${esc(ev.summary || "Event")}</span>
          <span class="who-tag">${esc(ev._name || "")}</span>
        </div>`).join("") : `<div class="today-empty">${esc(empty)}</div>`}
    </div>`;
  }

  _renderToday() {
    return `<div class="agenda">
      ${this._renderAgendaCol("Today", this._dayEvents(0), "Nothing on the calendar today")}
      ${this._renderAgendaCol("Tomorrow", this._dayEvents(1), "Nothing tomorrow")}
    </div>`;
  }

  _pic(entity) {
    const st = this._hass && this._hass.states[entity];
    const pic = st && st.attributes && st.attributes.entity_picture;
    if (!pic || !this._hass) return "";
    return this._hass.hassUrl(pic) + "&t=" + encodeURIComponent(st.state || Date.now());
  }

  _ctlTile(entity, name, extra) {
    const st = this._hass && this._hass.states[entity];
    if (!st || st.state === "unavailable") return "";
    const on = this._entOn(entity);
    const domain = entity.split(".")[0];
    let status = extra || (on ? "On" : "Off");
    if (domain === "cover") status = (st.state === "open" || st.state === "opening") ? "Open" : "Closed";
    return `<button type="button" class="ctl ${on ? "on" : ""}" data-act="ent-toggle" data-entity="${esc(entity)}">
      <span>${esc(name)}</span>
      <span class="st">${esc(status)}</span>
    </button>`;
  }

  _deviceRow(entity, name) {
    const st = this._hass && this._hass.states[entity];
    if (!st || st.state === "unavailable") return "";
    const domain = entity.split(".")[0];
    if (domain !== "light") {
      const on = this._entOn(entity);
      let status = on ? "On" : "Off";
      if (domain === "cover") status = (st.state === "open" || st.state === "opening") ? "Open" : "Closed";
      if (domain === "fan") status = on ? "Spinning" : "Off";
      return `<div class="lamp ${on ? "on" : ""}" style="--glow:#fdba74">
        <button type="button" class="lamp-orb" data-act="ent-toggle" data-entity="${esc(entity)}">${ICONS.bulb}</button>
        <div class="lamp-meta">
          <div class="lamp-name">${esc(name)}</div>
          <div class="lamp-pct">${esc(status)}</div>
        </div>
        <button type="button" class="lamp-pwr" data-act="ent-toggle" data-entity="${esc(entity)}">${ICONS.power}</button>
      </div>`;
    }
    const look = this._lightLook(entity);
    if (!look) return "";
    const track = `linear-gradient(90deg, #1c1917, ${look.glow})`;
    const ctTrack = "linear-gradient(90deg, #ffb347, #fff6e8, #cde7ff)";
    return `<div class="lamp ${look.on ? "on" : ""}" style="--glow:${esc(look.glow)}">
      <button type="button" class="lamp-orb" data-act="ent-toggle" data-entity="${esc(entity)}">${ICONS.bulb}</button>
      <div class="lamp-meta">
        <div class="lamp-name">${esc(name)}</div>
        <div class="lamp-pct">${look.on ? `${look.pct}%` : "Off"}</div>
      </div>
      <button type="button" class="lamp-pwr" data-act="ent-toggle" data-entity="${esc(entity)}">${ICONS.power}</button>
      <div class="lamp-sliders">
        ${look.dimmable ? `<label class="slide"><span>☀</span><input type="range" min="1" max="255" value="${look.bright || 1}" data-bright="${esc(entity)}" style="--track:${esc(track)}"/></label>` : ""}
        ${look.temp ? `<label class="slide"><span>🌡</span><input type="range" min="${look.minK}" max="${look.maxK}" value="${look.kelvin || 3000}" data-ct="${esc(entity)}" style="--track:${ctTrack}"/></label>` : ""}
        ${look.color ? `<div class="dots">${LIGHT_DOTS.map((rgb) => `
          <button type="button" class="dotc" data-act="set-rgb" data-entity="${esc(entity)}" data-rgb="${rgb.join(",")}" style="background:rgb(${rgb.join(",")})"></button>`).join("")}</div>` : ""}
      </div>
    </div>`;
  }

  _renderVacuum() {
    const vac = this._hass && this._hass.states["vacuum.roborock_qrevo_pro"];
    const vstate = vac ? vac.state : "unknown";
    const batt = Number(this._entState("sensor.roborock_qrevo_pro_battery")) || 0;
    const status = (this._entState("sensor.roborock_qrevo_pro_status") || vstate).replace(/_/g, " ");
    const room = this._entState("sensor.roborock_qrevo_pro_current_room") || "";
    const mode = this._entState("select.kitchen_roborock_qrevo_pro_cleaning_mode");
    const speed = vac && vac.attributes ? vac.attributes.fan_speed : "";
    const map = this._pic("image.roborock_qrevo_pro_upstairs");
    const cleaning = vstate === "cleaning" || status.includes("clean") || status.includes("mop");
    const opt = (ent, label) => {
      const on = this._entOn(ent);
      return `<button type="button" class="opt ${on ? "on" : ""}" data-act="ent-toggle" data-entity="${esc(ent)}">${esc(label)}</button>`;
    };
    return `<div class="vac-layout">
        <div class="map-card">
          ${map ? `<img src="${esc(map)}" alt="Vacuum map">` : `<div class="cap">Map unavailable</div>`}
          <div class="cap">${esc(room ? `Now: ${room}` : "Upstairs map")}</div>
        </div>
        <div class="vac-side">
          <div class="stat">
            <div class="big">${esc(status)}</div>
            <div class="sub">${batt}% battery${cleaning ? " · running" : ""}</div>
            <div class="batt"><span style="width:${Math.max(0, Math.min(100, batt))}%"></span></div>
          </div>
          <div class="ctl-grid">
            <button type="button" class="ctl ${cleaning ? "busy" : ""}" data-act="vac" data-cmd="start"><span>Start</span><span class="st">Clean now</span></button>
            <button type="button" class="ctl" data-act="vac" data-cmd="pause"><span>Pause</span><span class="st">Hold</span></button>
            <button type="button" class="ctl ${vstate === "docked" || vstate === "returning" ? "on" : ""}" data-act="vac" data-cmd="return_to_base"><span>Dock</span><span class="st">Send home</span></button>
          </div>
        </div>
      </div>
      <div class="sec-title">Options</div>
      <div class="chip-row">
        ${opt("input_boolean.vacuum_qp_twice", "×2")}
        ${opt("input_boolean.vacuum_qp_mopping", "Mop")}
        ${opt("input_boolean.mop_when_gone_next", "Mop when gone")}
        ${opt("input_boolean.auto_vacuum_enabled", "Auto")}
      </div>
      <div class="sec-title">Mode</div>
      <div class="chip-row">
        ${["vacuum", "vac_and_mop", "mop"].map((o) => `
          <button type="button" class="opt ${mode === o ? "on" : ""}" data-act="set-option" data-entity="select.kitchen_roborock_qrevo_pro_cleaning_mode" data-option="${o}">${o === "vac_and_mop" ? "Vac + mop" : o === "vacuum" ? "Vacuum" : "Mop only"}</button>`).join("")}
      </div>
      <div class="sec-title">Suction</div>
      <div class="chip-row">
        ${(vac && vac.attributes && vac.attributes.fan_speed_list ? vac.attributes.fan_speed_list : ["quiet", "balanced", "turbo", "max"]).filter((s) => !["off", "custom", "smart_mode"].includes(s)).map((s) => `
          <button type="button" class="opt ${speed === s ? "on" : ""}" data-act="set-fan" data-speed="${esc(s)}">${esc(s.replace(/_/g, " "))}</button>`).join("")}
      </div>
      <div class="sec-title">Send to a room</div>
      <div class="chip-row">${HOME_VACUUM_ROOMS.map((r) => {
        const on = this._entOn(r.entity);
        return `<button type="button" class="opt ${on ? "on" : ""}" data-act="ent-toggle" data-entity="${esc(r.entity)}">${esc(r.name)}</button>`;
      }).join("")}</div>`;
  }

  _renderGarage() {
    const cam = this._pic("camera.garage_high");
    const tesla = this._entOn("binary_sensor.tesla_wall_connector_vehicle_connected");
    const clim = this._hass && this._hass.states["climate.garage_thermostat"];
    const temp = clim && clim.attributes ? Math.round(clim.attributes.current_temperature || 0) : "";
    return `<div class="gar-layout">
        <div class="gar-cam">
          ${cam ? `<img src="${esc(cam)}" alt="Garage">` : ""}
          <div class="cap">Garage</div>
        </div>
        <div class="gar-side">
          <div class="ctl ${tesla ? "on" : ""}"><span>Tesla</span><span class="st">${tesla ? "Plugged in" : "Not connected"}</span></div>
          <div class="ctl"><span>Garage</span><span class="st">${temp ? `${temp}°` : "—"}</span></div>
          ${this._ctlTile("switch.air_exchanger", "Air exchanger")}
        </div>
      </div>
      <div class="gdoors">${GARAGE_DOORS.map((d) => {
        const open = this._entOn(d.entity);
        return `<button type="button" class="gdoor ${open ? "open" : ""}" data-act="ent-toggle" data-entity="${esc(d.entity)}">
          <div class="name"><span>${esc(d.name)}</span><span class="st">${open ? "Open" : "Closed"}</span></div>
          <div class="gvis"><div class="panel"></div></div>
        </button>`;
      }).join("")}</div>`;
  }

  _renderHome() {
    const tab = this._homeTab || "rooms";
    const tabs = `
      <div class="tabs">
        <button type="button" class="${tab === "rooms" ? "on" : ""}" data-act="home-tab" data-tab="rooms">Rooms</button>
        <button type="button" class="${tab === "vacuum" ? "on" : ""}" data-act="home-tab" data-tab="vacuum">Vacuum</button>
        <button type="button" class="${tab === "garage" ? "on" : ""}" data-act="home-tab" data-tab="garage">Garage</button>
        <button type="button" class="${tab === "outside" ? "on" : ""}" data-act="home-tab" data-tab="outside">Outside</button>
      </div>`;
    let body = "";
    if (tab === "vacuum") body = this._renderVacuum();
    else if (tab === "garage") body = this._renderGarage();
    else if (tab === "outside") {
      body = `<div class="ctl-grid">${HOME_OUTSIDE.map((e) => this._ctlTile(e.entity, e.name)).join("")}</div>`;
    } else {
      if (!this._homeRoom) this._homeRoom = "kitchen";
      const room = HOME_ROOMS.find((r) => r.id === this._homeRoom) || HOME_ROOMS[0];
      const scenes = room.id === "kitchen" ? (this._cfg.scenes || []) : [];
      const ids = this._roomLightIds(room);
      const anyOn = ids.some((id) => this._entOn(id));
      const adapt = ADAPTIVE[room.id];
      const adaptOn = adapt && this._entOn(adapt);
      const glow = anyOn ? "#ffd7a8" : "#e7e5e4";
      body = `<div class="home-split">
        <nav class="room-nav">${HOME_ROOMS.map((r) => {
          const n = this._roomLightIds(r).filter((id) => this._entOn(id)).length;
          const on = r.id === room.id;
          const firstOn = this._roomLightIds(r).find((id) => this._entOn(id));
          const look = firstOn ? this._lightLook(firstOn) : null;
          const g = look && look.on ? look.glow : "#e7e5e4";
          return `<button type="button" class="${on ? "on" : ""}" data-act="home-room" data-room="${esc(r.id)}">
            <span class="lamp-orb" style="background:${esc(g)};color:#1c1917">${ICONS.bulb}</span>
            <span>${esc(r.name)}${n ? ` · ${n}` : ""}</span>
          </button>`;
        }).join("")}</nav>
        <div class="room-detail">
          <div class="room-hero">
            <div class="lamp-orb" style="background:${glow};color:#1c1917;box-shadow:${anyOn ? "0 0 14px #ffd7a8" : "none"}">${ICONS.bulb}</div>
            <h2>${esc(room.name)}</h2>
            <div class="acts">
              ${adapt ? `<button type="button" class="sun-btn ${adaptOn ? "on" : ""}" data-act="ent-toggle" data-entity="${esc(adapt)}" title="Adaptive lighting">${ICONS.sun}</button>` : ""}
              <button type="button" class="pwr-btn ${anyOn ? "on" : ""}" data-act="room-all" data-room="${esc(room.id)}" data-on="${anyOn ? "0" : "1"}" title="All lights">${ICONS.power}</button>
            </div>
          </div>
          <div class="moods">
            <button type="button" class="mood" style="background:#fff7ed" data-act="room-mood" data-room="${esc(room.id)}" data-mood="bright">Bright</button>
            <button type="button" class="mood" style="background:#fed7aa" data-act="room-mood" data-room="${esc(room.id)}" data-mood="relax">Relax</button>
            <button type="button" class="mood" style="background:#fdba74" data-act="room-mood" data-room="${esc(room.id)}" data-mood="night">Night</button>
            ${scenes.map((s) => `<button type="button" class="mood" style="background:${esc(this._sceneColor(s))}" data-act="scene" data-entity="${esc(s.entity)}">${esc(s.name)}</button>`).join("")}
          </div>
          <div class="lamp-list">
            ${room.entities.map((e) => this._deviceRow(e.entity, e.name)).join("")}
          </div>
        </div>
      </div>`;
    }
    return `<div class="home">${tab === "rooms" && this._homeRoom ? "" : tabs}${body}</div>`;
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
          ${this._renderMonthBar()}
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
    const isCal = view === "calendar";
    const body =
      view === "lists" ? this._renderShop()
        : view === "meals" ? this._renderMeals()
          : view === "home" ? this._renderHome()
            : this._renderMonth();
    const n = this._now;
    let hh = n.getHours();
    const ap = hh >= 12 ? "PM" : "AM";
    hh = hh % 12 || 12;
    this.shadowRoot.innerHTML = `
      <style>${CSS}</style>
      <div class="app ${isCal ? "cal" : ""} ${view === "home" ? "controls" : ""}">
        <nav class="rail">
          <div class="logo">W</div>
          <button class="rail-btn ${view === "calendar" ? "active" : ""}" data-act="view" data-view="calendar">${ICONS.calendar}Calendar</button>
          <button class="rail-btn ${view === "home" ? "active" : ""}" data-act="view" data-view="home">${ICONS.home}Home</button>
          <button class="rail-btn ${view === "lists" ? "active" : ""}" data-act="view" data-view="lists">${ICONS.shop}Shop</button>
          <button class="rail-btn ${view === "meals" ? "active" : ""}" data-act="view" data-view="meals">${ICONS.meals}Meals</button>
          <button class="rail-btn settings" data-act="settings" title="Settings">${ICONS.gear}Settings</button>
        </nav>
        <div class="main">
          ${this._renderHeader()}
          ${body}
          ${isCal ? this._renderChoreBar() : ""}
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
    this._homeSnap = this._homeSig();
    this._lockFrame();
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
