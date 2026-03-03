  document.addEventListener("DOMContentLoaded", () => {
  const PHONE = "22891402840";
  const CART_KEY = "msp_cart_v2";

  const container = document.getElementById("cart-container");
  const totalEl = document.getElementById("cart-total");
  const whatsappBtn = document.getElementById("whatsapp-checkout");
  const badgeEls = document.querySelectorAll(".cart-count");

  if (!container || !totalEl || !whatsappBtn) return;

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function saveCart(arr) {
    localStorage.setItem(CART_KEY, JSON.stringify(arr));
  }

  function moneyFCFA(n) {
    return (Number(n) || 0).toLocaleString("fr-FR") + " FCFA";
  }

  function updateBadge(count) {
    badgeEls.forEach((el) => {
      el.textContent = String(count);
      el.style.display = count > 0 ? "inline-block" : "none";
    });
  }

  function render() {
    const cart = loadCart();
    updateBadge(cart.length);

    if (cart.length === 0) {
      container.innerHTML = `<p>Ton panier est vide.</p>`;
      totalEl.textContent = moneyFCFA(0);
      whatsappBtn.href = `https://wa.me/${PHONE}?text=${encodeURIComponent("Bonjour No Mistake Business 👋 Je veux des infos.")}`;
      return;
    }

    let total = 0;
    let message = "Bonjour No Mistake Business 👋\nJe souhaite commander :\n";  

    container.innerHTML = "";

    cart.forEach((item) => {
      const line = (Number(item.priceNumber) || 0) * (Number(item.qty) || 1);
      total += line;

      message += `- ${item.title}${item.priceText ? ` (${item.priceText})` : ""}\n`;

      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div style="display:flex;gap:12px;align-items:center;justify-content:space-between;width:100%;">
          <div style="display:flex;gap:12px;align-items:center;">
            ${item.imgSrc ? `<img src="${item.imgSrc}" alt="${item.title}" style="width:64px;height:64px;object-fit:cover;border-radius:10px;">` : ""}
            <div>
              <h3 style="margin:0;">${item.title}</h3>
              <p style="margin:6px 0 0;font-weight:700;">${item.priceText || moneyFCFA(item.priceNumber)}</p>
            </div>
          </div>

          <button type="button" data-id="${item.id}"
                  style="background:none;border:none;color:red;font-size:18px;cursor:pointer;">
            ✕
          </button>
        </div>
      `;
      container.appendChild(row);
    });

    totalEl.textContent = moneyFCFA(total);

    message += `\nTotal: ${moneyFCFA(total)}\nMerci.`;
    whatsappBtn.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
  }

  // supprimer
  container.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;

    const idToRemove = btn.getAttribute("data-id");
    const cart = loadCart().filter((x) => x.id !== idToRemove);

    saveCart(cart);
    render();
  });

  render();
});

document.addEventListener("DOMContentLoaded", () => {
  const PHONE = "22891402840";
  const CART_KEY = "msp_cart_v2";

  const container = document.getElementById("cart-container");
  const totalEl = document.getElementById("cart-total");
  const whatsappBtn = document.getElementById("whatsapp-checkout");
  const badgeEls = document.querySelectorAll(".cart-count");

  if (!container || !totalEl || !whatsappBtn) return;

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function saveCart(arr) {
    localStorage.setItem(CART_KEY, JSON.stringify(arr));
  }

  function detectUnit(cart) {
    const s = String(cart?.[0]?.priceText || "").toUpperCase();
    if (s.includes("€")) return "€";
    if (s.includes("FCFA") || s.includes("XOF")) return "FCFA";
    return "FCFA";
  }

  function money(n, unit) {
    const v = Number(n) || 0;
    return unit === "€"
      ? v.toLocaleString("fr-FR") + " €"
      : v.toLocaleString("fr-FR") + " FCFA";
  }

  function updateBadge(count) {
    badgeEls.forEach((el) => {
      el.textContent = String(count);
      el.style.display = count > 0 ? "inline-block" : "none";
    });
  }

  function render() {
    const cart = loadCart();
    updateBadge(cart.length);

    if (cart.length === 0) {
      container.innerHTML = `<p style="color:#444;">Ton panier est vide.</p>`;
      totalEl.textContent = "0";
      whatsappBtn.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(
        "Bonjour No Mistake Business 👋 Je veux des infos."
      )}`;
      return;
    }

    const unit = detectUnit(cart);

    let total = 0;
    let message = "Bonjour No Mistake Business 👋\nJe souhaite commander :\n";  

    container.innerHTML = cart.map((item) => {
      const qty = Number(item.qty) || 1;
      const line = (Number(item.priceNumber) || 0) * qty;
      total += line;

      message += `- ${item.title}${item.priceText ? ` (${item.priceText})` : ""}\n`;

      const img = item.imgSrc
        ? `<img class="cart-item-img" src="${item.imgSrc}" alt="${item.title}">`
        : `<div class="cart-item-img" aria-hidden="true"></div>`;

      return `
        <div class="cart-item" data-id="${item.id}">
          ${img}
          <div class="cart-item-body">
            <h3 class="cart-item-title">${item.title}</h3>
            <div class="cart-item-price">${item.priceText || money(item.priceNumber, unit)}</div>
            <div class="cart-item-sub">Quantité : ${qty}</div>
          </div>
          <button class="cart-item-remove" type="button" data-remove aria-label="Supprimer">
            ✕
          </button>
        </div>
      `;
    }).join("");

    totalEl.textContent = money(total, unit);

    message += `\nTotal: ${money(total, unit)}\nMerci.`;
    whatsappBtn.href = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
  }

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;

    const row = e.target.closest(".cart-item");
    const id = row?.getAttribute("data-id");
    if (!id) return;

    const cart = loadCart().filter((x) => x.id !== id);
    saveCart(cart);
    render();
  });

  render();
});