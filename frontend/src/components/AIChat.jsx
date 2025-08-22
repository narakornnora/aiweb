import React, { useState } from "react";


function AIChat() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "สวัสดีครับ 👋 กรุณาระบุชื่อเว็บของคุณ" }
  ]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [siteInfo, setSiteInfo] = useState({
    name: "",
    type: "",
    audience: "",
    promotions: "",
    contacts: "",
  });
  const [file, setFile] = useState(null);

  // handle user input and step-by-step questions
  const handleUserInput = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages([...messages, { sender: "user", text: userText }]);
    setInput("");

    if (step === 0) {
      setSiteInfo({ ...siteInfo, name: userText });
      askNext("ประเภทเว็บของคุณคืออะไร?");
    } else if (step === 1) {
      setSiteInfo({ ...siteInfo, type: userText });
      askNext("กลุ่มลูกค้าเป้าหมายของคุณคือใคร?");
    } else if (step === 2) {
      setSiteInfo({ ...siteInfo, audience: userText });
      askNext("มีโปรโมชั่นหรือไม?");
    } else if (step === 3) {
      setSiteInfo({ ...siteInfo, promotions: userText });
      askNext("ต้องการช่องทางติดอะไรบ้าง?");
    } else if (step === 4) {
      setSiteInfo({ ...siteInfo, contacts: userText });
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "ข้อมูลครบแล้ว! คุณสามารถที่จะแนบไฟล์ได้ถ้าต้องการ และคลิก \"\u0e2aร้างเว็บ\" เพื่อสร้างเว็บไซต์",
        },
      ]);
      setStep(5);
    }
  };

  const askNext = (question) => {
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "ai", text: question }]);
      setStep((prev) => prev + 1);
    }, 500);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
  };

  const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateSite = async () => {
    try {
      const keyword = siteInfo.name || siteInfo.type || "เว็บไซต์ของฉัน";
      const payload = { keyword, title: keyword, info: siteInfo };
      if (file) {
        const base64 = await fileToDataURL(file);
        payload.file = base64;
      }
      const res = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.url) {
        const pageUrl = `http://localhost:5000${data.url}`;
        window.open(pageUrl, "_blank");
      } else if (data.html) {
        const blob = new Blob([data.html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error("Generate error:", err);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        border: "1px solid #ccc",
        borderRadius: "10px",
        padding: "20px",
      }}
    >
      <h2>🤖 AI Builder</h2>
      <div
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #eee",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{ textAlign: msg.sender === "user" ? "right" : "left" }}
          >
            <b>{msg.sender === "user" ? "คุณ" : "AI"}:</b> {msg.text}
          </div>
        ))}
        {file && (
          <div style={{ marginTop: "10px" }}>
            <b>ไฟล์ที่แนบ:</b> {file.name}
          </div>
        )}
      </div>
      {step <= 4 && (
        <>
          <input
            type="text"
            placeholder="พิมพ์ข้อความที่นี่..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUserInput()}
            style={{ width: "70%", padding: "8px" }}
          />
          <button onClick={handleUserInput} style={{ marginLeft: "10px" }}>ส่ง</button>
        </>
      )}
      {step >= 5 && (
        <>
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: "block", marginBottom: "10px" }}
          />
          <button
            onClick={generateSite}
            style={{ marginTop: "10px", backgroundColor: "green", color: "white" }}
          >
            สร้างเว็บ
          </button>
        </>
      )}
    </div>
  );
}

export default AIChat;
