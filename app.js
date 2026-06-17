document.addEventListener("DOMContentLoaded", function () {

    // Only run menu logic if we're on menu.html
    const menuDiv = document.getElementById("menu-items");
    if (!menuDiv) return;

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

    const cartDiv      = document.getElementById("cart");
    const summaryDiv   = document.getElementById("order-summary");
    const summaryLines = document.getElementById("summary-lines");
    const summaryTotal = document.getElementById("summary-total");

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
    // TOGGLE CART
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
    // UPDATE CART
    // =====================
    function updateCart() {
        cartDiv.innerHTML = `<h2 class="text-xl font-bold text-black text-center mb-4">Your Cart</h2>`;

        if (cart.length === 0) {
            cartDiv.innerHTML += `<p class="text-center text-gray-400 italic">Your cart is empty.</p>`;
            summaryDiv.classList.add("hidden");
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

        updateSummary();
    }

    // =====================
    // UPDATE ORDER SUMMARY
    // =====================
    function updateSummary() {
        const total = calculateTotal();

        summaryDiv.classList.remove("hidden");
        summaryLines.innerHTML = "";

        cart.forEach(item => {
            summaryLines.innerHTML += `
                <div class="flex justify-between py-2 border-b border-dashed border-gray-200 text-black text-sm">
                    <span>${item.name}</span>
                    <span>Ksh ${item.price}</span>
                </div>
            `;
        });

        summaryTotal.innerHTML = `
            <span>TOTAL (${cart.length} item${cart.length > 1 ? "s" : ""})</span>
            <span>Ksh ${total}</span>
        `;
    }

    // =====================
    // PAY NOW → OPEN M-PESA MODAL
    // =====================
    window.goToReceipt = function () {
        if (cart.length === 0) {
            alert("Your cart is empty! Add items first.");
            return;
        }

        const total = calculateTotal();

        // Show amount in modal
        document.getElementById("mpesa-amount").textContent = `Ksh ${total}`;

        // Reset modal state
        document.getElementById("mpesa-pin").value = "";
        document.getElementById("pin-error").classList.add("hidden");
        document.getElementById("mpesa-processing").classList.add("hidden");
        document.getElementById("mpesa-buttons").classList.remove("hidden");
        document.getElementById("mpesa-pin").classList.remove("hidden");

        // Show modal
        document.getElementById("mpesa-modal").classList.remove("hidden");
    };

    // =====================
    // CONFIRM M-PESA PIN
    // =====================
    window.confirmMpesa = function () {
        const pin = document.getElementById("mpesa-pin").value;

        if (pin.length < 4) {
            document.getElementById("pin-error").textContent = "Please enter your 4-digit PIN.";
            document.getElementById("pin-error").classList.remove("hidden");
            return;
        }

        // Hide buttons and PIN, show spinner
        document.getElementById("mpesa-buttons").classList.add("hidden");
        document.getElementById("mpesa-pin").classList.add("hidden");
        document.getElementById("pin-error").classList.add("hidden");
        document.getElementById("mpesa-processing").classList.remove("hidden");

        // Simulate processing delay then go to receipt
        setTimeout(() => {
            const orderNo = "AFF-" + Date.now().toString().slice(-6);
            const total   = calculateTotal();

            localStorage.setItem("arizona_order", JSON.stringify({
                orderNo,
                cart,
                total
            }));

            window.location.href = "receipt.html";
        }, 2500);
    };

    // =====================
    // CANCEL M-PESA MODAL
    // =====================
    window.cancelMpesa = function () {
        document.getElementById("mpesa-modal").classList.add("hidden");
    };

    // =====================
    // UTILITY
    // =====================
    window.calculateTotal = function () {
        return cart.reduce((sum, item) => sum + item.price, 0);
    };

    // Internal alias (same function)
    function calculateTotal() {
        return cart.reduce((sum, item) => sum + item.price, 0);
    }

});
