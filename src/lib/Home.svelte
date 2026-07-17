<script>
  // import HamburgerMenu from './HamburgerMenu.svelte';
  import { getMaps } from './mapData.js';

  const ASSETS_BASE = `${import.meta.env.VITE_IMAGE_BASE}/home`;

  let mapSets = $state([]);
  let error = $state(null);
  let creditsOpen = $state(false);

  function showCredits() { creditsOpen = true; }

  async function loadMaps() {
    try {
      mapSets = await getMaps();
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
      <p>The Maine State Museum is grateful to Jay Clark and Bob Bistrais from the Maine Geospatial Library for their assistance in creating the contemporary wall map and the 2026 digital maps of Maine.</p>

      <p>Educational interactive content planning, design, and development:</p>

      <h3>Maine State Museum</h3>
      <ul>
        <li>Andrew Beaupre, Curator of Archaeological Collections</li>
        <li>Angela Goebel-Bain, Curator of Historical Collections</li>
        <li>Brittany Jaarsma, Curator of Historical Collection</li> 
        <li>Zachariah Selley, Curator of Archival Collections</li>
        <li>Kate Webber, Lead Educator</li>
      </ul>

      <h3>Digital Gizmo</h3>
      <ul>
        <li>Don Button, Technical Director</li>
        <li>Juliet Jacobson, Design Director</li>
      </ul>

      <h3>Individual Map Credits:</h3>

      <div class="indi-maps">
        <h4>The Barry Lawrence Ruderman Map Collection, courtesy Stanford University Libraries</h4>
        <ul>
          <li>Le Canada ou Nouvelle France &c. Ce qui set les plus advance vers le Septenrion est tier de dives Relations des Anglois, Danois &c. . . . 1656</li>
          <li>Partie Orientale de la Nouvelle France ou du Canada, 1755</li>
        </ul>

        <h4>Lionel Pincus and Princess Firyal Map Division, The New York Public Library</h4>
        <ul>
          <li>Map of New England and New York, 1676</li>
        </ul>

        <h4>Maine Geospatial Library, Augusta, Maine</h4>
        <ul>
          <li>Map of Maine lands held by Wabanaki tribes, 2026</li>
          <li>Maine Today, 2026</li>
        </ul>

        <h4>Maine State Museum</h4>
        <ul>
          <li>“Greetings From Maine” Postcard, circa 1960</li>
        </ul>
        
        <h4>Musée des Abénakis</h4>
        <ul>
          <li>The Ndakina, the W8banaki Nation's Territory, 2023</li>
        </ul>
        
        <h4>Osher Map Library and Smith Center for Cartographic Education, University of Southern Maine</h4>
        <ul>
          <li>The Province of Maine, From the best Authorities, 1795</li>
          <li>Maine Entworfen von D.F. Sotzmann, 1798</li>
          <li>Maine and the Disputed Territory, 1839</li>
          <li>Colton's Railroad & Township Map of the State of Maine, 1855</li>
          <li>Map of the State of Maine Showing Railroads, Towns, Plantations and Wild Lands, 1900</li>
          <li>State Highway Commission Map of Maine, 1935, reprinted 1936</li>
        </ul>
        
        <h4>Courtesy of M. Carlson Williams</h4>
        <ul>
          <li>Map of the District of Maine from the Latest and Best Authorities, 1815</li>
        </ul>
      </div>
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
    /* font-family: myriad-pro-black; */
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
    background: rgba(33, 33, 33, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .modal-box {
    background: #ffffff;
    color: rgb(30, 30, 30);
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
    color: rgb(234, 146, 4);
    font-size: 1.75rem;
    line-height: 1;
    cursor: pointer;
    padding: 0 0.25em;
  }

  .modal-close:hover {
    color: #055082;
  }

  .indi-maps  {
    font-style: italic;
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
