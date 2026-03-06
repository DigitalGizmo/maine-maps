# Plan: Responsive Image Area Layout (SPEC §4.4)

## Context

Section 4.4 of the spec defines a responsive layout system where the "image area" (OSD viewer + thumbnails below it) sizes itself according to:

- The map's **orientation** (vertical or horizontal), defined per MapSet in CMS
- The **aspect ratio** of the image area (enforced for all views in a set)
- Whether the viewport is in **portrait or landscape** mode (CSS media query)

This is the local-variable phase: orientation, aspect ratio, and max constraints are hardcoded in the component, to be moved to the API later.

---

## Key Rules from §4.4

|Mode|Orientation|Image Area Behavior|
|---|---|---|
|Portrait|Vertical|max-height (to leave room for text below); width derived from aspect ratio; left-justified|
|Portrait|Horizontal|Full width; height derived from aspect ratio; text fits naturally below|
|Landscape|Vertical|Full available height (minus header); width derived from aspect ratio|
|Landscape|Horizontal|max-width: ~40vw; height derived from aspect ratio; text beside at ~60vw|

In **landscape mode**, image area and text area sit **side by side** (flex row). In **portrait mode**, text is **below** the image area (stacked layout).

---

## Implementation Plan

### 1. Local layout variables in `MapPage.svelte`

Add these local variables near the top of the script (to be API-driven later):

```js
// Layout config — will come from API in a future phase
let mapOrientation = 'horizontal'; // 'vertical' | 'horizontal'
let aspectRatio = '4/3';           // CSS aspect-ratio value (e.g. '3/4' for vertical)
let portraitVerticalMaxHeight = '60vh';
let landscapeHorizontalMaxWidth = '40vw';
```

### 2. Image area CSS approach

Use CSS `aspect-ratio` on `.image-area` so it always maintains proportion. Use CSS custom properties (set via inline style on the container) to pass the local variables into the stylesheet.

```svelte
<div
  class="image-area"
  class:vertical={mapOrientation === 'vertical'}
  class:horizontal={mapOrientation === 'horizontal'}
  style="
    --aspect-ratio: {aspectRatio};
    --portrait-max-height: {portraitVerticalMaxHeight};
    --landscape-max-width: {landscapeHorizontalMaxWidth};
  "
>
```

### 3. MapPage layout structure

Wrap image area and text area in a flex container that switches direction based on orientation:

```svelte
<div class="map-layout">
  <div class="image-area ...">
    <!-- OSD viewer + thumbnails -->
  </div>
  <div class="text-area">
    <!-- interpretive text -->
  </div>
</div>
```

### 4. CSS rules in `MapPage.svelte` `<style>` block

```css
/* Default: portrait / stacked layout */
.map-layout {
  display: flex;
  flex-direction: column;
}

.image-area {
  aspect-ratio: var(--aspect-ratio);
  background-color: beige; /* dev aid */
}

/* Portrait + vertical map */
.image-area.vertical {
  max-height: var(--portrait-max-height);
  width: auto;
  align-self: flex-start; /* left-justify */
}

/* Portrait + horizontal map */
.image-area.horizontal {
  width: 100%;
}

/* Landscape: side-by-side layout */
@media (orientation: landscape) {
  .map-layout {
    flex-direction: row;
    align-items: stretch;
  }

  /* Vertical map: fill available height */
  .image-area.vertical {
    max-height: none;
    height: 100%;
    width: auto;
    align-self: stretch;
  }

  /* Horizontal map: constrained width so text fits beside */
  .image-area.horizontal {
    width: auto;
    max-width: var(--landscape-max-width);
  }

  .text-area {
    flex: 1;
    overflow-y: auto;
  }
}
```

### 5. OSD viewer sizing

The OSD container inside `.image-area` should fill its parent:

- `width: 100%` (already done)
- `height` should be the image area height minus the thumbnails row

The `height` local variable in `OpenSeadragonViewer.svelte` can stay as `'100%'` since `.image-area` now controls the overall size. The thumbnail strip below it will be its natural height.

This means the `.image-viewer` wrapper div (in MapPage) should use `flex: 1` or `height: calc(100% - thumbnail-height)` to fill remaining space.

---

## Files to Modify

- [MapPage.svelte](vscode-webview://1ibqhfh4n229egoc2uoiuf9slldstjjs5pm3tjnu7n7b9udnj73c/maine-maps/src/lib/MapPage.svelte) — primary changes (layout variables, flex container, CSS rules)
- [OpenSeadragonViewer.svelte](vscode-webview://1ibqhfh4n229egoc2uoiuf9slldstjjs5pm3tjnu7n7b9udnj73c/maine-maps/src/lib/OpenSeadragonViewer.svelte) — update height from `'70vh'` to `'100%'`
- [app.css](vscode-webview://1ibqhfh4n229egoc2uoiuf9slldstjjs5pm3tjnu7n7b9udnj73c/maine-maps/src/app.css) — remove or update any conflicting `.image-viewer` sizing rules

---

## Also: SPEC typo fixes to apply

Section 4.4 still has minor typos: "veiw" → "view", "mac vw" → "max vw", "proprotion" → "proportion", "image are div" → "image area div", "media querry" → "media query". These can be fixed quickly before or after the code changes.

---

## Verification

1. Run `npm run dev` in `maine-maps/`
2. Load a map page — image area should have a beige background
3. Resize browser to portrait: stacked layout, correct max-height or full-width behavior
4. Resize to landscape: side-by-side layout, text beside image
5. Toggle `mapOrientation` between `'vertical'` and `'horizontal'` to verify both cases
6. Confirm OSD still loads tiles and the viewer fills the image area correctly
### Done:
Done. Here's a summary of what changed:

**[MapPage.svelte](vscode-webview://1ibqhfh4n229egoc2uoiuf9slldstjjs5pm3tjnu7n7b9udnj73c/maine-maps/src/lib/MapPage.svelte)**

- Added 5 local layout variables (`mapOrientation`, `aspectRatio`, `portraitVerticalMaxHeight`, `landscapeHorizontalMaxWidth`, `landscapeVerticalHeight`)
- Wrapped image-area + text-area in a `.map-layout` flex container
- `.image-area` now has `class:vertical/horizontal` and inline CSS custom properties
- Added a `<style>` block with all responsive layout rules (portrait stacked by default, landscape side-by-side via `@media (orientation: landscape)`)
- `.image-viewer` gets `flex: 1; min-height: 0` so OSD fills image-area minus thumbnails

**[OpenSeadragonViewer.svelte](vscode-webview://1ibqhfh4n229egoc2uoiuf9slldstjjs5pm3tjnu7n7b9udnj73c/maine-maps/src/lib/OpenSeadragonViewer.svelte)**

- `height` changed from `'70vh'` to `'100%'`

**[app.css](vscode-webview://1ibqhfh4n229egoc2uoiuf9slldstjjs5pm3tjnu7n7b9udnj73c/maine-maps/src/app.css)**

- Removed `max-width: 1080px` and `background-color: antiquewhite` from `.image-viewer`
- Removed fixed `height: 30vh` from `.text-area`
