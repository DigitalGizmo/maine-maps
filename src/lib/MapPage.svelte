<script>
  import { onMount } from 'svelte';
  import OpenSeadragonViewer from './OpenSeadragonViewer.svelte';

  let { slug } = $props();

  let portraitVerticalMaxHeight   = '70vh';
  let portraitHorizontalMaxWidth  = '90vw';
  let landscapeVerticalMaxHeight  = '90vh';
  let landscapeHorizontalMaxWidth = '50vw';
  let thumbnailHeightLandscape    = '8vh';

  const API_BASE = import.meta.env.VITE_API_BASE;
  const TILES_BASE = 'https://assets.digitalgizmo.com/maine-maps/tiles';

  let mapset = $state(null);
  let mapOrientation = $derived(mapset?.map_orientation ?? 'vertical');
  let aspectRatio = $derived(mapset?.aspect_ratio ?? '3/5');
  let activeView = $state(null);
  let error = $state(null);

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

  function selectView(view) {
    activeView = view;
  }

  onMount(async () => {
    try {
      const res = await fetch(`${API_BASE}/maps/${slug}/`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      mapset = await res.json();
      activeView = mapset.views.find(v => v.ordinal === 1);
    } catch (e) {
      error = e.message;
    }
  });
</script>

<div class="map-page" style="--thumbnail-height-landscape: {thumbnailHeightLandscape};">

  {#if error}
    <p class="error">Failed to load map: {error}</p>
  {:else if !mapset}
    <p>Loading...</p>
  {:else}

  <div class="map-headers">
    <h1><a href="#/">Maps of Maine</a></h1>
    <h2>{mapset.title}</h2>
  </div>

  <div
    class="image-area"
    class:vertical={mapOrientation === 'vertical'}
    class:horizontal={mapOrientation === 'horizontal'}
    style="
      --aspect-ratio: {aspectRatio};
      --portrait-max-height: {portraitVerticalMaxHeight};
      --portrait-max-width: {portraitHorizontalMaxWidth};
      --landscape-vertical-height: {landscapeVerticalMaxHeight};
      --landscape-max-width: {landscapeHorizontalMaxWidth};
    "
  >
    {#key activeView?.id}
      {#if tileSource}
        <OpenSeadragonViewer {tileSource} {crop} />
      {/if}
    {/key}
  </div>

  <div class="thumbs">
    <ul>
      {#each mapset.views as view}
        <li class:active={activeView === view}>
          <button onclick={() => selectView(view)}>
            {view.caption || `View ${view.ordinal}`}
          </button>
        </li>
      {/each}
    </ul>
  </div>

  <div class="text-area">
    {@html activeView.interpretive_text}
  </div>

  {/if}
</div><!-- /map-page -->

<style>
  /* ── Portrait (default): single-column grid ── */
  .map-page {
    display: grid;
    grid-template-areas:
      "headers"
      "viewer"
      "thumbs"
      "text";
    grid-template-rows: 6vh auto auto minmax(0, 24vh);
  }

  .map-headers { grid-area: headers; }
  .image-area  { grid-area: viewer; aspect-ratio: var(--aspect-ratio); background-color: beige; }
  .thumbs      { grid-area: thumbs; }
  .text-area   { grid-area: text; overflow-y: auto; }

  /* Portrait + vertical: constrain height, derive width from aspect-ratio */
  .image-area.vertical {
    height: var(--portrait-max-height);
    width: auto;
    align-self: start;
    justify-self: start;
  }

  /* Portrait + horizontal: constrain width, derive height from aspect-ratio */
  .image-area.horizontal {
    width: var(--portrait-max-width);
    height: auto;
  }

  /* ── Landscape: two-column grid, full viewport height ── */
  @media (orientation: landscape) {
    .map-page {
      height: 100vh;
      overflow: hidden;
      grid-template-columns: 60vw 40vw;
      grid-template-rows: auto 1fr var(--thumbnail-height-landscape, 8vh);
      grid-template-areas:
        "viewer  headers"
        "viewer  text"
        "thumbs  text";
    }

    /* Let the grid control viewer dimensions; OSD fills the container */
    .image-area,
    .image-area.vertical,
    .image-area.horizontal {
      aspect-ratio: unset;
      align-self: stretch;
      justify-self: stretch;
      height: auto;
      width: auto;
    }

    .thumbs {
      align-self: start;
    }

    .text-area {
      overflow-y: auto;
    }
  }
</style>
