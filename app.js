document.addEventListener("DOMContentLoaded", function () {

    // Only run menu logic if we're on menu.html
    const menuDiv = document.getElementById("menu-items");
    if (!menuDiv) return;

    // =====================
    // REQUIRE LOGIN TO ORDER
    // =====================
    const currentUser = JSON.parse(localStorage.getItem("arizona_current_user") || "null");
    if (!currentUser) {
        sessionStorage.setItem("redirect_after_login", "menu.html");
        window.location.href = "login.html";
        return;
    }

    // =====================
    // REQUIRE ORDER MODE (Dine-in / Delivery)
    // =====================
    const orderMode = JSON.parse(localStorage.getItem("arizona_order_mode") || "null");
    if (!orderMode || !orderMode.type) {
        window.location.href = "welcome.html";
        return;
    }

    // Show order type badge at top of menu
    const badge = document.createElement("div");
    badge.className = "text-center mb-6";
    if (orderMode.type === "dinein") {
        badge.innerHTML = `<span class="inline-block bg-red-50 text-red-700 font-bold text-sm px-4 py-2 rounded-full border border-red-100">
            <i class="fas fa-chair"></i> Dine-in &middot; Table ${orderMode.tableNumber}
        </span>`;
    } else {
        badge.innerHTML = `<span class="inline-block bg-red-50 text-red-700 font-bold text-sm px-4 py-2 rounded-full border border-red-100">
            <i class="fas fa-motorcycle"></i> Delivery &middot; Fee: Ksh ${orderMode.deliveryFee}
        </span>`;
    }
    const menuHeading = document.querySelector("main > div.text-center");
    if (menuHeading) menuHeading.after(badge);

    // =====================
    // MENU ITEMS
    // =====================
    const menuItems = [
        { id: 1, name: "Burger",           price: 250, image: "assets/images/burger.jpg" },
        { id: 2, name: "Fries",            price: 150, image: "assets/images/fries.jpg" },
        { id: 3, name: "Pizza",            price: 500, image: "assets/images/pizza.jpg" },
        { id: 4, name: "Soda",             price: 100, image: "assets/images/soda.jpg" },
        { id: 5, name: "Chicken Sandwich", price: 300, image: "assets/images/sandwich.jpg" },
        { id: 6, name: "Ice Cream",        price: 200, image: "assets/images/icecream.jpg" }
    ];

    // =====================
    // CART STATE (loaded from localStorage so it persists across pages)
    // =====================
    let cart = JSON.parse(localStorage.getItem("arizona_cart") || "[]");

    function saveCart() {
        localStorage.setItem("arizona_cart", JSON.stringify(cart));
    }

    // =====================
    // BUILD MENU CARDS
    // =====================
    menuItems.forEach(item => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-2xl shadow-md p-4 w-52 text-center card-hover border border-orange-100";

        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}"
                 onerror="this.src='https://via.placeholder.com/200x150?text=${item.name}'"
                 class="w-full h-36 object-cover rounded-xl mb-3">
            <h3 class="text-gray-900 font-black text-base mb-1">${item.name}</h3>
            <p class="text-red-700 font-bold mb-3 text-sm">Ksh ${item.price}</p>
            <button onclick="addToCart(${item.id})"
                class="w-full bg-red-700 hover:bg-red-800 text-white py-2 rounded-xl font-bold transition text-sm">
                Add to Cart
            </button>
        `;

        menuDiv.appendChild(card);
    });

    // =====================
    // ADD TO CART (supports multiple quantities)
    // =====================
    window.addToCart = function (id) {
        const item = menuItems.find(i => i.id === id);
        const existing = cart.find(i => i.id === id);

        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...item, qty: 1 });
        }

        saveCart();
        showAddedToast(item.name);
    };

    // =====================
    // SMALL "ADDED TO CART" FEEDBACK
    // =====================
    function showAddedToast(name) {
        let toast = document.getElementById("added-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "added-toast";
            toast.className = "fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg z-50 text-sm font-semibold transition-opacity duration-300";
            document.body.appendChild(toast);
        }
        toast.textContent = `${name} added to cart!`;
        toast.style.opacity = "1";
        clearTimeout(window._toastTimeout);
        window._toastTimeout = setTimeout(() => {
            toast.style.opacity = "0";
        }, 1500);
    }

    // =====================
    // LOGOUT
    // =====================
    window.logout = function () {
        localStorage.removeItem("arizona_current_user");
        localStorage.removeItem("arizona_order_mode");
        localStorage.removeItem("arizona_cart");
        window.location.href = "index.html";
    };

});
