<script>
  import { onMount, onDestroy } from 'svelte';

  let { onBegin } = $props();

  const ASSETS_BASE = 'https://assets.digitalgizmo.com/maine-maps/attract';
  const slugs = ['1600', '1656', '1676', '1755','1795', '1798', '1815', '1839','1855', '1900', '1936', '1960', '2026a','2026b'];

  let currentIndex = $state(0);
  let intervalId;

  onMount(() => {
    intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % slugs.length;
    }, 4000);
  });

  onDestroy(() => clearInterval(intervalId));
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<div class="attract" onclick={onBegin} role="button" tabindex="0">
  {#each slugs as slug, i}
    <img
      src="{ASSETS_BASE}/map{slug}.jpg"
      class="bg"
      class:active={i === currentIndex}
      alt=""
    />
  {/each}

  <div class="content">
    <h1>Mapping Maine</h1>
    <h2>Explore this place we call Maine and learn how the land's use has changed over time.</h2>
    <div class="prompt">TAP TO BEGIN</div>
  </div>
</div>

<style>
  .attract {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    cursor: pointer;
    user-select: none;
  }

  .bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 2s ease-in-out;
  }

  .bg.active {
    opacity: .4;
  }

  .content {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    margin: 0 auto;
    gap: 1.5vw;
    max-width: 60vw;
  }

  h1 {
    margin: 0;
    font-size: 6.7vw;
    line-height: 1;
    font-weight: 600;
    color: white;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
  }

  h2 {
    margin: 0;
    font-size: 2.25vw;
    line-height: 1;
    font-weight: 400;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  }

  .prompt {
    margin-top: 2vw;
    background: #015F82;
    color: white;
    font-family: "gitan-latn", serif;
    font-size: 3vw;
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.6em 2em;
    text-align: center;
    transition: background 0.2s ease;
  }

  .attract:hover .prompt {
    background: #17BCF9;
  }
</style>
