<script>
  import { onMount } from 'svelte';
  import OpenSeadragonViewer from './OpenSeadragonViewer.svelte';
  import HamburgerMenu from './HamburgerMenu.svelte';

  let { slug } = $props();

  const API_BASE = import.meta.env.VITE_API_BASE;
  const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE;

  let mapset = $state(null);
  let aspectRatio = $derived(mapset?.aspect_ratio ?? '3/5');
  let aspectRatioNum = $derived(
    Number(aspectRatio.split('/')[0]) / Number(aspectRatio.split('/')[1])
  );
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
        Url: `${IMAGE_BASE}/tiles/${view.filename}_files/`,
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
      <a href="#/">Mapping Maine</a>
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
    style="--aspect-ratio: {aspectRatio}; --ar: {aspectRatioNum};"
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
                <img src="{IMAGE_BASE}/thumbs/{slug}_{view.ordinal}.jpg" alt="{view.ordinal === 1 ? 'Full Map' : (view.title || `View ${view.ordinal}`)}" />
                <span class="thumb-label">{view.ordinal === 1 ? 'Full Map' : (view.title || `View ${view.ordinal}`)}</span>
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
    display: grid;
    padding: 0;
    row-gap: 1rem;
    grid-template-areas:
      "header"
      "viewer"
      "text";
    grid-template-rows: 70px auto minmax(0, 24vh);
  }

  /* ── Header ── */
  .site-header {
    grid-area: header;
    display: flex;
    align-items: stretch;
    gap: 8vw;
  }

  .site-nav {
    display: flex;
    align-items: center;
    gap: 0.5em;
    background: #015F82;
    color: rgb(255, 255, 255);
    padding: 1rem 2em 1rem 1.25em;
    flex: 1;
    font-size: 1.5rem;
    font-weight: 600;
    clip-path: polygon(0 0, 100% 0, calc(100% - 24px) 100%, 0 100%);
  }

  .site-nav a {
    color: rgb(255, 255, 255);
    text-decoration: none;
  }

  .map-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #EC8923;
    color: rgb(255, 255, 255);
    padding: 1rem 2em;
    flex: 1;
    min-width: 0;
    clip-path: polygon(24px 0, 100% 0, calc(100% - 24px) 100%, 0 100%);
  }

  .map-nav a {
    color: rgb(255, 255, 255);
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
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    padding-left: 1em;
  }

  .image-area {
    aspect-ratio: var(--aspect-ratio);
    background-color: #2c2c2c;
    /* background-color: beige; */
    position: relative;
    overflow: hidden;
    height: min(70vh, calc((100vw - 120px) / var(--ar)));
    width: auto;
  }

  .viewer-fade {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.75s ease;
  }

  .viewer-fade.ready { opacity: 1; }

  /* ── Thumbnails ── */
  .thumbs {
    padding-left: 0.5em;
  }

  .thumbs ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
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
    position: relative;
    overflow: hidden;
  }

  .thumb-placeholder img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .thumb-label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.55);
    color: #EC8923;
    font-size: 0.65rem;
    text-align: center;
    line-height: 1.2;
    padding: 0.2em 0.25em;
  }

  /* ── Text panel ── */
  .text-panel {
    grid-area: text;
    overflow-y: auto;
    padding: 0 2rem 3rem 0;
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

  /* ── Mobile portrait (phones) ── */
  @media (max-width: 480px) {
    .map-page {
      grid-template-rows: 55px auto auto;
    }

    /* Prevent grid blowout: items must not expand beyond their track */
    .site-header,
    .viewer-panel,
    .text-panel {
      min-width: 0;
    }

    .site-header {
      gap: 4vw;
    }

    .site-nav {
      font-size: 1rem;
      padding: 0.4rem 1.5em 0.4rem 0.75em;
    }

    .map-nav {
      padding: 0.4rem 0.75em;
    }

    .map-nav a {
      font-size: 0.75rem;
    }

    .map-nav-current {
      font-size: 1.1rem;
    }

    .viewer-panel {
      padding-left: 0.5em;
    }

    .image-area {
      height: min(50vh, calc((100vw - 110px) / var(--ar)));
    }

    .text-panel {
      padding: 0 1rem 3rem 1rem;
      overflow-wrap: break-word;
    }

    .text-panel h2 {
      font-size: 1.5rem;
    }
  }

  /* ── Landscape: two-column grid ── */
  @media (min-aspect-ratio: 9/7) {
    .map-page {
      height: 100vh;
      overflow: hidden;
      grid-template-areas:
        "sitenav mapnav"
        "viewer  text";
      grid-template-columns: 60vw 37vw;
      grid-template-rows: 70px 1fr;
      column-gap: 3vw;
    }

    /* Header children become direct grid items */
    .site-header { display: contents; }
    .site-nav { grid-area: sitenav; flex: unset; width: 37vw; justify-self: start; align-self: stretch; }
    .map-nav  { grid-area: mapnav; align-self: stretch; }

    .viewer-panel {
      overflow: hidden;
    }

    .image-area {
      height: min(90vh, calc((60vw - 120px) / var(--ar)));
    }

    .text-panel {
      overflow-y: auto;
    }
  }
</style>
