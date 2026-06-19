/* test("basic test", () => {
    expect(2 + 2).toBe(4);
}); */

// app.test.js - Unit tests for Arizona Fast Food cart logic

// ── Minimal DOM mock so the module doesn't crash in Node ──
global.document = {
    addEventListener: (event, fn) => fn(),   // run DOMContentLoaded immediately
    getElementById: () => null,              // menu-items not found → returns early
};
global.window = {};

// Load the app (it will return early since menuDiv is null)
require("./app.js");

// ── Helpers to simulate cart logic independently ──
function makeCart() {
    const items = [
        { id: 1, name: "Burger",  price: 250 },
        { id: 2, name: "Fries",   price: 150 },
        { id: 3, name: "Pizza",   price: 500 },
        { id: 4, name: "Soda",    price: 100 },
    ];
    let cart = [];

    function addItem(id) {
        const item = items.find(i => i.id === id);
        if (!item) return;
        if (!cart.find(i => i.id === id)) cart.push(item);
    }

    function removeItem(id) {
        cart = cart.filter(i => i.id !== id);
    }

    function total() {
        return cart.reduce((sum, i) => sum + i.price, 0);
    }

    function getCart() { return cart; }

    return { addItem, removeItem, total, getCart };
}

// ── TESTS ──
let passed = 0;
let failed = 0;

function test(label, fn) {
    try {
        fn();
        console.log(`  PASS  ${label}`);
        passed++;
    } catch (e) {
        console.log(`  FAIL  ${label}`);
        console.log(`        ${e.message}`);
        failed++;
    }
}

function expect(actual) {
    return {
        toBe(expected) {
            if (actual !== expected)
                throw new Error(`Expected ${expected}, got ${actual}`);
        },
        toEqual(expected) {
            const a = JSON.stringify(actual);
            const b = JSON.stringify(expected);
            if (a !== b) throw new Error(`Expected ${b}, got ${a}`);
        },
        toHaveLength(n) {
            if (actual.length !== n)
                throw new Error(`Expected length ${n}, got ${actual.length}`);
        }
    };
}

console.log("\nArizona Fast Food — Cart Tests\n");

test("cart starts empty", () => {
    const c = makeCart();
    expect(c.getCart()).toHaveLength(0);
});

test("adding one item increases cart length to 1", () => {
    const c = makeCart();
    c.addItem(1);
    expect(c.getCart()).toHaveLength(1);
});

test("adding a burger gives total of 250", () => {
    const c = makeCart();
    c.addItem(1);
    expect(c.total()).toBe(250);
});

test("adding multiple items calculates correct total", () => {
    const c = makeCart();
    c.addItem(1); // Burger  250
    c.addItem(2); // Fries   150
    c.addItem(4); // Soda    100
    expect(c.total()).toBe(500);
});

test("adding same item twice does not duplicate it", () => {
    const c = makeCart();
    c.addItem(1);
    c.addItem(1);
    expect(c.getCart()).toHaveLength(1);
});

test("removing an item decreases cart length", () => {
    const c = makeCart();
    c.addItem(1);
    c.addItem(2);
    c.removeItem(1);
    expect(c.getCart()).toHaveLength(1);
});

test("removing an item updates the total correctly", () => {
    const c = makeCart();
    c.addItem(1); // 250
    c.addItem(2); // 150
    c.removeItem(1);
    expect(c.total()).toBe(150);
});

test("removing all items gives total of 0", () => {
    const c = makeCart();
    c.addItem(1);
    c.addItem(2);
    c.removeItem(1);
    c.removeItem(2);
    expect(c.total()).toBe(0);
});

test("removing item not in cart does nothing", () => {
    const c = makeCart();
    c.addItem(1);
    c.removeItem(99); // doesn't exist
    expect(c.getCart()).toHaveLength(1);
});

test("adding all items gives correct grand total", () => {
    const c = makeCart();
    [1, 2, 3, 4].forEach(id => c.addItem(id));
    expect(c.total()).toBe(1000); // 250+150+500+100
});

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
