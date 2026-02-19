<script>
  const API_BASE = import.meta.env.VITE_API_BASE;

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

<div class="home">
  <h1>Maps of Maine</h1>

  {#if error}
    <p class="error">Failed to load maps: {error}</p>
  {:else if mapSets.length === 0}
    <p>Loading…</p>
  {:else}
    <nav>
      <ul>
        {#each mapSets as map}
          <li>
            <a href="#/map/{map.slug}">{map.title}</a>
            {#if map.short_description}
              <p class="description">{map.short_description}</p>
            {/if}
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
</div>

<style>
  .home {
    padding: 2em;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    margin-bottom: 1em;
  }

  a {
    color: yellow;
    font-size: 1.2em;
  }

  .description {
    margin: 0.25em 0 0;
    color: #ccc;
  }

  .error {
    color: #f66;
  }
</style>
