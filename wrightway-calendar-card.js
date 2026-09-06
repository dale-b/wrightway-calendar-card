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
  width: 42px; height: 42px;
  border-radius: 12px;
  background: #1c1917;
  color: #fff;
  font-weight: 700;
  font-size: 22px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
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
  padding: 14px 28px 10px 24px;
  gap: 16px;
  flex-shrink: 0;
}
.when {
  font-family: "Iowan Old Style", Palatino, "Palatino Linotype", Georgia, serif;
  font-size: clamp(28px, 3.2vw, 42px);
  font-weight: 600;
  letter-spacing: -0.02em;
  display: flex;
  align-items: baseline;
  gap: 14px;
  flex-wrap: wrap;
}
.when .time { font-size: 0.72em; font-weight: 500; color: #44403c; }
.wx { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 18px; }
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
.legend { display: flex; gap: 8px; flex-wrap: wrap; padding: 0 24px 10px; flex-shrink: 0; }
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
  margin: 0 24px 8px;
  background: #fde8e8;
  color: #9f1239;
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}
.grid-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 8px 8px 8px;
}
.dow {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  border-top: 1px solid var(--line);
}
.dow div {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  padding: 8px 0 6px;
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
  padding: 6px 6px 4px;
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
  margin-bottom: 4px;
  flex-shrink: 0;
}
.num {
  font-size: 14px;
  font-weight: 600;
  width: 26px;
  height: 26px;
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
.evs { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 3px; overflow: hidden; }
.ev {
  border-radius: 8px;
  padding: 2px 7px;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1c1917;
}
.more { font-size: 12px; font-weight: 700; color: var(--muted); padding: 2px 4px; }
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
  min-height: 280px;
}
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
  width: 64px; height: 64px;
  border-radius: 50%;
  background: var(--fab);
  color: #fff;
  border: 0;
  font-size: 36px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(37,99,235,.35);
}
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

