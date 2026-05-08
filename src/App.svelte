<script>
  import { onMount, setContext } from 'svelte';
  import Home from './lib/Home.svelte';
  import MapPage from './lib/MapPage.svelte';
  import Attract from './lib/Attract.svelte';

  const isKiosk = import.meta.env.VITE_KIOSK === 'true';
  setContext('isKiosk', isKiosk);

  let route = $state({ page: isKiosk ? 'attract' : 'home', slug: null });

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
    // In kiosk mode don't parse the hash on load — start on attract screen
    if (!isKiosk) parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  });
</script>

{#if route.page === 'attract'}
  <Attract onBegin={() => { route = { page: 'home', slug: null }; }} />
{:else if route.page === 'map'}
  <MapPage slug={route.slug} />
{:else}
  <Home />
{/if}
