<script>
  // import HamburgerMenu from './HamburgerMenu.svelte';

  const API_BASE = import.meta.env.VITE_API_BASE;
  const ASSETS_BASE = 'https://assets.digitalgizmo.com/maine-maps/home';

  let mapSets = $state([]);
  let error = $state(null);

  async function loadMaps() {
    try {
      const res = await fetch(`${API_BASE}/maps/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      mapSets = await res.json();
    } catch (e) {
      error = e.message;
    }
  }

  loadMaps();
</script>

<header>
  <div class="banner-slant-right">
    <!-- <HamburgerMenu maps={mapSets} /> -->
    <h1>Mapping Maine</h1>
    <h2>Explore this place we call Maine and learn how the land's use has changed over time.</h2>
  </div>
  <p class="prompt">Tap a map to explore</p>
</header>

{#if error}
  <p class="error">Failed to load maps: {error}</p>
{:else if mapSets.length === 0}
  <p class="loading">Loading…</p>
{:else}
  <div class="main-menu">
    <ul>
      {#each mapSets as map}
        <li>
          <a href="#/map/{map.slug}">
            <img src="{ASSETS_BASE}/map{map.slug}.jpg" alt={map.title}>
            <h3 class="date">{map.date}</h3>
            <div class="name-block">
              <h3 class="map-name">{map.title}</h3>
              <p class="map-blurb">{map.short_description}</p>
            </div>
          </a>
        </li>
      {/each}
    </ul>
  </div>
{/if}

<style>
  header {
    height: 90px;
  }

  header div.banner-slant-right {
    background-color: #015f82;
    padding: 0 1em;
    height: 100px;
    position: relative;
    width: 400px;
    display: flex;
    align-items: center;
    gap: 0.75em;
  }

  header div.banner-slant-right:before {
    content: "";
    position: absolute;
    right: -70px;
    bottom: 0;
    width: 0;
    height: 0;
    border-left: 70px solid #015f82;
    border-top: 0px solid transparent;
    border-bottom: 100px solid transparent;
  }

  header h1, header h2 {
    margin: 0;
  }

  header h2 {
    font-weight: 200;
    font-size: 1em;
    line-height: 1.2em;
  }

  header p.prompt {
    font-family: myriad-pro-black;
    font-style: italic;
    font-weight: 200;
    font-size: 1.5em;
    padding: 1em;
  }

  .main-menu {
    overflow-x: scroll;
    bottom: 0;
  }

  .main-menu ul {
    list-style-type: none;
    width: max-content;
    margin-top: 15vh;
    padding: 0;
  }

  .main-menu ul li {
    display: inline-block;
    width: 20vw;
    max-width: 320px;
    height: 70vh;
    overflow: hidden;
    position: relative;
    margin-right: 3px;
  }

  .main-menu ul li a {
    color: #ffffff;
  }

  .main-menu ul li h3.date {
    position: absolute;
    background-color: #015f82ad;
    top: -1em;
    width: 100%;
    padding: 0.5em;
    font-size: 2em;
    font-weight: 600;
  }

  .main-menu ul li a div.name-block {
    background-color: #015f82;
    height: 160px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1em;
  }

  .main-menu ul li h3.map-name,
  .main-menu ul li p.map-blurb {
    margin: 0;
  }

  .main-menu ul li h3.map-name {
    font-size: 1.25em;
  }

  .loading {
    padding: 1em;
  }
</style>
