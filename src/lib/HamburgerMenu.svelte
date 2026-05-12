<script>
  let { maps = [] } = $props();

  let open = $state(false);
  let btnRef = $state(/** @type {HTMLButtonElement | null} */ (null));
  let dropdownRef = $state(/** @type {HTMLUListElement | null} */ (null));
  let top = $state(0);
  let left = $state(0);

  // Teleport dropdown to body so clip-path on ancestors can't hide it
  $effect(() => {
    const el = dropdownRef;
    if (!el) return;
    document.body.appendChild(el);
    return () => { if (el.parentNode) el.parentNode.removeChild(el); };
  });

  function toggle() {
    if (!open && btnRef) {
      const rect = btnRef.getBoundingClientRect();
      top = rect.bottom + 4;
      left = rect.left;
    }
    open = !open;
  }

  function close() { open = false; }

  /** @param {MouseEvent} e */
  function handleWindowClick(e) {
    if (!open) return;
    const target = /** @type {Node | null} */ (e.target);
    if (!btnRef?.contains(target) && !dropdownRef?.contains(target)) {
      open = false;
    }
  }
</script>

<svelte:window onclick={handleWindowClick} />

<button class="hamburger-btn" bind:this={btnRef} onclick={toggle} aria-label="Map menu" aria-expanded={open}>
  ☰
</button>

<ul
  bind:this={dropdownRef}
  class="dropdown"
  class:hidden={!open}
  style="top: {top}px; left: {left}px;"
>
  {#each maps as map}
    <li>
      <a href="#/map/{map.slug}" onclick={close}>
        {map.date}{map.short_title || map.title ? ' - ' : ''}{map.short_title || map.title}
      </a>
    </li>
  {/each}
</ul>

<style>
  .hamburger-btn {
    background: none;
    border: none;
    color: #EC8923;
    font-size: 3rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .dropdown {
    position: fixed;
    background: #015f82;
    /* border: 1px solid #0a7aab; */
    list-style: none;
    margin: 0;
    padding: 0.25em 0;
    min-width: 260px;
    z-index: 1000;
    box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.5);
  }

  .dropdown.hidden {
    display: none;
  }

  .dropdown li {
    border-bottom: 1px solid #83b7ce;
  }
  
  .dropdown li a {
    display: block;
    padding: 0.5em 1em;
    color: #fff;
    text-decoration: none;
    font-size: 1.25rem;
    font-weight: 400;
    white-space: nowrap;
  }

  .dropdown li a:hover {
    background: #17BCF9;
    color: rgb(196, 130, 39);
  }
</style>
