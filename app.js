document.addEventListener("DOMContentLoaded", function () {

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
    // CART STATE
    // =====================
    let cart = [];

    // =====================
    // DOM ELEMENTS
    // =====================
    const menuDiv    = document.getElementById("menu-items");
    const cartDiv    = document.getElementById("cart");
    const receiptDiv = document.getElementById("receipt");

    // =====================
    // BUILD MENU CARDS
    // =====================
    menuItems.forEach(item => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-2xl shadow-md p-4 w-52 text-center hover:-translate-y-1 transition-transform duration-200";

        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}"
                 onerror="this.src='https://via.placeholder.com/200x150?text=${item.name}'"
                 class="w-full h-36 object-cover rounded-xl mb-3">
            <h3 class="text-black font-bold text-base mb-1">${item.name}</h3>
            <p class="text-red-600 font-semibold mb-3">Ksh ${item.price}</p>
            <button id="btn-${item.id}" onclick="toggleCart(${item.id})"
                class="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition">
                Add to Cart
            </button>
        `;

        menuDiv.appendChild(card);
    });

    // =====================
    // TOGGLE: ADD / REMOVE FROM CART
    // =====================
    window.toggleCart = function (id) {
        const item   = menuItems.find(i => i.id === id);
        const exists = cart.find(i => i.id === id);
        const btn    = document.getElementById(`btn-${id}`);

        if (exists) {
            cart = cart.filter(i => i.id !== id);
            btn.textContent = "Add to Cart";
            btn.className = "w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition";
        } else {
            cart.push(item);
            btn.textContent = "Remove from Cart";
            btn.className = "w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition";
        }

        updateCart();
    };

    // =====================
    // UPDATE CART DISPLAY
    // =====================
    function updateCart() {
        cartDiv.innerHTML = `<h2 class="text-xl font-bold text-black text-center mb-4">Your Cart</h2>`;

        if (cart.length === 0) {
            cartDiv.innerHTML += `<p class="text-center text-gray-400 italic">Your cart is empty.</p>`;
            receiptDiv.classList.add("hidden");
            return;
        }

        cart.forEach(item => {
            cartDiv.innerHTML += `
                <div class="flex justify-between items-center py-2 border-b border-gray-100 text-black">
                    <span>${item.name}</span>
                    <span class="font-semibold">Ksh ${item.price}</span>
                </div>
            `;
        });

        updateReceipt();
    }

    // =====================
    // UPDATE RECEIPT PREVIEW
    // =====================
    function updateReceipt() {
        const total = cart.reduce((sum, item) => sum + item.price, 0);

        receiptDiv.classList.remove("hidden");

        let lines = "";
        cart.forEach(item => {
            lines += `
                <div class="flex justify-between py-2 border-b border-dashed border-gray-200 text-black">
                    <span>${item.name}</span>
                    <span>Ksh ${item.price}</span>
                </div>
            `;
        });

        receiptDiv.innerHTML = `
            <h2 class="text-xl font-bold text-black text-center mb-4">Order Summary</h2>
            ${lines}
            <div class="flex justify-between pt-4 font-bold text-red-600 text-lg">
                <span>TOTAL (${cart.length} item${cart.length > 1 ? "s" : ""})</span>
                <span>Ksh ${total}</span>
            </div>
            <button onclick="completePurchase()"
                class="mt-4 w-full bg-blue-700 hover:bg-blue-900 text-white font-bold py-3 rounded-xl transition text-lg">
                Pay Now — Ksh ${total}
            </button>
        `;
    }

    // =====================
    // COMPLETE PURCHASE
    // =====================
    window.completePurchase = function () {
        if (cart.length === 0) {
            alert("Your cart is empty! Add items first.");
            return;
        }

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const now   = new Date().toLocaleString();
        let itemLines = cart.map(i => `  - ${i.name.padEnd(20)} Ksh ${i.price}`).join("\n");

        alert(
`━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ARIZONA FAST FOOD
━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Date: ${now}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${itemLines}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TOTAL:              Ksh ${total}
━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Thank you for your order!
━━━━━━━━━━━━━━━━━━━━━━━━━━━`
        );

        // Reset cart state
        cart = [];

        // Reset all buttons to green "Add to Cart"
        menuItems.forEach(item => {
            const btn = document.getElementById(`btn-${item.id}`);
            if (btn) {
                btn.textContent = "Add to Cart";
                btn.className = "w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition";
            }
        });

        cartDiv.innerHTML = `
            <h2 class="text-xl font-bold text-black text-center mb-4">Your Cart</h2>
            <p class="text-center text-gray-400 italic">Your cart is empty.</p>
        `;
        receiptDiv.classList.add("hidden");
    };

    // =====================
    // UTILITY (for testing)
    // =====================
    window.calculateTotal = function () {
        return cart.reduce((sum, item) => sum + item.price, 0);
    };

});
