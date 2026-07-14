<script>
  import { onMount, onDestroy } from 'svelte';
  import OpenSeadragon from 'openseadragon';

  let { tileSource, crop = null, onOpen = null } = $props();

  let container;
  let viewer;

  function applyCrop() {
    if (!viewer || !crop) return;
    // Convert pixel coordinates to OSD viewport coordinates.
    // OSD normalizes by image width: full width = 1.0
    const imageWidth = crop.imageWidth;
    const rect = new OpenSeadragon.Rect(
      crop.x / imageWidth,
      crop.y / imageWidth,
      crop.width / imageWidth,
      crop.height / imageWidth,
    );
    viewer.viewport.fitBounds(rect, true);
  }

  onMount(() => {
    viewer = OpenSeadragon({
      element: container,
      tileSources: tileSource,
      prefixUrl: `${import.meta.env.BASE_URL}images/osd-images/`,
      showNavigationControl: true,
      controlsFadeDelay: Infinity,
      maxZoomPixelRatio: 2,
      visibilityRatio: 1,
      constrainDuringPan: true,
      minZoomImageRatio: 1,
    });

    viewer.addHandler('open', () => {
      if (crop) applyCrop();
      onOpen?.();
    });
  });

  // React to tile source changes (view switching).
  // Read tileSource first to ensure the dependency is always established
  // (JS && short-circuits, so `viewer && tileSource` would skip tracking
  // tileSource when viewer is undefined on the first run before onMount).
  $effect(() => {
    const ts = tileSource;
    if (viewer && ts) {
      viewer.open(ts);
    }
  });

  onDestroy(() => {
    if (viewer) {
      viewer.destroy();
    }
  });
</script>

<div bind:this={container} style="width: 100%; height: 100%;"></div>

<style>
  :global(.openseadragon-container div[title]) {
    transform: scale(1.4);
    transform-origin: top left;
  }
  :global(.openseadragon-container div[title] *) {
    opacity: 0.75 !important;
  }
</style>
