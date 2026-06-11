<script>
  // import HamburgerMenu from './HamburgerMenu.svelte';

  const API_BASE = import.meta.env.VITE_API_BASE;
  const ASSETS_BASE = 'https://assets.digitalgizmo.com/maine-maps/home';

  let mapSets = $state([]);
  let error = $state(null);
  let creditsOpen = $state(false);

  function showCredits() { creditsOpen = true; }

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

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') creditsOpen = false; }} />

<header>
  <div class="banner-slant-right">
    <!-- <HamburgerMenu maps={mapSets} /> -->
    <h1>Mapping Maine</h1>
    <h2>Explore this place we call Maine and learn how the land's use has changed over time.</h2>
    <p class="credits"><a href="/" onclick={(e) => { e.preventDefault(); showCredits(); }}>Credits</a></p>
  </div>
  <p class="prompt">Scroll for more maps. Tap a map to explore.</p>
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

{#if creditsOpen}
  <div
    class="modal-overlay"
    role="presentation"
    onclick={(e) => { if (e.target === e.currentTarget) creditsOpen = false; }}
  >
    <div class="modal-box">
      <button class="modal-close" onclick={() => creditsOpen = false}>×</button>
      <h2>Credits</h2>
      <p>One category of credits</p>
      <ul>
        <li>thing one</li>
        <li>thing two</li>
      </ul>
      <p>Another category of credits</p>
      <ul>
        <li>other thing one</li>
        <li>other thing two</li>
      </ul>
    </div>
  </div>
{/if}

<style>
  header {
    height: 120px;
  }

  header div.banner-slant-right {
    background-color: #015f82;
    padding: .25em 1em 0 2em;
    height: 120px;
    position: relative;
    max-width: 25vw;
    min-width: 400px;
  }

  header div.banner-slant-right:before {
    content: "";
    position: absolute;
    right: -69.5px;
    top: 0;
    /* bottom: 0; */
    /* width: 0; */
    /* height: 0; */
    border-left: 70px solid #015f82;
    border-top: 0px solid transparent;
    border-bottom: 125px solid transparent;
  }

  header h1, header h2 {
    font-weight: 600;
    font-size: 2em;
    margin: 0;
  }

  header h2 {
    margin: 0;
    font-weight: 200;
    font-size: 1.25em;
  }

  header p.credits {
    margin: 2em 0;
    padding: 0;
  }

  header p.credits a {
    text-transform: uppercase;
  }
  
  header p.prompt {
    font-family: myriad-pro-black;
    font-style: italic;
    font-weight: 200;
    font-size: 1.75em;
    padding: 1em;
    text-align: center;
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

  .main-menu ul li img {
    width: 100%;
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

  /* ── Credits modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .modal-box {
    background: #1a1a1a;
    color: white;
    padding: 2em;
    max-width: 600px;
    width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    border-radius: 4px;
  }

  .modal-box h2 {
    margin: 0 0 1em;
    font-size: 1.75rem;
  }

  .modal-close {
    position: absolute;
    top: 0.75em;
    right: 0.75em;
    background: none;
    border: none;
    color: white;
    font-size: 1.75rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 0.25em;
  }

  .modal-close:hover {
    color: #EC8923;
  }

  /* ── Mobile portrait (phones) ── */
  @media (max-width: 480px) {
    header {
      height: auto;
    }

    header div.banner-slant-right {
      min-width: unset;
      max-width: unset;
      width: 100%;
      height: auto;
      min-height: 60px;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.1em;
      padding: 0.6em 1em;
      box-sizing: border-box;
    }

    header div.banner-slant-right:before {
      display: none;
    }

    header h1 {
      font-size: 1.1em;
    }

    header h2 {
      font-size: 0.8em;
    }

    header p.prompt {
      font-size: 1.1em;
      padding: 0.5em 1em;
    }

    .main-menu ul {
      margin-top: 1vh;
    }

    .main-menu ul li {
      width: 72vw;
      height: 55vh;
    }
  }
</style>