const ICONS = {
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  lists: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  tasks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 13l4 4L19 7"/></svg>',
  meals: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 3v8a4 4 0 008 0V3M8 3v18M16 8v13M16 8s3-1 3-4-3-3-3-3"/></svg>',
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
  }

  setConfig(config) {
    this._cfg = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._timer) {
      this._timer = setInterval(() => {
        this._now = new Date();
        if (this.shadowRoot.activeElement && this.shadowRoot.activeElement.matches("input")) return;
        this._render();
      }, 30000);
      this._loadEvents();
      this._loadTodos();
      this._render();
      return;
    }
    const active = this.shadowRoot.activeElement;
    if (active && active.matches("input, textarea, select")) return;
    if (this._sheet && this._sheet.type === "add") return;
    this._render();
  }

  get hass() { return this._hass; }

  getCardSize() { return 16; }

  getGridOptions() {
    return { columns: "full", rows: 8, min_rows: 6 };
  }

  connectedCallback() {
    if (!this._bound) {
      this._bound = true;
      this.shadowRoot.addEventListener("click", (e) => this._onClick(e));
      this.shadowRoot.addEventListener("submit", (e) => {
        if (e.target.dataset && e.target.dataset.form === "add") this._onSubmit(e);
      });
      this.shadowRoot.addEventListener("change", (e) => this._onChange(e));
      this.shadowRoot.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.dataset && e.target.dataset.todoInput) {
          this._addTodo(e.target.dataset.todoInput, e.target.value);
        }
      });
    }
    this._render();
  }

  disconnectedCallback() {
    if (this._timer) clearInterval(this._timer);
  }

  _cals() {
    const raw = this._cfg.calendars || this._cfg.entities || [];
    return raw.map((c) => {
      if (typeof c === "string") return { entity: c, name: c, color: "#94a3b8" };
      return {
        entity: c.entity,
        name: c.name || c.entity,
        color: c.color || "#94a3b8",
      };
    }).filter((c) => c.entity);
  }

  _chores() {
    return (this._cfg.chores || []).filter((c) => c && c.entity);
  }

  _weather() {
    const id = this._cfg.weather;
    return id && this._hass ? this._hass.states[id] : null;
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

  async _addTodo(entity, text) {
    const item = (text || "").trim();
    if (!item || !this._hass) return;
    await this._hass.callService("todo", "add_item", { entity_id: entity, item });
    await this._loadTodos();
  }

  async _toggleTodo(entity, item) {
    const next = item.status === "completed" ? "needs_action" : "completed";
    await this._hass.callService("todo", "update_item", {
      entity_id: entity,
      item: item.summary,
      status: next,
    });
    await this._loadTodos();
  }

  async _setMeal(entity, value) {
    await this._hass.callService("input_text", "set_value", { entity_id: entity, value });
  }

  _onClick(e) {
    const t = e.target.closest("[data-act]");
    if (!t) return;
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
      const item = list.find((i) => i.uid === t.dataset.uid);
      if (item) this._toggleTodo(t.dataset.entity, item);
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
  }

  _onChange(e) {
    const t = e.target;
    if (t.dataset.meal) {
      this._setMeal(t.dataset.meal, t.value);
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
        </div>
      </div>`;
  }

  _renderLegend() {
    return `<div class="legend">${this._cals().map((c) => `
      <button class="chip ${this._hidden.has(c.entity) ? "off" : ""}" data-act="filter" data-entity="${esc(c.entity)}">
        <span class="dot" style="background:${esc(c.color)}"></span>${esc(c.name)}
      </button>`).join("")}</div>`;
  }

  _todayBanner() {
    const key = isoDay(this._now);
    const evs = this._eventsOn(key).filter((e) => {
      const t = eventTimeLabel(e);
      return t !== "All day";
    });
    if (!evs.length) return "";
    const first = evs[0];
    return `<div class="banner">${esc(first.summary || "Event")} today</div>`;
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
      const max = 3;
      const show = evs.length > max ? evs.slice(0, 2) : evs.slice(0, max);
      const extra = evs.length > max ? evs.length - 2 : 0;
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
      ${this._renderLegend()}
      ${this._todayBanner()}
      <div class="grid-wrap">
        <div class="dow">${WEEKDAYS.map((w) => `<div>${w}</div>`).join("")}</div>
        <div class="days">${cells.join("")}</div>
      </div>`;
  }

  _renderTodos(entity) {
    const items = this._todos[entity] || [];
    return `<ul class="todo">${items.map((it) => `
      <li>
        <input type="checkbox" data-act="todo-toggle" data-entity="${esc(entity)}" data-uid="${esc(it.uid)}" ${it.status === "completed" ? "checked" : ""}/>
        <span class="${it.status === "completed" ? "done" : ""}">${esc(it.summary)}</span>
      </li>`).join("")}</ul>
      <div class="add-row">
        <input data-todo-input="${esc(entity)}" placeholder="Add an item"/>
        <button data-act="todo-add" data-entity="${esc(entity)}">Add</button>
      </div>`;
  }

  _renderLists() {
    const shop = this._cfg.shopping;
    return `<div class="pane"><h2>Shopping list</h2>${shop ? this._renderTodos(shop) : "<p>No shopping list configured.</p>"}</div>`;
  }

  _renderTasks() {
    const chores = this._chores();
    return `<div class="pane"><h2>Family chores</h2>
      <div class="chore-grid">${chores.map((c) => `
        <div class="chore-col">
          <h3><span class="dot" style="background:${esc(c.color || "#aaa")}"></span>${esc(c.name)}</h3>
          ${this._renderTodos(c.entity)}
        </div>`).join("")}</div></div>`;
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

  _renderSheet() {
    if (!this._sheet) return "";
    if (this._sheet.type === "day") {
      const d = this._sheet.date;
      const key = isoDay(d);
      const evs = this._eventsOn(key);
      const label = `${MONTHS[d.getMonth()]} ${d.getDate()}`;
      return `<div class="overlay" data-act="close"><div class="dlg" onclick="event.stopPropagation()">
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
    return `<div class="overlay" data-act="close"><form class="dlg" data-form="add" onclick="event.stopPropagation()">
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
    const view = this._view;
    const body =
      view === "lists" ? this._renderLists()
        : view === "tasks" ? this._renderTasks()
          : view === "meals" ? this._renderMeals()
            : this._renderMonth();
    this.shadowRoot.innerHTML = `
      <style>${CSS}</style>
      <div class="app">
        <nav class="rail">
          <div class="logo">W</div>
          <button class="rail-btn ${view === "calendar" ? "active" : ""}" data-act="view" data-view="calendar">${ICONS.calendar}Calendar</button>
          <button class="rail-btn ${view === "lists" ? "active" : ""}" data-act="view" data-view="lists">${ICONS.lists}Lists</button>
          <button class="rail-btn ${view === "tasks" ? "active" : ""}" data-act="view" data-view="tasks">${ICONS.tasks}Tasks</button>
          <button class="rail-btn ${view === "meals" ? "active" : ""}" data-act="view" data-view="meals">${ICONS.meals}Meals</button>
        </nav>
        <div class="main">
          ${this._renderHeader()}
          ${body}
          <button class="fab" data-act="add" title="Add">+</button>
          ${this._renderSheet()}
        </div>
      </div>`;
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
