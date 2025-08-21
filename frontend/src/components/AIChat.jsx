import React, { useState } from "react";

function AIChat() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "สวัสดีครับ 👋 บอกผม: ชื่อธุรกิจ / ประเภทเว็บ / กลุ่มลูกค้า / โปรโมชั่น / ช่องทางติดต่อ แล้วกด “สร้างเว็บ” ได้เลย" }
  ]);
  const [input, setInput] = useState("");

  // ✅ ส่งข้อความไป backend
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages([...messages, newMessage]);
    setInput("");

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    }
  };

  // ✅ สร้างเว็บ
  const generateSite = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input || "เว็บไซต์ของฉัน" }),
      });

      const data = await res.json();
      if (data.html) {
        const blob = new Blob([data.html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error("Generate error:", err);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", border: "1px solid #ccc", borderRadius: "10px", padding: "20px" }}>
      <h2>🤖 AI Builder</h2>
      <div style={{ height: "300px", overflowY: "auto", border: "1px solid #eee", padding: "10px", marginBottom: "10px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
            <b>{msg.sender === "user" ? "คุณ" : "AI"}:</b> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="พิมพ์ข้อความที่นี่..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        style={{ width: "70%", padding: "8px" }}
      />
      <button onClick={sendMessage} style={{ marginLeft: "10px" }}>ส่ง</button>
      <button onClick={generateSite} style={{ marginLeft: "10px", backgroundColor: "green", color: "white" }}>สร้างเว็บ</button>
    </div>
  );
}

export default AIChat;
