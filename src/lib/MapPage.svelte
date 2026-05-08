<script>
  import { onMount } from 'svelte';
  import OpenSeadragonViewer from './OpenSeadragonViewer.svelte';
  import HamburgerMenu from './HamburgerMenu.svelte';

  let { slug } = $props();

  let portraitVerticalMaxHeight   = '70vh';
  let portraitHorizontalMaxWidth  = '90vw';
  let landscapeVerticalMaxHeight  = '90vh';
  let thumbnailHeightLandscape    = '8vh';

  const API_BASE = import.meta.env.VITE_API_BASE;
  const TILES_BASE = import.meta.env.VITE_TILES_BASE;

  let mapset = $state(null);
  let mapOrientation = $derived(mapset?.map_orientation ?? 'vertical');
  let aspectRatio = $derived(mapset?.aspect_ratio ?? '3/5');
  let activeView = $state(null);
  let error = $state(null);

  let allMaps = $state([]);
  let currentIndex = $derived(allMaps.findIndex(m => m.slug === slug));
  let prevMap = $derived(currentIndex > 0 ? allMaps[currentIndex - 1] : null);
  let nextMap = $derived(currentIndex !== -1 && currentIndex < allMaps.length - 1 ? allMaps[currentIndex + 1] : null);
  let prevSlug = $derived(prevMap?.slug ?? null);
  let nextSlug = $derived(nextMap?.slug ?? null);

  function buildTileSource(view) {
    return {
      Image: {
        xmlns: 'http://schemas.microsoft.com/deepzoom/2008',
        Url: `${TILES_BASE}/${view.filename}_files/`,
        Format: 'jpeg',
        Overlap: '1',
        TileSize: '512',
        Size: {
          Width: String(view.image_width),
          Height: String(view.image_height),
        }
      }
    };
  }

  let tileSource = $derived(activeView ? buildTileSource(activeView) : null);
  let crop = $derived(activeView?.is_crop ? {
    x: activeView.crop_x,
    y: activeView.crop_y,
    width: activeView.crop_width,
    height: activeView.crop_height,
    imageWidth: activeView.image_width,
  } : null);

  let osdReady = $state(false);

  function onOpen() { osdReady = true; }

  $effect(() => {
    activeView; // reset whenever activeView changes
    osdReady = false;
  });

  function selectView(view) {
    activeView = view;
  }

  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }

  function handleTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && nextSlug) window.location.hash = `#/map/${nextSlug}`;
      else if (dx > 0 && prevSlug) window.location.hash = `#/map/${prevSlug}`;
    }
  }

  onMount(async () => {
    try {
      const listRes = await fetch(`${API_BASE}/maps/`);
      allMaps = await listRes.json();
    } catch (e) {
      // allMaps stays empty; prev/next won't show
    }
  });

  $effect(() => {
    const currentSlug = slug;
    mapset = null;
    activeView = null;
    error = null;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/maps/${currentSlug}/`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        mapset = data;
        activeView = data.views.find(v => v.ordinal === 1);
      } catch (e) {
        error = e.message;
      }
    })();
  });
</script>

<div class="map-page"
  role="region"
  aria-label="Map viewer"
  ontouchstart={handleTouchStart}
  ontouchend={handleTouchEnd}
>

  {#if error}
    <p class="error">Failed to load map: {error}</p>
  {:else if !mapset}
    <p>Loading...</p>
  {:else}

  <header class="site-header">
    <div class="site-nav">
      <HamburgerMenu maps={allMaps} />
      <a href="#/">Maps of Maine</a>
    </div>
    <div class="map-nav">
      {#if prevMap}
        <a href="#/map/{prevSlug}" class="map-nav-prev">← Previous: {prevMap.date}</a>
      {:else}
        <span class="map-nav-prev map-nav-inactive"></span>
      {/if}
      <span class="map-nav-current">{mapset.date}</span>
      {#if nextMap}
        <a href="#/map/{nextSlug}" class="map-nav-next">Next: {nextMap.date} →</a>
      {:else}
        <span class="map-nav-next map-nav-inactive"></span>
      {/if}
    </div>
  </header>

  <div
    class="viewer-panel"
    class:vertical={mapOrientation === 'vertical'}
    class:horizontal={mapOrientation === 'horizontal'}
    style="
      --aspect-ratio: {aspectRatio};
      --portrait-max-height: {portraitVerticalMaxHeight};
      --portrait-max-width: {portraitHorizontalMaxWidth};
      --landscape-vertical-height: {landscapeVerticalMaxHeight};
      --thumbnail-height-landscape: {thumbnailHeightLandscape};
    "
  >
    <div
      class="image-area"
      role="application"
      ontouchstart={(e) => e.stopPropagation()}
      ontouchend={(e) => e.stopPropagation()}
    >
      {#if tileSource}
        <div class="viewer-fade" class:ready={osdReady}>
          <OpenSeadragonViewer {tileSource} {crop} {onOpen} />
        </div>
      {/if}
    </div>

    <div class="thumbs">
      <ul>
        {#each mapset.views as view}
          <li class:active={activeView?.id === view.id}>
            <button onclick={() => selectView(view)}>
              <div class="thumb-placeholder">
                <span class="thumb-label">{view.title || `View ${view.ordinal}`}</span>
              </div>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="text-panel" class:ready={osdReady}>
    <h2>{mapset.date}: {mapset.title}</h2>
    {#if mapset.credit}
      <div class="credit">{@html mapset.credit}</div>
    {/if}
    {#if activeView.title}
      <h3>{activeView.title}</h3>
    {/if}
    <div class="interpretive">{@html activeView.interpretive_text}</div>
  </div>

  {/if}
</div><!-- /map-page -->

<style>
  /* ── Portrait (default): single-column grid ── */
  .map-page {
    --left-margin: 2em;
    display: grid;
    padding: 0;
    grid-template-areas:
      "header"
      "viewer"
      "text";
    grid-template-rows: 90px auto minmax(0, 24vh);
  }

  /* ── Header ── */
  .site-header {
    grid-area: header;
    display: flex;
    align-items: flex-start;
    gap: 8vw;
  }

  .site-nav {
    display: flex;
    align-items: center;
    gap: 0.5em;
    background: #015F82;
    color: white;
    padding: 1rem 2em 1rem 1.25em;
    flex: 1;
    font-size: 1.5rem;
    font-weight: 600;
    clip-path: polygon(0 0, 100% 0, calc(100% - 24px) 100%, 0 100%);
  }

  .site-nav a {
    color: white;
    text-decoration: none;
  }

  .map-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #EC8923;
    color: white;
    padding: 1rem 2em;
    flex: 1;
    min-width: 0;
    clip-path: polygon(24px 0, 100% 0, calc(100% - 24px) 100%, 0 100%);
  }

  .map-nav a {
    color: white;
    text-decoration: none;
    font-size: 1.2rem;
    font-weight: 400;
  }

  .map-nav a:hover {
    text-decoration: underline;
  }

  .map-nav-current {
    font-size: 1.75rem;
    font-weight: 700;
  }

  .map-nav-inactive {
    visibility: hidden;
    width: 8em;
  }

  /* ── Viewer panel ── */
  .viewer-panel {
    grid-area: viewer;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: var(--left-margin);
  }

  .image-area {
    aspect-ratio: var(--aspect-ratio);
    background-color: beige;
    position: relative;
    overflow: hidden;
  }

  .viewer-fade {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.75s ease;
  }

  .viewer-fade.ready { opacity: 1; }

  /* Portrait + vertical: constrain height */
  .viewer-panel.vertical .image-area {
    height: var(--portrait-max-height);
    width: auto;
  }

  /* Portrait + horizontal: constrain width */
  .viewer-panel.horizontal .image-area {
    width: var(--portrait-max-width);
    height: auto;
  }

  /* ── Thumbnails ── */
  .thumbs ul {
    list-style: none;
    padding: 0;
    margin: 0.5em 0 0;
    display: flex;
    flex-direction: row;
    gap: 1px;
  }

  .thumbs ul li {
    width: 90px;
    height: 90px;
    background-color: #444;
    border: 2px solid transparent;
    flex-shrink: 0;
  }

  .thumbs ul li.active {
    border-color: #EC8923;
  }

  .thumbs button {
    width: 100%;
    height: 100%;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: block;
  }

  .thumb-placeholder {
    width: 100%;
    height: 100%;
    background-color: #555;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .thumb-label {
    color: yellow;
    font-size: 0.75rem;
    text-align: center;
    line-height: 1.2;
    padding: 0.25em;
  }

  /* ── Text panel ── */
  .text-panel {
    grid-area: text;
    overflow-y: auto;
    padding: 0.75em 0 0.75em var(--left-margin);
    opacity: 0;
    transition: opacity 0.75s ease;
  }

  .text-panel.ready { opacity: 1; }

  .text-panel h2 {
    font-size: 2.25rem;
    font-weight: 600;
    margin: 0 0 0.25em;
    line-height: 1.1;
  }

  .credit {
    font-style: italic;
    font-size: 0.9rem;
    color: #ccc;
    margin-bottom: 1em;
    line-height: 1.4;
  }

  .text-panel h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0.5em 0 0.25em;
  }

  .interpretive {
    font-size: 1.1rem;
    line-height: 1.5;
  }

  /* ── Landscape: two-column grid ── */
  @media (orientation: landscape) {
    .map-page {
      height: 100vh;
      overflow: hidden;
      grid-template-areas:
        "sitenav mapnav"
        "viewer  text";
      grid-template-columns: 60vw 37vw;
      grid-template-rows: 90px 1fr;
      column-gap: 3vw;
    }

    /* Header children become direct grid items */
    .site-header { display: contents; }
    .site-nav { grid-area: sitenav; flex: unset; width: 37vw; justify-self: start; align-self: start; }
    .map-nav  { grid-area: mapnav; align-self: start; }

    .viewer-panel {
      overflow: hidden;
    }

    /* Landscape + vertical: thumbnails to the right of the image */
    .viewer-panel.vertical {
      flex-direction: row;
      align-items: flex-start;
      justify-content: center;
    }

    .viewer-panel.vertical .image-area {
      height: var(--landscape-vertical-height);
      width: auto;
      flex-shrink: 0;
    }

    .viewer-panel.vertical .thumbs {
      padding-left: 0.5em;
    }

    .viewer-panel.vertical .thumbs ul {
      flex-direction: column;
      margin: 0;
    }

    /* Landscape + horizontal: full column width, thumbnails below */
    .viewer-panel.horizontal .image-area {
      width: 60vw;
      height: auto;
    }

    .text-panel {
      overflow-y: auto;
    }
  }
</style>
