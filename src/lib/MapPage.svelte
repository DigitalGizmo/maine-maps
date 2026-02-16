<script>
  import { onMount } from 'svelte';
  import OpenSeadragonViewer from './OpenSeadragonViewer.svelte';

  let { slug } = $props();

  const API_BASE = 'http://localhost:8000/api';
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
  let defaultView = $derived(mapset?.views?.find(v => v.ordinal === 1));
  let detailViews = $derived(mapset?.views?.filter(v => v.ordinal > 1) ?? []);

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
  <h1>Maps of Maine</h1>

  {#if error}
    <p class="error">Failed to load map: {error}</p>
  {:else if !mapset}
    <p>Loading...</p>
  {:else}
    <h2>{mapset.title}</h2>
    <div class="image-viewer">
      {#key activeView?.id}
        {#if tileSource}
          <OpenSeadragonViewer {tileSource} {crop} />
        {/if}
      {/key}
    </div>
    <div class="text">
      <ul>
        {#if defaultView}
          <li>
            <button class:active={activeView === defaultView}
               onclick={() => selectView(defaultView)}>
              Full view
            </button>
          </li>
        {/if}
        {#each detailViews as view}
          <li>
            <button class:active={activeView === view}
               onclick={() => selectView(view)}>
              {view.caption || `Detail ${view.ordinal}`}
            </button>
          </li>
        {/each}
      </ul>

      {#if activeView?.interpretive_text}
        <div class="interpretive-text">
          {@html activeView.interpretive_text}
        </div>
      {:else}
        <h3>Text Subhead</h3>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
          cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .map-page {
    padding: 2em;
  }

  .image-viewer {
    max-width: 1080px;
  }

  .text {
    max-width: 1080px;
    padding-bottom: 4em;
  }

  .text ul {
    list-style-type: none;
    padding-left: 0;
  }

  .text ul li {
    display: inline;
    padding-right: 2em;
  }

  .text button {
    background: none;
    border: none;
    color: yellow;
    font: inherit;
    cursor: pointer;
    padding: 0;
    text-decoration: none;
  }

  .text button.active {
    text-decoration: underline;
  }

  .error {
    color: #ff6b6b;
  }
</style>
