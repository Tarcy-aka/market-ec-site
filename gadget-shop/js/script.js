"use strict";

// 商品情報：価格・説明・画像はポートフォリオ用の架空データです。
const products = [
  {
    id: "headphones",
    name: "AIR TONE PRO ヘッドホン",
    category: "audio",
    label: "オーディオ",
    price: 19800,
    rating: 4.8,
    reviews: 128,
    badge: "POPULAR",
    description:
      "音楽に没入できる、ワイヤレスヘッドホン。軽やかな装着感とすっきりとしたデザインで、仕事にも移動にも。",
    specs: "Bluetooth / ノイズキャンセリング / 最大30時間再生",
  },
  {
    id: "laptop",
    name: "NOTE AIR 14 ノートPC",
    category: "pc",
    label: "PC・周辺機器",
    price: 89800,
    rating: 4.7,
    reviews: 64,
    badge: "NEW",
    description: "薄く、軽く、毎日の作業を快適に。持ち運びしやすい14インチのノートPCです。",
    specs: "14インチ / メモリ16GB / SSD 512GB",
  },
  {
    id: "earbuds",
    name: "PURE PODS ワイヤレスイヤホン",
    category: "audio",
    label: "オーディオ",
    price: 12800,
    rating: 4.6,
    reviews: 96,
    badge: "",
    description:
      "ポケットに収まる小さな相棒。クリアな音と快適なフィット感で、いつでもお気に入りの音楽を。",
    specs: "Bluetooth / 防滴設計 / ケース込み24時間再生",
  },
  {
    id: "camera",
    name: "FOCUS ONE ミラーレスカメラ",
    category: "camera",
    label: "カメラ",
    price: 74800,
    rating: 4.9,
    reviews: 42,
    badge: "PICK UP",
    description:
      "日常の瞬間を、あなたらしい一枚に。コンパクトなボディに本格的な撮影機能を詰め込みました。",
    specs: "2400万画素 / 4K動画 / 標準ズームレンズ付き",
  },
  {
    id: "speaker",
    name: "ROOM MINI スマートスピーカー",
    category: "home",
    label: "スマート家電",
    price: 6800,
    rating: 4.5,
    reviews: 83,
    badge: "",
    description:
      "部屋に自然になじむ、やわらかなデザイン。音楽を流して、いつもの時間を少し心地よく。",
    specs: "Wi-Fi / Bluetooth / 音声コントロール",
  },
  {
    id: "powerbank",
    name: "POCKET CHARGE モバイルバッテリー",
    category: "accessory",
    label: "アクセサリー",
    price: 3980,
    rating: 4.7,
    reviews: 156,
    badge: "BEST SELLER",
    description:
      "外出先でも、充電の心配を少なく。手のひらサイズのコンパクトなモバイルバッテリーです。",
    specs: "10,000mAh / USB-C / 急速充電対応",
  },
];
const yen = (value) => `¥${value.toLocaleString("ja-JP")}`;
const heartIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-3 3 0 7 8 14 8-7 11-11 8-14Z"/></svg>';
const cartIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h2l3 13h11l3-10H6"/><path d="M12 7v6m-3-3h6"/></svg>';
const state = {
  category: "all",
  search: "",
  sort: "featured",
  favoritesOnly: false,
  favorites: new Set(),
  cart: {},
};
const grid = document.querySelector("#product-grid");
const productDialog = document.querySelector("#product-dialog");
const cartDialog = document.querySelector("#cart-dialog");
let toastTimer;

