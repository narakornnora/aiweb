// translator.js
import dotenv from "dotenv";
dotenv.config();

/**
 * แปลคำ/วลีไทยให้เป็น "คีย์เวิร์ดอังกฤษแบบสั้นๆ" (2–4 คำ) เพื่อใช้ค้นหารูปใน Unsplash
 * ถ้าไม่มี OPENAI_API_KEY จะคืนข้อความเดิม (fallback)
 */
export async function toEnglishKeyword(thaiText) {
  const input = String(thaiText || "").trim();
  if (!input) return "";

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // ไม่มีคีย์ก็ใช้คำเดิมไปก่อน จะช่วยไม่ให้เซิร์ฟเวอร์ล้ม
    return input;
  }

  const payload = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a translator. Translate the user's Thai phrase into a concise English search keyword (2–4 words) for searching images. Reply with English only, no punctuation."
      },
      {
        role: "user",
        content: input
      }
    ],
    temperature: 0.2
  };

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  // ถ้า OpenAI ล่มหรือคีย์ผิด ให้ fallback เป็นคำเดิม
  if (!resp.ok) return input;

  const data = await resp.json().catch(() => ({}));
  const text =
    data?.choices?.[0]?.message?.content?.trim() || input;
  return text;
}
