
// MENU ITEMS (with images)
const menuItems = [
    {
        id: 1,
        name: "Burger",
        price: 250,
        image: "assets/images/burger.jpg"
    },
    {
        id: 2,
        name: "Fries",
        price: 150,
        image: "assets/images/fries.jpg"
    },
    {
        id: 3,
        name: "Pizza",
        price: 500,
        image: "assets/images/pizza.jpg"
    },
    {
        id: 4,
        name: "Soda",
        price: 100,
        image: "assets/images/soda.jpg"
    }
];

// CART
let cart = [];

// DOM ELEMENTS
const menuDiv = document.getElementById("menu");
const cartDiv = document.getElementById("cart");
const receiptDiv = document.getElementById("receipt");


// =====================
// DISPLAY MENU
// =====================
menuItems.forEach(item => {
    const card = document.createElement("div");

    card.innerHTML = `
        <img src="${item.image}" width="200" height="150">
        <h3>${item.name}</h3>
        <p>Ksh ${item.price}</p>

        <button id="btn-${item.id}" onclick="toggleCart(${item.id})">
            Add to Cart
        </button>

        <hr>
    `;

    menuDiv.appendChild(card);
});


// =====================
// ADD / REMOVE TOGGLE
// =====================
function toggleCart(id) {
    const item = menuItems.find(i => i.id === id);
    const exists = cart.find(i => i.id === id);
    const btn = document.getElementById(`btn-${id}`);

    if (exists) {
        cart = cart.filter(i => i.id !== id);
        btn.innerText = "Add to Cart";
    } else {
        cart.push(item);
        btn.innerText = "Remove from Cart";
    }

    updateCart();
}


// =====================
// UPDATE CART
// =====================
function updateCart() {
    cartDiv.innerHTML = "<h2>Your Cart</h2>";

    cart.forEach(item => {
        cartDiv.innerHTML += `
            <p>${item.name} - Ksh ${item.price}</p>
        `;
    });

    updateReceipt();
}


// =====================
// RECEIPT
// =====================
function updateReceipt() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    receiptDiv.innerHTML = `
        <h2>Receipt</h2>
        <p>Total Items: ${cart.length}</p>
        <p>Total Amount: Ksh ${total}</p>

        <button onclick="generateReceipt()">Generate Receipt</button>
    `;
}


// =====================
// FINAL RECEIPT ALERT
// =====================
function generateReceipt() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    alert(`
ARIZONA FAST FOOD RECEIPT
-------------------------
Items: ${cart.length}
Total: Ksh ${total}
    `);
}


// =====================
// TOTAL FUNCTION (FOR TESTING ONLY)
// =====================
function calculateTotal() {
    return cart.reduce((sum, item) => sum + item.price, 0);
}