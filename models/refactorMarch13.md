Here's what I see as simplifiable:

1. **The `.map-page.horizontal` grid variant is redundant** — both landscape orientations can share one grid template using a `panel` area. The `panel` spans all rows on the right, and `.map-right` overrides its `display: contents` to become that flex panel. This eliminates ~18 lines.
2. **`aspect-ratio` is redundant** on `.image-area.vertical` in landscape — it's already on `.image-area` in the base rule.
3. **`grid-column-gap`** → `column-gap` (non-prefixed).
4. **`class:horizontal` on `.map-page`** can go away since there'd be no `.map-page.horizontal` rules left.

The key insight: instead of two different landscape grid templates (one for vertical, one for horizontal maps), use one grid with `"viewer panel" / "thumbs panel" / ". panel"`, and in landscape always make `.map-right` a flex column panel. Let me apply it:

**Edit** [MapPage.svelte](vscode-webview://1ibqhfh4n229egoc2uoiuf9slldstjjs5pm3tjnu7n7b9udnj73c/index.html?id=b54d41fc-437f-4cc0-b876-28a5b0f2de58&parentId=1&origin=06e0eea6-5b02-4217-8393-c161f872cce3&swVersion=4&extensionId=Anthropic.claude-code&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView&session=c1d66c66-1840-432a-8c1e-48f708c74573#)

Modified

Good — the diagnostics confirm those selectors are now dead. Now let me rewrite the style block:

**Edit** [MapPage.svelte](vscode-webview://1ibqhfh4n229egoc2uoiuf9slldstjjs5pm3tjnu7n7b9udnj73c/index.html?id=b54d41fc-437f-4cc0-b876-28a5b0f2de58&parentId=1&origin=06e0eea6-5b02-4217-8393-c161f872cce3&swVersion=4&extensionId=Anthropic.claude-code&platform=electron&vscode-resource-base-authority=vscode-resource.vscode-cdn.net&parentOrigin=vscode-file%3A%2F%2Fvscode-app&purpose=webviewView&session=c1d66c66-1840-432a-8c1e-48f708c74573#)

Removed 15 lines



Here's what changed and why:

**Removed `class:horizontal` from `.map-page`** — it was only needed for the `.map-page.horizontal` CSS variant, which is gone.

**Unified the landscape grid** — instead of two different grid templates (one for vertical maps using `headers`/`text`, one for horizontal using `panel`), both orientations now use the same single template:



```
"viewer  panel"
"thumbs  panel"
".       panel"
```

**`.map-right` always becomes the panel in landscape** — overriding `display: contents` to `display: flex; grid-area: panel`. Headers and text flow naturally inside it as flex items. No orientation condition needed.

**Removed redundant `aspect-ratio`** from `.image-area.vertical` in landscape — it's already on the base `.image-area` rule.

**`grid-column-gap` → `column-gap`** — modern unprefixed property.

Net result: ~18 lines removed, the orientation-conditional grid switch is gone entirely.