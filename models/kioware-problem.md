---
created: 2026-07-13
type: working
status: active
mode: work
area: msm
parent: maps
related:
topics:
issue:
tags:
priority: normal
---
# [[kioware-problem]]
[[hub-maps]]
## KioWare White-Screen Issue — Status (as of 2026-07-13)

**Problem:** Museum kiosk app (Svelte, non-Kit, uses OpenSeadragon for zoomable image tiles) shows a white screen in KioWare on Windows. Two other Svelte apps in the same project (no OpenSeadragon) run fine in KioWare with the same dev setup.

**Ruled out:**

- `file://` protocol — not in use; KioWare serves via its own local server
- Image/tile payload size — tested with tile sets removed (still white screen) and fully restored (still white screen) under KioWare
- App code / OpenSeadragon itself — confirmed working, including zoom/pan, when the exact same `dist` folder is served via a different local HTTP server
- IIS as that alternate server — hit persistent 401.3 NTFS permission errors that couldn't be resolved via ACL edits on IIS_IUSRS

**Confirmed root cause:** KioWare's built-in local file server fails to serve this app correctly. A minimal PowerShell (`System.Net.HttpListener`) static server serving the identical `dist` folder works perfectly — including when KioWare itself is pointed at `http://localhost:8080/` instead of its own internal serving mechanism.

**Leading hypothesis:** KioWare's built-in server mishandles either:

- MIME types for tile-related file extensions (`.dzi`, etc.), or
- The volume/pattern of concurrent small requests OpenSeadragon fires when loading tiles

**Decision:** Not adopting the "external local server" workaround for production — too fragile/complex for museum staff to maintain (would require a persistent background process via Scheduled Task or a wrapped service like NSSM, with no simple failure recovery). Instead, escalating to KioWare support with a written repro summary (see conversation) to get either a config fix or an official supported path.

**Next steps:**

1. Awaiting response from KioWare support
2. If KioWare can't resolve it: reconsider a supported local server option (IIS, once the 401.3 permissions issue is solved) as the sanctioned deployment method instead of a workaround
3. Confirm with KioWare support whether "point at external URL" is an intended/supported configuration vs. serving local folders directly — may be the officially correct approach for apps like this regardless of the bug

## Summary for tech support
---

**Issue:** One of three local Svelte (non-Kit) web apps fails to load in KioWare — shows a white screen, including on screens with no OpenSeadragon content (attract screen, home menu). The other two apps, built with the same dev environment, load fine.

**What's been ruled out:**

- Not a `file://` protocol issue — content loads via KioWare's local server, not direct file access
- Not image/asset size — tested with tile sets removed (white screen persisted) and fully restored (still white screen persisted under KioWare)
- Not the app code or asset payload — same dist folder loads and functions correctly (including OpenSeadragon zoom/pan) when served via a separate local HTTP server (tested via PowerShell `HttpListener` script) and accessed either directly or through KioWare pointed at that external localhost URL

**Conclusion:** The problem appears to be specific to KioWare's built-in local file-serving mechanism when handling this app's assets — likely related to either MIME type handling for tile/image files (OpenSeadragon `.dzi` and related formats) or the volume/pattern of concurrent small file requests OpenSeadragon generates. A generic HTTP server handles the same files without issue.

**Ask:** What are the known limitations of KioWare's built-in server regarding MIME types, concurrent requests, or file count/size, and is there a supported configuration fix (rather than routing through an external server)?
### Next Actions
- [x] try without attract mode -- doesn't help
- [ ] try working directly in claude code with these notes
- [ ] #task contact kioware support ⏫ 