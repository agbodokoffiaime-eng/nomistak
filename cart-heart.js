document.addEventListener("DOMContentLoaded", () => {
  // ========= CONFIG =========
  const PHONE = "22890135252";
  const CART_KEY = "msp_cart_v2"; // UNE seule clé, utilisée partout

  // ========= OUTILS =========
  const cartCountEls = document.querySelectorAll(".cart-count");

  function safeText(el) {
    return el ? (el.textContent || "").trim() : "";
  }

  function parsePriceNumber(priceText) {
    // "790000 FCFA" -> 790000 / "129 €" -> 129
    const digits = String(priceText || "").match(/[0-9]+/g);
    return digits ? Number(digits.join("")) : 0;
  }

  function getProductInfo(card) {
    const title = safeText(card.querySelector(".product-title")) || "Produit";
    const priceText = safeText(card.querySelector(".price-current")) || "";
    const priceNumber = parsePriceNumber(priceText);
    const imgSrc = card.querySelector(".product-image img")?.getAttribute("src") || "";
    return { title, priceText, priceNumber, imgSrc };
  }

  function getProductId(card) {
    // ID stable
    const { title, priceNumber, imgSrc } = getProductInfo(card);
    return `${title}||${priceNumber}||${imgSrc}`.toLowerCase().trim().replace(/\s+/g, " ");
  }

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

  function updateBadge(cartArr) {
    const count = cartArr.length;
    cartCountEls.forEach((el) => {
      el.textContent = String(count);
      el.style.display = count > 0 ? "inline-block" : "none";
      el.classList.add("bump");
      setTimeout(() => el.classList.remove("bump"), 250);
    });
  }

  function setHeartUI(heartBtn, active) {
    const icon = heartBtn?.querySelector("i");
    if (!heartBtn || !icon) return;

    heartBtn.classList.toggle("active", active);

    // Font Awesome 6 : regular <-> solid
    icon.classList.toggle("fa-solid", active);
    icon.classList.toggle("fa-regular", !active);

    // sécurité si certaines pages ont encore far/fas
    icon.classList.toggle("fas", active);
    icon.classList.toggle("far", !active);

    // s'assure que c'est bien un coeur
    if (!icon.classList.contains("fa-heart")) icon.classList.add("fa-heart");
  }

  // ========= INIT =========
  let cart = loadCart();
  updateBadge(cart);

  // Remettre les coeurs corrects au chargement
  document.querySelectorAll(".product-card").forEach((card) => {
    const heartBtn = card.querySelector(".favorite-btn");
    if (!heartBtn) return;
    const id = getProductId(card);
    const active = cart.some((p) => p.id === id);
    setHeartUI(heartBtn, active);
  });

  // ========= CLICS =========
  document.addEventListener(
    "click",
    (e) => {
      // 1) COEUR = ajouter/retirer du panier
      const heartBtn = e.target.closest(".favorite-btn");
      if (heartBtn) {
        e.preventDefault();
        e.stopPropagation();

        const card = heartBtn.closest(".product-card");
        if (!card) return;

        const id = getProductId(card);
        const info = getProductInfo(card);

        const idx = cart.findIndex((p) => p.id === id);

        if (idx === -1) {
          // AJOUT
          cart.push({
            id,
            title: info.title,
            priceText: info.priceText,
            priceNumber: info.priceNumber,
            imgSrc: info.imgSrc,
            qty: 1
          });
          saveCart(cart);
          setHeartUI(heartBtn, true);
          updateBadge(cart);
        } else {
          // RETRAIT
          cart.splice(idx, 1);
          saveCart(cart);
          setHeartUI(heartBtn, false);
          updateBadge(cart);
        }
        return;
      }

      // 2) EN SAVOIR PLUS = WhatsApp (message produit)
      const moreBtn = e.target.closest(".add-to-cart-btn");
      if (moreBtn) {
        // Chez toi c'est un <a>, on override le href générique
        e.preventDefault();
        e.stopPropagation();

        const card = moreBtn.closest(".product-card");
        if (!card) return;

        const { title, priceText } = getProductInfo(card);
        const message =
          `Bonjour Maestro Store 👋\n` +
          `Je suis intéressé par :\n` +
          `➡️ ${title}${priceText ? ` (${priceText})` : ""}\n` +
          `Est-ce disponible ?`;

        const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    true
  );
});