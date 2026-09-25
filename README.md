# WrightWay

The family kitchen wall for Home Assistant. One card is the whole screen: calendar, chores, shopping, meals, home control, cameras and a photo screensaver.

Month and week views, a Today and Tomorrow column, tonight's dinner, a live camera, and each person's chores along the bottom. Warm and light by day, a low dark look in the evening. Built for a 21.5" landscape panel (1920×1080) running Fully Kiosk; it also works on an iPad.

## Install

**HACS (custom repository)**

1. HACS → ⋮ → Custom repositories
2. URL: `https://github.com/dale-b/wrightway-calendar-card`
3. Category: **Dashboard** (Lovelace)
4. Download, then reload the browser

**Manual (recommended for a wall panel)**

Copy `wrightway-calendar-card.js` and the `fonts/` folder into `/config/www/wrightway/`, then add a Lovelace resource:

```
url: /local/wrightway/wrightway-calendar-card.js
type: module
```

Served from Home Assistant, the wall keeps working when the internet is down. The card looks for its font in a `fonts/` folder next to itself, and falls back to the system font if it isn't there.

## Configuration

On a 21" landscape panel the month sits left with the live camera and scenes on the right. Today's chores take the bottom of the screen — tap a row to check it off. The gear opens chore setup for each person, with repeats on days of the week, every other day, or every few days. Shop keeps the family grocery list here and can open the Walmart app on the tablet. After idle, a photo slideshow fills the screen (person pictures, or `photos:` URLs).

```yaml
type: custom:wrightway-calendar-card
weather: weather.forecast_wrightway
camera: camera.g6_bullet_high_resolution_channel
camera_alert: binary_sensor.driveway_vehicle_detected_2
walmart: https://www.walmart.com/shop
idle_seconds: 90
scenes:
  - entity: input_button.kitchen_scene_cooking
    name: Cooking
calendars:
  - entity: calendar.dale
    name: Dale
    color: "#6BA3D6"
  - entity: calendar.laura
    name: Laura
    color: "#7CBC98"
shopping: todo.shopping_list
chores:
  - entity: todo.dale_chores
    name: Dale
    color: "#6BA3D6"
meals:
  monday: input_text.meal_monday
  tuesday: input_text.meal_tuesday
  wednesday: input_text.meal_wednesday
  thursday: input_text.meal_thursday
  friday: input_text.meal_friday
  saturday: input_text.meal_saturday
  sunday: input_text.meal_sunday
```

House helpers (cat litter sensor, dishwasher clean, washer done, trash, homework) can be bound with `house_chores`. `mode: done` means the helper is **on** after the job is finished. `mode: due` means the helper is **on** when the machine needs emptying. When a sensor finishes a chore on its own, the wall shows it checked off for the rest of the day. When the sensor says it's due again, it comes back.

Chores checked off today stay on the wall with a tick until midnight, and every check-off has an Undo.

```yaml
house_chores:
  - helper: input_boolean.cat_litter_has_been_done
    name: Cat litter
    who: Dale
    mode: done
```

Use a **Panel** view with this as the only card so the month grid can use the full 1920×1080 kitchen display.

Optional extras:

```yaml
greeting_name: Wrights          # "Good evening, Wrights"
people:                         # photo avatars; matched by name automatically when omitted
  Dale: person.dale_bromenshenkel
ai_task: ai_task.claude         # meal planning; the first ai_task entity is used when omitted
meal_notes: No mushrooms.       # also editable on the wall
```

## Shopping and Walmart

Walmart has no public cart API, but it does accept an add-to-cart link built from product numbers. Tap **Link** beside a grocery item, find the product on Walmart, tap Share, then Copy link, and paste it in. The wall remembers that product. The next time that item is on the list, **Send to my Walmart cart** puts everything linked into the cart in one tap. Items added from a phone pick up products the wall already knows.

## Meals

Type dinner on any day. Each day shows that evening's plans from the calendar, so it's clear which nights need something quick. **Plan my week** uses Home Assistant's AI Task (add the Anthropic, OpenAI or Google Gemini integration). It plans around busy nights and family favorites, and can add the groceries to the list.

## Screensaver photos

After the panel sits idle, family photos fill the screen with the time, date and what's up next. With no photos yet, a calm clock takes their place. Tap to come back; the wall returns to today's calendar. **Photos** on the left starts the slideshow straight away.

**Best way to add pictures**

1. Export from your phone as **JPEG**, landscape if you can, around **1920×1080**. Avoid HEIC (Android WebView often will not show it).
2. In Home Assistant: **Media → My media**. Create a folder named **`family`**.
3. Upload the JPEGs there. The wall panel picks them up automatically (`photo_folder: family` is the default).

You can also list URLs, including files in `/config/www/`:

```yaml
photos:
  - /local/family/beach.jpg
  - /local/family/kitchen.jpg
photo_folder: family
idle_seconds: 90
```

On the tablet: **Settings → Display** sets how long until the screensaver, how long each photo stays, and whether Fully Kiosk should sleep the backlight after that (never, 5/15/30 minutes, or only in the evening). Photos crossfade. Keep Fully Kiosk’s own screensaver **off** so these two do not fight.

### iCloud / Apple Photos

The private Photos library cannot be read (Apple does not allow that). A **Shared Album** can:

1. In Photos, create an album (or use one you already have).
2. Share it as a **Shared Album**, then turn on **Public Website**.
3. Copy the link (`icloud.com/sharedalbum/#…` or `photos.icloud.com/shared/album/…`).
4. Paste it in **Settings → Display → iCloud shared album**, or in YAML:

```yaml
icloud_album: https://www.icloud.com/sharedalbum/#B0xxxxxxxx
```

If the tablet’s browser is blocked from talking to iCloud (common), keep the same pictures in **Media → family** as well.
