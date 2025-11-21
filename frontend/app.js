const API_BASE = "https://robbieshop-backend-latest.onrender.com";
const PRODUCTS_CONTAINER = document.getElementById("products");
const CART_CONTAINER = document.getElementById("cart-items");
const EMPTY_CART_BTN = document.getElementById("emptyCartBtn");
const CART_TOTAL_EL = document.getElementById("cartTotal");
const CART_COUNT_EL = document.getElementById("cartCount");
const PRODUCTS_PAGE = document.getElementById("products-page");
const CART_PAGE = document.getElementById("cart-page");
const PRODUCTS_PAGE_BTN = document.getElementById("productsPageBtn");
const CART_PAGE_BTN = document.getElementById("cartPageBtn");
const BACK_TO_PRODUCTS_BTN = document.getElementById("backToProductsBtn");
const USER_ID = 1;

let PRODUCTS = [];
let cartCount = 0;

// page init
window.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    fetchCart();
});

// NAV
function showProductsPage() {
    PRODUCTS_PAGE.classList.remove("hidden");
    CART_PAGE.classList.add("hidden");
}

function showCartPage() {
    CART_PAGE.classList.remove("hidden");
    PRODUCTS_PAGE.classList.add("hidden");
}

PRODUCTS_PAGE_BTN.addEventListener("click", showProductsPage);
BACK_TO_PRODUCTS_BTN.addEventListener("click", showProductsPage);
CART_PAGE_BTN.addEventListener("click", showCartPage);

// PRODUCTS
function fetchProducts() {
    fetch(`${API_BASE}/products`)
        .then(res => res.json())
        .then(products => {
            PRODUCTS = products;
            renderProducts();
        })
        .catch(err => {
            console.error(err);
            PRODUCTS_CONTAINER.innerHTML = "<p>Error loading products.</p>";
        });
}

function renderProducts() {
    PRODUCTS_CONTAINER.innerHTML = "";
    if (!PRODUCTS.length) {
        PRODUCTS_CONTAINER.innerHTML = "<p>No products yet.</p>";
        return;
    }

    PRODUCTS.forEach(product => {
        const card = document.createElement("div");
        card.className = "card";

      const imageUrl = product.imageUrl || "https://picsum.photos/300/200";

        card.innerHTML = `
            <img src="${imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description || ""}</p>
            <p class="product-meta">SKU: ${product.sku}</p>
            <p class="price">$${product.price.toFixed(2)}</p>
            <button class="primary">Add to Cart</button>
        `;

        const btn = card.querySelector("button");
        btn.addEventListener("click", () => addToCart(product.id));

        PRODUCTS_CONTAINER.appendChild(card);
    });
}

function addToCart(productId) {
    fetch(`${API_BASE}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: USER_ID,
            productId: productId,
            quantity: 1
        })
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to add to cart");
            return res.json();
        })
        .then(() => {
            fetchCart();
        })
        .catch(err => {
            console.error(err);
            alert("Error adding to cart");
        });
}

// CART
function fetchCart() {
    fetch(`${API_BASE}/cart?userId=${USER_ID}`)
        .then(res => res.json())
        .then(items => {
            renderCart(items);
        })
        .catch(err => {
            console.error(err);
            CART_CONTAINER.innerHTML = "<p>Error loading cart.</p>";
        });
}

function renderCart(items) {
    CART_CONTAINER.innerHTML = "";

    if (!items.length) {
        CART_CONTAINER.innerHTML = "<p class='cart-empty'>Cart is empty.</p>";
        CART_TOTAL_EL.textContent = "0.00";
        cartCount = 0;
        CART_COUNT_EL.textContent = cartCount;
        return;
    }

    let total = 0;
    cartCount = items.length;

    items.forEach(item => {
        const product = PRODUCTS.find(p => p.id === item.productId);
        const price = product ? product.price : 0;
        const name = product ? product.name : `Product ${item.productId}`;
        const sku = product ? product.sku : "N/A";

        total += price * item.quantity;

        const div = document.createElement("div");
        div.className = "cart-item";

        div.innerHTML = `
            <div class="cart-item-info">
                <span>${name}</span>
                <span>SKU: ${sku}</span>
                <span>Quantity: ${item.quantity} x $${price.toFixed(2)}</span>
            </div>
            <button class="danger">Remove</button>
        `;

        const btn = div.querySelector("button");
        btn.addEventListener("click", () => deleteCartItem(item.id));

        CART_CONTAINER.appendChild(div);
    });

    CART_TOTAL_EL.textContent = total.toFixed(2);
    CART_COUNT_EL.textContent = cartCount;
}

function deleteCartItem(cartId) {
    fetch(`${API_BASE}/cart/${cartId}`, {
        method: "DELETE"
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to delete cart item");
            return res.text();
        })
        .then(() => {
            fetchCart();
        })
        .catch(err => {
            console.error(err);
            alert("Error deleting cart item");
        });
}

EMPTY_CART_BTN.addEventListener("click", () => {
    fetch(`${API_BASE}/cart/emptycart?userId=${USER_ID}`, {
        method: "DELETE"
    })
        .then(res => {
            if (!res.ok) throw new Error("Failed to empty cart, status " + res.status);
            return res.text();
        })
        .then(() => {
            fetchCart();
        })
        .catch(err => {
            console.error(err);
            alert("Error emptying cart");
        });
});

