import React, { useState, useRef } from "react";

export default function AIChat() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "สวัสดีครับ 👋 บอกผม: ชื่อเว็บ/แบรนด์ ประเภทเว็บ กลุ่มลูกค้า โปรโมชั่น ช่องทางติดต่อ แล้วแนบรูปได้เรื่อย ๆ จากนั้นกด “สร้างเว็บ” เมื่อพร้อม" }
  ]);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState({
    name: "", type: "", audience: "", promotion: "", contact: ""
  });
  const [images, setImages] = useState([]); // Data URLs
  const fileRef = useRef(null);

  const questions = [
    { key: "name", prompt: "ชื่อเว็บ/แบรนด์คืออะไร?" },
    { key: "type", prompt: "ประเภทเว็บที่ต้องการ (เช่น ร้านอาหาร/ท่องเที่ยว/อสังหา/คลินิก/พอร์ตโฟลิโอ)?" },
    { key: "audience", prompt: "กลุ่มลูกค้าเป้าหมายคือใคร?" },
    { key: "promotion", prompt: "มีโปรโมชั่นหรือจุดขายอะไรบ้าง?" },
    { key: "contact", prompt: "ช่องทางติดต่อ (เช่น Line/โทร/อีเมล/ที่อยู่/แผนที่)?" },
  ];

  const step = questions.findIndex(q => !answers[q.key]);
  const nextPrompt = step >= 0 ? questions[step].prompt : "พร้อมสร้างเว็บแล้ว กดปุ่มด้านขวาได้เลย หรือคุยต่อ/แนบรูปเพิ่มก็ได้";

  function pushMsg(sender, text, extra = {}) {
    setMessages(m => [...m, { sender, text, ...extra }]);
  }

  async function onSend() {
    const content = input.trim();
    if (!content) return;
    pushMsg("you", content);

    // เก็บคำตอบแบบ step-by-step
    if (step >= 0) {
      const key = questions[step].key;
      setAnswers(a => ({ ...a, [key]: content }));
      setTimeout(() => pushMsg("ai", step + 1 < questions.length ? questions[step + 1].prompt : "โอเค ข้อมูลครบแล้ว แนบรูปเพิ่มได้ แล้วกด “สร้างเว็บ” ได้เลย"), 150);
    } else {
      // โหมดคุยต่อทั่วไป
      setTimeout(() => pushMsg("ai", "รับทราบครับ ถ้าพร้อมกด “สร้างเว็บ” ได้เลย หรือแนบรูปเพิ่มก็ได้"), 150);
    }

    setInput("");
  }

  async function filesToDataURLs(fileList) {
    const tasks = [...fileList].map(
      f => new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(f);
      })
    );
    return Promise.all(tasks);
  }

  async function onPickFiles(e) {
    const files = e.target.files;
    if (!files || !files.length) return;
    const urls = await filesToDataURLs(files);
    setImages(prev => [...prev, ...urls]);

    // พรีวิวรูปในแชต + ข้อความตอบรับจาก AI
    pushMsg("you", `อัปโหลดรูปจำนวน ${urls.length} รูปแล้ว`, { images: urls });
    setTimeout(() => pushMsg("ai", "ได้รับรูปแล้วครับ ✅ จะใช้รูปเหล่านี้ประกอบหน้าเว็บให้ ถ้ายังมีรูปเพิ่ม แนบต่อได้เลย"), 120);

    // reset เพื่อเลือกซ้ำได้
    e.target.value = "";
  }

  async function onGenerate() {
    const keyword = (answers.name || answers.type || "เว็บไซต์ตัวอย่าง").trim();
    const title = answers.name || keyword;

    pushMsg("you", "สร้างเว็บให้เลยครับ 🚀");
    pushMsg("ai", "กำลังสร้างเว็บ… (ใช้เวลาไม่กี่วินาที)");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword, title,
          info: answers,
          files: images  // ส่งหลายภาพ
        })
      });

      const data = await res.json();
      if (data?.url) {
        pushMsg("ai", `เสร็จแล้วครับ! เปิดหน้าเว็บที่สร้างขึ้นได้ที่\n${data.url}`);
        window.open(data.url, "_blank");
      } else if (data?.html) {
        // fallback เปิดพรีวิวในแท็บใหม่จาก blob
        const blob = new Blob([data.html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        pushMsg("ai", "เสร็จแล้วครับ! เปิดพรีวิวในแท็บใหม่");
        window.open(url, "_blank");
      } else {
        pushMsg("ai", "มีบางอย่างผิดพลาดในการสร้างเว็บ 😅 ลองอีกครั้งหรือส่งรายละเอียดเพิ่มได้ครับ");
      }
    } catch (err) {
      pushMsg("ai", "เครือข่ายขัดข้อง ลองใหม่อีกครั้งได้ครับ");
    }
  }

  return (
    <div className="w-full min-h-screen bg-neutral-900 text-white flex flex-col">
      <div className="max-w-3xl w-full mx-auto p-4 flex-1 flex flex-col">
        <h1 className="text-xl font-semibold mb-3">AI Builder</h1>
        <div className="flex-1 rounded-lg bg-neutral-800/60 border border-neutral-700 p-3 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.sender === "ai" ? "" : "justify-end"}`}>
              <div className={`${m.sender === "ai" ? "bg-neutral-800" : "bg-blue-600"} px-3 py-2 rounded-2xl max-w-[80%] whitespace-pre-wrap`}>
                {m.text}
                {m.images?.length ? (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {m.images.map((src, idx) => (
                      <img key={idx} src={src} alt={`upload-${idx}`} className="w-full h-24 object-cover rounded-md border border-neutral-700" />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {!!images.length && (
            <div className="flex justify-end">
              <div className="bg-blue-600/70 px-3 py-2 rounded-2xl max-w-[80%]">
                <div className="text-sm opacity-90 mb-1">รูปที่จะแนบไปสร้างเว็บ:</div>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((src, idx) => (
                    <img key={idx} src={src} alt={`staged-${idx}`} className="w-full h-24 object-cover rounded-md border border-neutral-700" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <input
            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 outline-none"
            placeholder={nextPrompt}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" ? onSend() : null}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onPickFiles}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="px-3 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 border border-neutral-600"
            title="แนบรูปภาพ"
          >
            แนบรูป
          </button>
          <button
            onClick={onSend}
            className="px-3 py-2 rounded-lg bg-neutral-200 text-black hover:bg-white"
          >
            ส่ง
          </button>
          <button
            onClick={onGenerate}
            className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-medium"
            title="สร้างเว็บจากข้อมูล/รูปที่มีตอนนี้"
          >
            สร้างเว็บ
          </button>
        </div>
      </div>
    </div>
  );
}
