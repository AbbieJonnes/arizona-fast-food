document.addEventListener("DOMContentLoaded", function () {

    // =====================
    // REQUIRE LOGIN
    // =====================
    const currentUser = JSON.parse(localStorage.getItem("arizona_current_user") || "null");
    if (!currentUser) {
        sessionStorage.setItem("redirect_after_login", "cart.html");
        window.location.href = "login.html";
        return;
    }

    // =====================
    // LOAD CART + ORDER MODE
    // =====================
    let cart = JSON.parse(localStorage.getItem("arizona_cart") || "[]");
    const orderMode = JSON.parse(localStorage.getItem("arizona_order_mode") || "null");

    if (!orderMode || !orderMode.type) {
        window.location.href = "welcome.html";
        return;
    }

    const deliveryFee = orderMode.type === "delivery" ? (orderMode.deliveryFee || 0) : 0;

    const cartItemsDiv = document.getElementById("cart-items");
    const emptyCartDiv = document.getElementById("empty-cart");
    const cartSummaryDiv = document.getElementById("cart-summary");
    const totalItemsEl = document.getElementById("total-items");
    const totalAmountEl = document.getElementById("total-amount");

    function saveCart() {
        localStorage.setItem("arizona_cart", JSON.stringify(cart));
    }

    function calculateSubtotal() {
        return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    }

    function calculateTotal() {
        return calculateSubtotal() + deliveryFee;
    }

    function calculateItemCount() {
        return cart.reduce((sum, item) => sum + item.qty, 0);
    }

    // =====================
    // RENDER CART
    // =====================
    function renderCart() {
        cartItemsDiv.innerHTML = "";

        if (cart.length === 0) {
            emptyCartDiv.classList.remove("hidden");
            cartSummaryDiv.classList.add("hidden");
            return;
        }

        emptyCartDiv.classList.add("hidden");
        cartSummaryDiv.classList.remove("hidden");

        cart.forEach(item => {
            const row = document.createElement("div");
            row.className = "bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 border border-orange-100";

            row.innerHTML = `
                <img src="${item.image}" alt="${item.name}"
                     onerror="this.src='https://via.placeholder.com/80x80?text=${item.name}'"
                     class="w-16 h-16 object-cover rounded-xl flex-shrink-0">

                <div class="flex-1 text-left">
                    <p class="font-bold text-gray-900">${item.name}</p>
                    <p class="text-red-700 font-semibold text-sm">Ksh ${item.price} each</p>
                </div>

                <div class="flex items-center gap-2">
                    <button onclick="decreaseQty(${item.id})"
                        class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition">-</button>
                    <span class="w-6 text-center font-bold text-gray-900">${item.qty}</span>
                    <button onclick="increaseQty(${item.id})"
                        class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center transition">+</button>
                </div>

                <p class="font-black text-gray-900 w-20 text-right">Ksh ${item.price * item.qty}</p>

                <button onclick="deleteItem(${item.id})"
                    class="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition flex-shrink-0">
                    <i class="fas fa-trash text-sm"></i>
                </button>
            `;

            cartItemsDiv.appendChild(row);
        });

        totalItemsEl.textContent = `${calculateItemCount()} item${calculateItemCount() > 1 ? "s" : ""}`;

        // Show subtotal + delivery fee breakdown if delivery
        const breakdownEl = document.getElementById("fee-breakdown");
        if (orderMode.type === "delivery") {
            if (breakdownEl) {
                breakdownEl.innerHTML = `
                    <div class="flex justify-between text-sm text-gray-600 pb-1">
                        <span>Subtotal</span><span>Ksh ${calculateSubtotal()}</span>
                    </div>
                    <div class="flex justify-between text-sm text-gray-600 pb-2 border-b border-dashed border-gray-200">
                        <span>Delivery Fee</span><span>Ksh ${deliveryFee}</span>
                    </div>
                `;
            }
        }

        totalAmountEl.textContent = `Ksh ${calculateTotal()}`;
    }

    // =====================
    // QUANTITY CONTROLS
    // =====================
    window.increaseQty = function (id) {
        const item = cart.find(i => i.id === id);
        if (item) item.qty += 1;
        saveCart();
        renderCart();
    };

    window.decreaseQty = function (id) {
        const item = cart.find(i => i.id === id);
        if (item) {
            item.qty -= 1;
            if (item.qty <= 0) {
                cart = cart.filter(i => i.id !== id);
            }
        }
        saveCart();
        renderCart();
    };

    // =====================
    // DELETE ITEM
    // =====================
    window.deleteItem = function (id) {
        cart = cart.filter(i => i.id !== id);
        saveCart();
        renderCart();
    };

    // =====================
    // GO TO PAYMENT (M-Pesa modal)
    // =====================
    window.goToPayment = function () {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const total = calculateTotal();
        document.getElementById("mpesa-amount").textContent = `Ksh ${total}`;
        document.getElementById("mpesa-pin").value = "";
        document.getElementById("pin-error").classList.add("hidden");
        document.getElementById("mpesa-processing").classList.add("hidden");
        document.getElementById("mpesa-buttons").classList.remove("hidden");
        document.getElementById("mpesa-pin").classList.remove("hidden");
        document.getElementById("mpesa-modal").classList.remove("hidden");
    };

    window.confirmMpesa = function () {
        const pin = document.getElementById("mpesa-pin").value;

        if (pin.length < 4) {
            document.getElementById("pin-error").textContent = "Please enter your 4-digit PIN.";
            document.getElementById("pin-error").classList.remove("hidden");
            return;
        }

        document.getElementById("mpesa-buttons").classList.add("hidden");
        document.getElementById("mpesa-pin").classList.add("hidden");
        document.getElementById("pin-error").classList.add("hidden");
        document.getElementById("mpesa-processing").classList.remove("hidden");

        setTimeout(() => {
            const orderNo = "AFF-" + Date.now().toString().slice(-6);
            const subtotal = calculateSubtotal();
            const total = calculateTotal();

            const orderData = {
                orderNo,
                cart,
                subtotal,
                deliveryFee,
                total,
                orderMode
            };

            localStorage.setItem("arizona_order", JSON.stringify(orderData));
            localStorage.removeItem("arizona_cart"); // clear cart after payment
            localStorage.removeItem("arizona_order_mode"); // clear order mode for next order

            // Notify staff via Formspree (fire and forget)
            notifyStaff(orderNo, total);

            window.location.href = "receipt.html";
        }, 2500);
    };

    // =====================
    // NOTIFY STAFF OF NEW ORDER
    // =====================
    function notifyStaff(orderNo, total) {
        const itemsList = cart.map(i => `${i.name} x${i.qty} (Ksh ${i.price * i.qty})`).join(", ");
        const orderTypeText = orderMode.type === "dinein"
            ? `Dine-in - Table ${orderMode.tableNumber}`
            : `Delivery - ${orderMode.address} (Phone: ${orderMode.phone})`;

        const formData = new FormData();
        formData.append("Order Number", orderNo);
        formData.append("Customer", currentUser.name);
        formData.append("Customer Phone", currentUser.phone);
        formData.append("Order Type", orderTypeText);
        formData.append("Items", itemsList);
        formData.append("Total", `Ksh ${total}`);

        fetch("https://formspree.io/f/xwvjjwed", {
            method: "POST",
            body: formData,
            headers: { "Accept": "application/json" }
        }).catch(() => {
            // Silent fail - don't block the customer's checkout if notification fails
            console.log("Staff notification failed to send.");
        });
    }

    window.cancelMpesa = function () {
        document.getElementById("mpesa-modal").classList.add("hidden");
    };

    // Initial render
    renderCart();

});
