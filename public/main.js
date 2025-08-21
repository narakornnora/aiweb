async function sendMessage() {
  const input = document.getElementById("chat-input");
  const chatBox = document.getElementById("chat-box");

  const message = input.value.trim();
  if (!message) return;

  chatBox.innerHTML += `<p><b>คุณ:</b> ${message}</p>`;
  input.value = "";

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data = await res.json();
  chatBox.innerHTML += `<p><b>AI:</b> ${data.reply}</p>`;
}

async function generateWebsite() {
  const status = document.getElementById("status");
  status.innerHTML = "⏳ กำลังสร้างเว็บไซต์...";

  const res = await fetch("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: document.getElementById("chat-input").value }),
  });

  const data = await res.json();
  if (data.success) {
    status.innerHTML = `✅ สร้างเสร็จแล้ว <a href="${data.url}" target="_blank">🌐 ดูเว็บไซต์</a>`;
  } else {
    status.innerHTML = "❌ สร้างเว็บไม่สำเร็จ";
  }
}
