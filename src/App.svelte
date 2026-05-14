<script>
  import { onMount, setContext } from 'svelte';
  import Home from './lib/Home.svelte';
  import MapPage from './lib/MapPage.svelte';
  import Attract from './lib/Attract.svelte';

  const isKiosk = import.meta.env.VITE_KIOSK === 'true';
  setContext('isKiosk', isKiosk);

  const KIOSK_TIMEOUT = 120_000; // 30 s for testing; raise to ~120_000 for production

  let route = $state(/** @type {{ page: string, slug: string | null }} */ ({ page: isKiosk ? 'attract' : 'home', slug: null }));
  let timeoutId = /** @type {number | undefined} */ (undefined);

  function goToAttract() {
    route = { page: 'attract', slug: null };
    history.replaceState(null, '', window.location.pathname);
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

  // When a hash link is clicked whose href already matches the current hash,
  // the browser fires no hashchange event. Catch that case and parse manually.
  /** @param {MouseEvent} e */
  function handleLinkClick(e) {
    const a = /** @type {Element | null} */ (e.target)?.closest('a[href^="#"]');
    if (a && a.getAttribute('href') === window.location.hash) parseHash();
  }

  onMount(() => {
    if (!isKiosk) parseHash();
    window.addEventListener('hashchange', parseHash);
    window.addEventListener('click', handleLinkClick);

    if (isKiosk) {
      window.addEventListener('click', handleUserActivity);
      window.addEventListener('touchstart', handleUserActivity);
      window.addEventListener('mousemove', handleUserActivity);
      window.addEventListener('keydown', handleUserActivity);
    }

    return () => {
      window.removeEventListener('hashchange', parseHash);
      window.removeEventListener('click', handleLinkClick);
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