// フィルタリングと並び替えを一か所で管理します。
function getVisibleProducts() {
  const keyword = state.search.toLocaleLowerCase();
  const result = products.filter(
    (product) =>
      (state.category === "all" || product.category === state.category) &&
      (!state.favoritesOnly || state.favorites.has(product.id)) &&
      `${product.name} ${product.label} ${product.specs}`.toLocaleLowerCase().includes(keyword),
  );
  if (state.sort === "low") result.sort((a, b) => a.price - b.price);
  if (state.sort === "high") result.sort((a, b) => b.price - a.price);
  if (state.sort === "rating") result.sort((a, b) => b.rating - a.rating);
  return result;
}
function renderProducts() {
  const visible = getVisibleProducts();
  grid.innerHTML = visible
    .map(
      (product) => `
    <article class="product-card">
      <button class="product-image" data-detail="${product.id}" aria-label="${product.name}の詳細を見る"><img src="../images/${product.id}.jpg" alt="${product.name}" width="512" height="512" loading="lazy" /></button>
      ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
      <button class="favorite icon-button" data-favorite="${product.id}" aria-label="${product.name}をお気に入りに登録" aria-pressed="${state.favorites.has(product.id)}" title="お気に入り">${heartIcon}</button>
      <div class="product-info"><p class="product-category">${product.label}</p><h3><button class="product-title" data-detail="${product.id}">${product.name}</button></h3><p class="rating"><span aria-hidden="true">★★★★★</span> ${product.rating}<span>(${product.reviews})</span></p><div class="product-bottom"><p class="price">${yen(product.price)} <small>税込</small></p><button class="add-button" data-add="${product.id}" aria-label="${product.name}をカートに追加" title="カートに追加">${cartIcon}</button></div></div>
    </article>`,
    )
    .join("");
  document.querySelector("#result-count").textContent =
    `${state.favoritesOnly ? "お気に入り · " : ""}${visible.length}件の商品`;
  document.querySelector("#empty").hidden = visible.length > 0;
  document.querySelector("#clear-filters").hidden =
    state.category === "all" && !state.search && !state.favoritesOnly;
  document.querySelectorAll(".category").forEach((button) => {
    const selected = button.dataset.category === state.category;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document
    .querySelector("#favorites-toggle")
    .setAttribute("aria-pressed", String(state.favoritesOnly));
}
function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2400);
}
function addToCart(id) {
  if (!products.some((product) => product.id === id)) return;
  state.cart[id] = (state.cart[id] || 0) + 1;
  renderCart();
  showToast("カートに追加しました");
}
function openProduct(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;
  document.querySelector("#product-detail").innerHTML =
    `<div class="detail-grid"><img src="../images/${product.id}.jpg" alt="${product.name}" width="512" height="512" /><div><p class="eyebrow">${product.label}</p><h2>${product.name}</h2><p class="rating">★★★★★ ${product.rating} <span>(${product.reviews}件のサンプル評価)</span></p><p class="detail-description">${product.description}</p><p class="specs">${product.specs}</p><p class="price">${yen(product.price)} <small>税込</small></p><button class="button primary" data-add="${product.id}">カートに追加 ${cartIcon}</button></div></div>`;
  productDialog.showModal();
}
function renderCart() {
  const selected = products.filter((product) => state.cart[product.id] > 0);
  document.querySelector("#cart-count").textContent = selected.reduce(
    (total, product) => total + state.cart[product.id],
    0,
  );
  document.querySelector("#cart-items").innerHTML = selected.length
    ? selected
        .map(
          (product) =>
            `<article class="cart-row"><img src="../images/${product.id}.jpg" alt="${product.name}" width="70" height="70" /><div><h3>${product.name}</h3><p class="price">${yen(product.price)}</p><div class="quantity"><button data-quantity="${product.id}" data-change="-1" aria-label="${product.name}の数量を減らす">−</button><span aria-label="数量">${state.cart[product.id]}</span><button data-quantity="${product.id}" data-change="1" aria-label="${product.name}の数量を増やす">＋</button></div></div><button class="remove" data-remove="${product.id}" aria-label="${product.name}をカートから削除">削除</button></article>`,
        )
        .join("")
    : '<div class="empty"><h3>カートは空です</h3><p>お気に入りの商品を探してみましょう。</p></div>';
  const total = selected.reduce((sum, product) => sum + product.price * state.cart[product.id], 0);
  document.querySelector("#cart-summary").innerHTML = selected.length
    ? `<div class="total"><span>商品合計（税込）</span><span>${yen(total)}</span></div><p class="cart-note">架空ショップのため注文・決済はできません。送料・配送の設定はありません。</p>`
    : "";
}

// 動的に追加される商品にも同じイベント処理を使います。
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.detail) openProduct(button.dataset.detail);
  if (button.dataset.add) addToCart(button.dataset.add);
  if (button.dataset.favorite) {
    const id = button.dataset.favorite;
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    renderProducts();
  }
  if (button.dataset.category) {
    state.category = button.dataset.category;
    renderProducts();
    document.querySelector("#products").scrollIntoView();
  }
  if (button.dataset.quantity) {
    const id = button.dataset.quantity;
    state.cart[id] = Math.max(0, (state.cart[id] || 0) + Number(button.dataset.change));
    renderCart();
  }
  if (button.dataset.remove) {
    delete state.cart[button.dataset.remove];
    renderCart();
  }
  if (button.classList.contains("dialog-close")) button.closest("dialog").close();
});
document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.search = document.querySelector("#search").value.trim();
  renderProducts();
  document.querySelector("#products").scrollIntoView();
});
document.querySelector("#search").addEventListener("input", (event) => {
  state.search = event.target.value.trim();
  renderProducts();
});
document.querySelector("#sort").addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});
document.querySelector("#favorites-toggle").addEventListener("click", () => {
  state.favoritesOnly = !state.favoritesOnly;
  renderProducts();
  document.querySelector("#products").scrollIntoView();
});
document.querySelector("#clear-filters").addEventListener("click", () => {
  state.category = "all";
  state.search = "";
  state.favoritesOnly = false;
  document.querySelector("#search").value = "";
  renderProducts();
});
document.querySelector("#accessory-pick").addEventListener("click", () => {
  state.category = "accessory";
  state.search = "";
  state.favoritesOnly = false;
  document.querySelector("#search").value = "";
  renderProducts();
  document.querySelector("#products").scrollIntoView();
});
document.querySelector("#cart-open").addEventListener("click", () => {
  renderCart();
  cartDialog.showModal();
});
for (const dialog of [productDialog, cartDialog]) {
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      dialog.close();
  });
}
renderProducts();
renderCart();
