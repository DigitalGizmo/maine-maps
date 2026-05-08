<script>
  import { onMount, setContext } from 'svelte';
  import Home from './lib/Home.svelte';
  import MapPage from './lib/MapPage.svelte';
  import Attract from './lib/Attract.svelte';

  const isKiosk = import.meta.env.VITE_KIOSK === 'true';
  setContext('isKiosk', isKiosk);

  const KIOSK_TIMEOUT = 30_000; // 30 s for testing; raise to ~120_000 for production

  let route = $state({ page: isKiosk ? 'attract' : 'home', slug: null });
  let timeoutId = null;

  function goToAttract() {
    route = { page: 'attract', slug: null };
  }

  function resetTimeout() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(goToAttract, KIOSK_TIMEOUT);
  }

  function handleUserActivity() {
    if (route.page !== 'attract') resetTimeout();
  }

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
    if (!isKiosk) parseHash();
    window.addEventListener('hashchange', parseHash);

    if (isKiosk) {
      window.addEventListener('click', handleUserActivity);
      window.addEventListener('touchstart', handleUserActivity);
      window.addEventListener('mousemove', handleUserActivity);
      window.addEventListener('keydown', handleUserActivity);
    }

    return () => {
      window.removeEventListener('hashchange', parseHash);
      if (isKiosk) {
        window.removeEventListener('click', handleUserActivity);
        window.removeEventListener('touchstart', handleUserActivity);
        window.removeEventListener('mousemove', handleUserActivity);
        window.removeEventListener('keydown', handleUserActivity);
        clearTimeout(timeoutId);
      }
    };
  });
</script>

{#if route.page === 'attract'}
  <Attract onBegin={() => {
    route = { page: 'home', slug: null };
    resetTimeout();
  }} />
{:else if route.page === 'map'}
  <MapPage slug={route.slug} />
{:else}
  <Home />
{/if}
