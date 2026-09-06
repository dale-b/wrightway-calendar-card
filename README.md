# WrightWay Calendar Card

A Skylight-inspired family calendar for Home Assistant wall tablets.

Month view fills the screen so every week of the month is visible. Tap a day to see events and add one. Color-coded people, weather, chores, meals, and a shopping list live in the same interface.

## Install

**HACS (custom repository)**

1. HACS → ⋮ → Custom repositories
2. URL: `https://github.com/dale-b/wrightway-calendar-card`
3. Category: **Dashboard** (Lovelace)
4. Download, then reload the browser

**Manual**

Add a Lovelace resource:

```
url: /hacsfiles/wrightway-calendar-card/wrightway-calendar-card.js
type: module
```

Or load from jsDelivr after publishing.

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

House helpers (cat litter sensor, dishwasher clean, washer done, trash, homework) can be bound with `house_chores`. `mode: done` means the helper is **on** after the job is finished. `mode: due` means the helper is **on** when the machine needs emptying.

```yaml
house_chores:
  - helper: input_boolean.cat_litter_has_been_done
    name: Cat litter
    who: Dale
    mode: done
```

Use a **Panel** view with this as the only card so the month grid can use the full 1920×1080 kitchen display.
