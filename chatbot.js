// ============================================
// ARIZONA FAST FOOD - AI CHAT ASSISTANT
// Floating chat bubble, available on every page.
// Knows which page it's on and answers accordingly.
// ============================================

(function () {

    // ── PAGE CONTEXT ──
    const page = window.location.pathname.split("/").pop() || "index.html";

    const pageContext = {
        "index.html": "The customer is on the Home page. You can tell them about Arizona Fast Food's story, services (Dine-in, Takeout, Delivery, Catering), location, opening hours, and how to contact or order.",
        "welcome.html": "The customer just logged in and is choosing between Dine-in or Delivery ordering.",
        "table.html": "The customer is entering their table number for a dine-in order.",
        "delivery.html": "The customer is entering their delivery address and seeing the delivery fee before ordering.",
        "menu.html": "The customer is on the Menu page. Help them with menu items: Burger (Ksh 250), Fries (Ksh 150), Pizza (Ksh 500), Soda (Ksh 100), Chicken Sandwich (Ksh 300), Ice Cream (Ksh 200). You can describe what's likely in each, suggest combos, and explain how to add items to cart.",
        "cart.html": "The customer is on the Cart page reviewing their order before paying. Help with questions about checkout, M-Pesa payment, changing quantities, or removing items.",
        "receipt.html": "The customer just completed an order and is viewing their receipt with a QR code. Help with questions about their order, pickup, delivery, or what to do next.",
        "login.html": "The customer is on the Sign In / Sign Up page. Help with account creation or login issues.",
    };

    const context = pageContext[page] || pageContext["index.html"];

    const SYSTEM_PROMPT = `You are a friendly, helpful assistant for Arizona Fast Food, a family-owned restaurant in Nairobi, Kenya serving burgers, fries, pizza, sandwiches, and more since 2004.

${context}

Restaurant info:
- Location: Nairobi, Kenya
- Phone/WhatsApp: 0113 368 871
- Hours: Open Daily, 8am - 10pm
- Services: Dine-in, Takeout, Delivery, Catering

Keep answers SHORT (2-3 sentences max), warm, and conversational. If you don't know something specific, suggest they contact the restaurant directly via WhatsApp or the contact form. Never make up prices or menu items not listed above.`;

    // ── INJECT CHAT BUBBLE UI ──
    const widget = document.createElement("div");
    widget.innerHTML = `
        <style>
            #aff-chat-bubble {
                position: fixed; bottom: 24px; right: 24px; z-index: 9999;
                width: 56px; height: 56px; border-radius: 50%;
                background: linear-gradient(135deg, #c0392b, #922b21);
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; box-shadow: 0 6px 20px rgba(192,57,43,0.4);
                transition: transform 0.2s;
                font-family: Arial, sans-serif;
            }
            #aff-chat-bubble:hover { transform: scale(1.08); }
            #aff-chat-bubble svg { width: 26px; height: 26px; fill: white; }

            #aff-chat-window {
                position: fixed; bottom: 94px; right: 24px; z-index: 9999;
                width: 320px; max-width: calc(100vw - 48px); height: 440px;
                background: #fff8f0; border-radius: 18px; box-shadow: 0 12px 40px rgba(0,0,0,0.25);
                display: none; flex-direction: column; overflow: hidden;
                font-family: Arial, sans-serif; border: 1px solid #e8c99a;
            }
            #aff-chat-window.open { display: flex; }

            #aff-chat-header {
                background: linear-gradient(135deg, #1a0a00, #3d1a00);
                color: white; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between;
            }
            #aff-chat-header .title { font-weight: 900; font-size: 14px; color: #f39c12; letter-spacing: 0.5px; }
            #aff-chat-header .subtitle { font-size: 11px; color: #d8a878; margin-top: 2px; }
            #aff-chat-close { cursor: pointer; font-size: 20px; color: #ccc; line-height: 1; }
            #aff-chat-close:hover { color: white; }

            #aff-chat-messages {
                flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;
            }
            .aff-msg { max-width: 85%; padding: 9px 13px; border-radius: 14px; font-size: 13px; line-height: 1.4; }
            .aff-msg.bot { background: white; color: #333; align-self: flex-start; border: 1px solid #f0d9b5; border-bottom-left-radius: 4px; }
            .aff-msg.user { background: #c0392b; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
            .aff-msg.typing { background: white; color: #999; align-self: flex-start; border: 1px solid #f0d9b5; font-style: italic; }

            #aff-chat-input-row {
                display: flex; gap: 8px; padding: 12px; border-top: 1px solid #e8c99a; background: white;
            }
            #aff-chat-input {
                flex: 1; border: 1px solid #e8c99a; border-radius: 20px; padding: 8px 14px;
                font-size: 13px; outline: none; font-family: Arial, sans-serif;
            }
            #aff-chat-input:focus { border-color: #c0392b; }
            #aff-chat-send {
                background: #c0392b; color: white; border: none; border-radius: 50%;
                width: 36px; height: 36px; cursor: pointer; flex-shrink: 0;
                display: flex; align-items: center; justify-content: center;
            }
            #aff-chat-send:hover { background: #922b21; }
            #aff-chat-send:disabled { opacity: 0.5; cursor: not-allowed; }
        </style>

        <div id="aff-chat-bubble">
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
        </div>

        <div id="aff-chat-window">
            <div id="aff-chat-header">
                <div>
                    <div class="title">ARIZONA ASSISTANT</div>
                    <div class="subtitle">Ask me anything!</div>
                </div>
                <div id="aff-chat-close">&times;</div>
            </div>
            <div id="aff-chat-messages">
                <div class="aff-msg bot">Hi! 👋 I'm here to help with anything about Arizona Fast Food — menu, orders, hours, or location. What would you like to know?</div>
            </div>
            <div id="aff-chat-input-row">
                <input id="aff-chat-input" type="text" placeholder="Type your question..." />
                <button id="aff-chat-send">➤</button>
            </div>
        </div>
    `;
    document.body.appendChild(widget);

    // ── ELEMENTS ──
    const bubble = document.getElementById("aff-chat-bubble");
    const chatWindow = document.getElementById("aff-chat-window");
    const closeBtn = document.getElementById("aff-chat-close");
    const messagesDiv = document.getElementById("aff-chat-messages");
    const input = document.getElementById("aff-chat-input");
    const sendBtn = document.getElementById("aff-chat-send");

    // ── TOGGLE OPEN/CLOSE ──
    bubble.addEventListener("click", () => {
        chatWindow.classList.toggle("open");
        if (chatWindow.classList.contains("open")) input.focus();
    });
    closeBtn.addEventListener("click", () => chatWindow.classList.remove("open"));

    // ── CONVERSATION HISTORY ──
    let history = [];

    function addMessage(text, sender) {
        const msg = document.createElement("div");
        msg.className = `aff-msg ${sender}`;
        msg.textContent = text;
        messagesDiv.appendChild(msg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        return msg;
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, "user");
        history.push({ role: "user", content: text });
        input.value = "";
        sendBtn.disabled = true;

        const typingMsg = addMessage("Typing...", "typing");

        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-6",
                    max_tokens: 300,
                    system: SYSTEM_PROMPT,
                    messages: history
                })
            });

            const data = await response.json();
            const reply = data.content?.find(c => c.type === "text")?.text || "Sorry, I couldn't process that. Please try again or contact us on WhatsApp!";

            typingMsg.remove();
            addMessage(reply, "bot");
            history.push({ role: "assistant", content: reply });

        } catch (err) {
            typingMsg.remove();
            addMessage("Sorry, something went wrong. Please contact us on WhatsApp for quick help!", "bot");
        }

        sendBtn.disabled = false;
    }

    sendBtn.addEventListener("click", sendMessage);
    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

})();
