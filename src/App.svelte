<script lang="ts" module>
  function* range(n: number) {
    let s = n;
    while (n > 0) yield s - n--;
  }

  function up<T extends HTMLElement>(el: T, shower: T | null) {
    function update(shower: T | null) {
      if (shower === el) {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--y", -rect.y + "px");
        el.dataset.active = "true";
      } else {
        el.style.setProperty("--y", "0px");
        el.dataset.active = "false";
      }
    }

    function destroy() {
      update(null);
    }

    return { update, destroy };
  }

  function context<T extends HTMLElement>(el: T, fn?: (el: T) => any) {
    let ctrl = new AbortController();
    update(fn);

    function update(fn?: (el: T) => any) {
      destroy();
      ctrl = new AbortController();
      let timer = 0;
      let active = false;
      el.addEventListener(
        "touchstart",
        () => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            fn?.(el);
            active = true;
          }, 300);
        },
        ctrl,
      );
      el.addEventListener(
        "touchmove",
        (e) => {
          if (active) e.preventDefault();
          clearTimeout(timer);
        },
        ctrl,
      );
      el.addEventListener(
        "touchend",
        () => {
          active = false;
          clearTimeout(timer);
        },
        ctrl,
      );
    }

    function destroy() {
      ctrl.abort();
    }

    return { update, destroy };
  }

  function touchclick<T extends HTMLElement>(el: T, fn?: (el: T) => any) {
    let ctrl = new AbortController();

    function inset(e: TouchEvent) {
      const rect = el.getBoundingClientRect();

      for (const touch of e.touches) {
        if (
          rect.x < touch.clientX &&
          rect.y < touch.clientY &&
          rect.x + rect.width >= touch.clientX &&
          rect.y + rect.height >= touch.clientY
        )
          return true;
      }

      return false;
    }

    function update(fn?: (el: T) => any) {
      destroy();
      ctrl = new AbortController();
      let down = true;
      el.addEventListener(
        "touchstart",
        (e) => {
          fn?.(el);
        },
        ctrl,
      );
      addEventListener(
        "touchmove",
        (e) => {
          if (!down) return;
          el.dataset.active = String(inset(e));
        },
        ctrl,
      );
      addEventListener(
        "touchend",
        (e) => {
          down = false;
          el.dataset.active === "true" && fn?.(el);
          el.dataset.active = "false";
        },
        ctrl,
      );
    }

    update(fn);

    function destroy() {
      ctrl.abort();
    }
    return { update, destroy };
  }
</script>

<script lang="ts">
  const req = fetch("//630eb04b3792563418803d9d.mockapi.io/post");
  const data = req.then((e) => e.json());

  let select: HTMLElement | null = null;

  function onContext(el: HTMLDivElement) {
    select = el;
  }

  function onClick(i: number, el: HTMLButtonElement) {
    console.log(`"Test ${i}" on "${select?.id}"`);
    select = null;
    //
  }
</script>

<main>
  <div class="list">
    {#await data}
      <p>Loading...</p>
    {:then data}
      {#each data as item (item.id)}
        <div id={item.id} use:context={onContext} use:up={select} class="card">
          <div class="user">
            <img src={item.avatar} alt={item.creator} class="avatar" />
            <p>{item.creator}</p>
          </div>
          <img class="img" alt={item.title} src={item.thumb} />
          <p>{item.title}</p>
          <p style="text-align: right;">#{item.id}</p>
        </div>
      {/each}
    {/await}
  </div>
  {#if select}
    <div
      class="modal"
      onpointerdown={(e) => e.target === e.currentTarget && (select = null)}
    >
      <div class="menu">
        {#each range(10) as i}
          <button use:touchclick={onClick.bind(null, i)}>Test {i}</button>
        {/each}
      </div>
    </div>
  {/if}
  <div class="modal-back"></div>
</main>

<style>
  main {
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  @keyframes show {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0px);
      opacity: 1;
    }
  }

  .menu {
    position: absolute;
    margin: auto;
    display: flex;
    flex-direction: column;
    width: 200px;
    right: 10px;
    bottom: 10px;
    animation: show 0.3s;
  }

  .menu button {
    padding: 5px 10px;
    border-radius: 0px;
    text-align: left;
    font-size: 16px;
    border: none;
  }

  .menu button:not(:last-child) {
    border-bottom: 1px solid #fff;
  }

  .menu button:global([data-active="true"]),
  .menu button:active {
    background-color: #999;
  }

  .modal {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .img {
    width: 100%;
    object-fit: cover;
  }

  .modal-back {
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    backdrop-filter: blur(10px);
    transition: 0.3s;
    -webkit-transition: 0.3s;
  }

  .card:global([data-active="true"]) {
    background-color: #fff;
    transform: translateY(var(--y)) scale(0.9);
    animation: none;
  }

  .list:has(:global([data-active="true"])) ~ .modal-back {
    opacity: 1;
  }

  @keyframes delay {
    from {
      z-index: 1;
    }
    to {
      z-index: 0;
    }
  }

  .card {
    padding: 20px;
    transition: transform 0.3s;
    -webkit-transition: transform 0.3s ease-in-out;
    transform: translateY(0px) scale(1);
    animation: delay 0s 0.3s forwards;
    z-index: 1;
    position: relative;
  }

  .user {
    display: flex;
    gap: 5px;
    margin-left: -10px;
    padding-bottom: 5px;
    align-items: center;
  }

  .avatar {
    width: 25px;
    height: 25px;
    border-radius: 100%;
  }
</style>
