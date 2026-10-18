/*!
 * Blowers Creative — "Designed by" badge
 * A self-contained custom element. No stylesheet, no dependencies.
 * Drop it on any site:
 *
 *   <script src="https://blowerscreative.com/embed/blowers-badge.js" defer></script>
 *   <blowers-badge></blowers-badge>
 *
 * Attributes (all optional):
 *   theme="dark|light|auto"   default dark. auto follows the OS color scheme.
 *   fixed                      pins it to the bottom-right corner of the page.
 *   source="my-site"           override the utm_source (defaults to the host domain).
 *   href="https://..."         override the destination link entirely (skips UTMs).
 *
 * Shopify bundle of the existing Blowers Creative embed. The visual design and
 * hover animation are unchanged. Render on the installed theme's store domain
 * without relying on the public embed's separate domain allowlist.
 *
 * Blowers rhymes with flowers — with a B.
 */
(function () {
  if (window.customElements && customElements.get('blowers-badge')) return;

  var BASE = 'https://blowerscreative.com/';

  // Build the destination. The host site's own domain becomes utm_source, so traffic
  // is attributable per embedding site (schweitzer.church vs gwh.co), while utm_medium
  // keeps all badge clicks groupable. `source` attr overrides; `href` attr bypasses both.
  function buildHref(host) {
    var explicit = host.getAttribute('href');
    if (explicit) return explicit;
    var src = host.getAttribute('source');
    if (!src) {
      try { src = (location.hostname || '').replace(/^www\./, ''); } catch (e) {}
    }
    if (!src) src = 'badge';
    return BASE + '?utm_source=' + encodeURIComponent(src) +
      '&utm_medium=badge&utm_campaign=designed-by';
  }

  // The mark: aperture + flower. 8 petals at 45° steps + a center pip.
  function flower() {
    var svg =
      '<svg class="mark" viewBox="0 0 100 100" aria-hidden="true" focusable="false">';
    for (var i = 0; i < 8; i++) {
      svg +=
        '<g class="petal" style="--a:' + i * 45 + 'deg;--i:' + i + '">' +
        '<ellipse cx="50" cy="24" rx="7.5" ry="21"/></g>';
    }
    svg += '<circle class="pip" cx="50" cy="50" r="7"/></svg>';
    return svg;
  }

  var CSS = `
    :host {
      display: inline-block;
      line-height: 0;
      /* tokens (dark default) */
      --bg: #0b0c0a;
      --fg: #f3efe4;
      --amber: #f2a93c;
      --edge: rgba(243,239,228,.16);
    }
    :host([theme="light"]) {
      --bg: #f3efe4;
      --fg: #0b0c0a;
      --amber: #d98a1f;
      --edge: rgba(11,12,10,.16);
    }
    :host([fixed]) {
      position: fixed;
      right: 16px;
      bottom: 16px;
      z-index: 2147483000;
    }
    @media (prefers-color-scheme: light) {
      :host([theme="auto"]) {
        --bg: #f3efe4; --fg: #0b0c0a; --amber: #d98a1f; --edge: rgba(11,12,10,.16);
      }
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: .42em;
      box-sizing: border-box;
      padding: 6px 12px 6px 8px;
      border-radius: 999px;
      background: var(--bg);
      color: var(--fg);
      border: 1px solid var(--edge);
      text-decoration: none;
      font: 600 13px/1 ui-sans-serif, system-ui, -apple-system, "Segoe UI",
            Roboto, Helvetica, Arial, sans-serif;
      letter-spacing: .005em;
      white-space: nowrap;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,.22), 0 8px 22px rgba(0,0,0,.16);
      transition: box-shadow .35s ease, transform .35s ease;
      -webkit-tap-highlight-color: transparent;
    }
    .pill:hover,
    .pill:focus-visible {
      box-shadow: 0 1px 2px rgba(0,0,0,.28), 0 12px 30px rgba(0,0,0,.22);
      outline: none;
    }
    .pill:focus-visible {
      box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--amber);
    }

    .mark {
      display: block;
      width: 20px;
      height: 20px;
      overflow: visible;
      flex: 0 0 auto;
      transition: transform .5s cubic-bezier(.2,.8,.2,1);
    }
    .petal,
    .pip { fill: var(--amber); }

    /* Each petal pivots from the flower's center. At rest it leans together
       (a near-closed bud); on hover it fans out and blooms. */
    .petal {
      transform-box: view-box;
      transform-origin: 50px 50px;
      transform: rotate(calc(var(--a) - 12deg)) translateY(3px) scale(.78);
      transition: transform .6s cubic-bezier(.2,.85,.2,1);
      transition-delay: calc(var(--i) * 26ms);
    }
    .pip {
      transform-box: view-box;
      transform-origin: 50px 50px;
      transition: transform .4s ease;
    }
    .pill:hover .mark,
    .pill:focus-visible .mark { transform: rotate(14deg); }
    .pill:hover .petal,
    .pill:focus-visible .petal {
      transform: rotate(var(--a)) translateY(-6px) scale(1.1);
    }
    .pill:hover .pip,
    .pill:focus-visible .pip { transform: scale(1.15); }

    /* Copy */
    .base { font-weight: 500; opacity: .82; }
    .base b { font-weight: 700; opacity: 1; }
    .more {
      display: inline-block;
      max-width: 0;
      overflow: hidden;
      opacity: 0;
      transform: translateX(-4px);
      transition: max-width .5s cubic-bezier(.2,.8,.2,1),
                  opacity .35s ease, transform .45s ease, margin-left .5s ease;
      vertical-align: bottom;
    }
    .more b { font-weight: 700; }
    .pill:hover .more,
    .pill:focus-visible .more {
      max-width: 42ch;
      opacity: 1;
      transform: none;
      margin-left: .38em;
    }

    @media (prefers-reduced-motion: reduce) {
      .pill, .mark, .petal, .pip, .more { transition-duration: .001ms; }
      .petal { transform: rotate(var(--a)) translateY(-5px) scale(1.06); }
    }
  `;

  function render(host) {
    var root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    var href = buildHref(host);

    root.innerHTML =
      '<style>' + CSS + '</style>' +
      '<a class="pill" part="pill" target="_blank" rel="noopener" ' +
      'href="' + href.replace(/"/g, '&quot;') + '" ' +
      'title="Blowers — rhymes with flowers." ' +
      'aria-label="Designed by Blowers Creative in Springfield, Missouri. Visit our site.">' +
      flower() +
      '<span class="txt">' +
      '<span class="base">Designed by <b>Blowers Creative</b></span>' +
      '<span class="more">in Springfield, MO. <b>Check us out&nbsp;&rarr;</b></span>' +
      '</span>' +
      '</a>';
  }

  customElements.define('blowers-badge', class extends HTMLElement {
    static get observedAttributes() { return ['href', 'theme', 'source']; }
    connectedCallback() { render(this); }
    attributeChangedCallback() { if (this.shadowRoot) render(this); }
  });

  // One-liner mode: put data-mount on the <script> tag and it injects itself,
  // no <blowers-badge> element required. Optional data-theme / data-fixed / data-href.
  //   <script src=".../blowers-badge.js" data-mount data-theme="auto" defer></script>
  function autoMount() {
    var me = document.currentScript ||
      document.querySelector('script[data-mount][src*="blowers-badge"]');
    if (!me || !me.hasAttribute('data-mount') || me.__bcMounted) return;
    me.__bcMounted = true;

    var el = document.createElement('blowers-badge');
    if (me.dataset.theme) el.setAttribute('theme', me.dataset.theme);
    if (me.dataset.source) el.setAttribute('source', me.dataset.source);
    if (me.dataset.href) el.setAttribute('href', me.dataset.href);
    var fixed = me.hasAttribute('data-fixed');
    if (fixed) el.setAttribute('fixed', '');

    if (fixed || !me.parentNode || me.parentNode === document.head) {
      document.body.appendChild(el);
    } else {
      me.parentNode.insertBefore(el, me.nextSibling);
    }
  }
  if (document.body) autoMount();
  else document.addEventListener('DOMContentLoaded', autoMount);
})();
