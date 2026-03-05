<script>
  import { onMount } from 'svelte';
  import OpenSeadragonViewer from './OpenSeadragonViewer.svelte';

  let { slug } = $props();

  const API_BASE = import.meta.env.VITE_API_BASE;
  const TILES_BASE = 'https://assets.digitalgizmo.com/maine-maps/tiles';

  let mapset = $state(null);
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

<div class="map-page">
  <h1><a href="#/">Maps of Maine</a></h1><!-- site title -->

  {#if error}
    <p class="error">Failed to load map: {error}</p>
  {:else if !mapset}
    <p>Loading...</p>
  {:else}
  <h2>{mapset.title}</h2><!-- map title -->
  <div class="image-area">

    <div class="image-viewer"><!-- image viewer-->
      {#key activeView?.id}
        {#if tileSource}
          <OpenSeadragonViewer {tileSource} {crop} />
        {/if}
      {/key}
    </div>
    
    <div class="detail-thms">
      <ul><!-- detail thumbnails -->
        {#each mapset.views as view}
          <li class:active={activeView === view}>
            <button
              onclick={() => selectView(view)}>
              {view.caption || `View ${view.ordinal}`}
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="text-area">
    <h2>This is the subhead</h2>
      {@html activeView.interpretive_text}
  </div>
  {/if}
</div><!-- /map-page -->
