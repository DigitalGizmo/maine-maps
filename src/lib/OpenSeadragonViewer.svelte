<script>
  import { onMount, onDestroy } from 'svelte';
  import OpenSeadragon from 'openseadragon';

  let { tileSource } = $props();

  let container;
  let viewer;

  onMount(() => {
    viewer = OpenSeadragon({
      element: container,
      tileSources: tileSource,
      prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@5/build/openseadragon/images/',
      showNavigationControl: true,
      maxZoomPixelRatio: 2,
    });
  });

  // React to tile source changes (view switching)
  $effect(() => {
    if (viewer && tileSource) {
      viewer.open(tileSource);
    }
  });

  onDestroy(() => {
    if (viewer) {
      viewer.destroy();
    }
  });
</script>

<div class="osd-container" bind:this={container}></div>

<style>
  .osd-container {
    width: 100%;
    height: 70vh;
  }
</style>
