// ===============================
// SARANOR DEMO — LIVE MODE (RAILWAY)
// ===============================

const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

if (!input || !sendBtn || !messages) {
  console.error("Demo elements missing from HTML.");
}

// IMPORTANT: this MUST match your FastAPI route (Swagger showed POST /chat)
const API_ENDPOINT = "https://saranor-demo-backend-production.up.railway.app/chat";

function addMessage(content, type) {
  const msg = document.createElement("div");
  msg.className = `msg ${type}`;
  msg.textContent = content;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
  return msg;
}

async function handleSend() {
  const text = (input.value || "").trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  sendBtn.disabled = true;
  const status = addMessage("Analyzing input…", "status");

  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Most FastAPI ChatRequest schemas use "message"
      body: JSON.stringify({ message: text })
    });

    // If backend returns 4xx/5xx, show the payload for debugging
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();

    // Try common response fields safely
    const reply = data.reply || "No insight returned.";


    status.remove();
    addMessage(reply || "No insight returned from the service.", "ai");
  } catch (err) {
    console.error(err);
    status.textContent = "Insight service unavailable. Please try again.";
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

sendBtn.addEventListener("click", handleSend);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSend();
  }
});
