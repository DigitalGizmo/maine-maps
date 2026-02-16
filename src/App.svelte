<script>
  import { onMount } from 'svelte';
  import Home from './lib/Home.svelte';
  import MapPage from './lib/MapPage.svelte';

  let route = $state({ page: 'home', slug: null });

  function parseHash() {
    const hash = window.location.hash || '#/';
    const mapMatch = hash.match(/^#\/map\/([^/]+)/);
    if (mapMatch) {
      route = { page: 'map', slug: mapMatch[1] };
    } else {
      route = { page: 'home', slug: null };
    }
  }

  onMount(() => {
    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  });
</script>

{#if route.page === 'map'}
  <MapPage slug={route.slug} />
{:else}
  <Home />
{/if}
