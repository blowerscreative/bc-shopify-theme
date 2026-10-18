(() => {
  // Mobile menu
  const header = document.querySelector('.header');
  const toggle = document.querySelector('.menu-toggle');
  if (header && toggle) {
    toggle.addEventListener('click', () => {
      const open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
    });
  }

  // Quantity steppers
  document.querySelectorAll('[data-qty]').forEach((wrap) => {
    const input = wrap.querySelector('input');
    wrap.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const v = Math.max(parseInt(input.min || '0', 10), (parseInt(input.value, 10) || 0) + (b.dataset.step === 'up' ? 1 : -1));
      input.value = v;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }));
  });

  // Variant picker
  const form = document.querySelector('.product__form');
  const dataEl = document.querySelector('[data-product-json]');
  if (form && dataEl) {
    const product = JSON.parse(dataEl.textContent);
    const selects = form.querySelectorAll('[data-option]');
    const idInput = form.querySelector('input[name="id"]');
    const priceEl = document.querySelector('[data-price]');
    const btn = form.querySelector('[data-add]');
    const paymentButton = form.querySelector('.shopify-payment-button');
    const money = (c) => new Intl.NumberFormat(document.documentElement.lang || 'en', { style: 'currency', currency: window.Shopify?.currency?.active || 'USD' }).format(c / 100);
    const update = () => {
      const opts = [...selects].map((s) => s.value);
      const v = product.variants.find((x) => x.options.every((o, i) => o === opts[i]));
      idInput.disabled = !v || !v.available;
      if (paymentButton) paymentButton.hidden = !v || !v.available;
      if (!v) { btn.disabled = true; btn.textContent = btn.dataset.unavailable; return; }
      idInput.value = v.id;
      btn.disabled = !v.available;
      btn.textContent = v.available ? btn.dataset.label : btn.dataset.soldout;
      if (priceEl) priceEl.classList.toggle('price--sale', v.compare_at_price > v.price);
      if (priceEl) priceEl.innerHTML = v.compare_at_price > v.price ? `<s>${money(v.compare_at_price)}</s><span>${money(v.price)}</span>` : money(v.price);
      const url = new URL(location.href); url.searchParams.set('variant', v.id); history.replaceState({}, '', url);
    };
    selects.forEach((s) => s.addEventListener('change', update));
  }

  // Cart auto-update on quantity change
  const cartForm = document.querySelector('[data-cart-form]');
  if (cartForm) {
    cartForm.addEventListener('change', (e) => {
      if (e.target.name === 'updates[]') cartForm.submit();
    });
  }
})();
