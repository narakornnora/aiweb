// server.js
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middlewares ----------
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------- Static ----------
const PUBLIC_DIR = path.join(__dirname, "public");
const GEN_DIR = path.join(PUBLIC_DIR, "generated");

// ensure dirs
await ensureDir(PUBLIC_DIR);
await ensureDir(GEN_DIR);

app.use(express.static(PUBLIC_DIR));

// ---------- Utilities ----------
async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    await fsp.mkdir(dir, { recursive: true });
  }
}

// ดึงรูปจาก Unsplash (ต้องมี UNSPLASH_ACCESS_KEY)
async function searchUnsplash(query, perPage = 10) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(perPage));

  const resp = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${key}` }
  });

  if (!resp.ok) return [];
  const data = await resp.json().catch(() => ({}));

  const results = Array.isArray(data?.results) ? data.results : [];
  // คืนเฉพาะ url + alt สะอาดๆ
  return results.map((r) => ({
    url: r?.urls?.regular || r?.urls?.full || r?.urls?.small,
    alt: r?.alt_description || r?.description || query
  })).filter(x => !!x.url);
}

function sanitize(str) {
  return String(str || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlTemplate({ title, translatedKeyword, headerImages, galleryImages }) {
  // ทำคารูเซล 3 ภาพแรก: สลับทุก 4 วิ พร้อม fade ช้าๆ
  // CSS แบบไม่พึ่ง lib ใดๆ
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<style>
  :root {
    --gap: 24px;
    --maxw: 1100px;
    --fade: 1.5s;       /* ความเร็วเฟด (ช้าๆ) */
    --interval: 4s;     /* เวลาหยุดแต่ละภาพ */
  }
  body {
    font-family: system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;
    margin: 0; color: #111; background:#fff;
  }
  .container { max-width: var(--maxw); margin: 0 auto; padding: 0 16px 64px; }
  header { position: relative; height: 56vh; min-height: 300px; width: 100%; overflow: hidden; background:#000; }
  .slide { position:absolute; inset:0; opacity:0; transition: opacity var(--fade) ease; background-position:center; background-size:cover; }
  .slide.active { opacity:1; }

  h1 { font-size: clamp(28px, 3.5vw, 44px); margin: 28px 0 8px; }
  .sub { color:#666; margin:0 0 28px; }

  .grid {
    display:grid; gap: var(--gap);
    grid-template-columns: repeat(12, 1fr);
  }
  .card {
    grid-column: span 12;
    border-radius: 16px; overflow:hidden; background:#f7f7f8;
  }
  .card img { display:block; width:100%; height: 260px; object-fit: cover; }
  @media (min-width: 640px) { .card { grid-column: span 6; } }
  @media (min-width: 1024px) { .card { grid-column: span 4; } }

  .caption { padding:10px 12px; font-size: 14px; color:#444; }
</style>
</head>
<body>

<header id="hero">
  ${headerImages.map((img, i) => `
  <div class="slide${i===0 ? " active" : ""}"
       style="background-image:url('${img.url}');"
       aria-label="${sanitize(img.alt)}"></div>`).join("")}
</header>

<div class="container">
  <h1>${title}</h1>
  <p class="sub">Translated keyword: <strong>${translatedKeyword}</strong></p>

  <section class="grid">
    ${galleryImages.map((img) => `
    <figure class="card">
      <img src="${img.url}" alt="${sanitize(img.alt)}" loading="lazy" />
      <figcaption class="caption">${sanitize(img.alt)}</figcaption>
    </figure>`).join("")}
  </section>
</div>

<script>
  // ควบคุมคารูเซล: เปลี่ยนทุก 4 วิ พร้อม transition ช้า (กำหนดใน CSS)
  (function() {
    const slides = Array.from(document.querySelectorAll('.slide'));
    if (slides.length <= 1) return;
    let i = 0;
    setInterval(() => {
      const cur = slides[i];
      i = (i + 1) % slides.length;
      const next = slides[i];
      cur.classList.remove('active');
      next.classList.add('active');
    }, 4000); // 4 วินาที
  })();
</script>

</body>
</html>`;
}

// ---------- Routes ----------
app.get("/health", (_, res) => res.json({ ok: true }));

// แปลอย่างเดียว (debug/test)
app.post("/api/translate", async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "text is required" });
    }
    // inline import เพื่อเลี่ยง circular
    const { toEnglishKeyword } = await import("./translator.js");
    const translated = await toEnglishKeyword(text);
    res.json({ original: text, translated });
  } catch (e) {
    console.error("translate error:", e);
    res.status(500).json({ error: "translate failed" });
  }
});

// สร้างหน้าเว็บ: แปล → ดึงรูป → เขียนไฟล์ HTML → คืน URL
app.post("/api/generate", async (req, res) => {
  try {
    const { keyword, title } = req.body || {};
    const base = String(keyword || "").trim();
    if (!base) return res.status(400).json({ error: "keyword is required" });

    const { toEnglishKeyword } = await import("./translator.js");
    const translated = await toEnglishKeyword(base);

    // ดึงภาพ 10 รูป
    const images = await searchUnsplash(translated, 10);
    if (!images.length) {
      // ไม่มีภาพก็ยังสร้างหน้าได้ แต่อาจจะไม่มีเฮดเดอร์/แกลเลอรี
      console.warn("No images from Unsplash for:", translated);
    }
    const headerImages = images.slice(0, 3);
    const galleryImages = images.slice(0, 10);

    const pageTitle = sanitize(title || base);
    const html = htmlTemplate({
      title: pageTitle,
      translatedKeyword: translated,
      headerImages,
      galleryImages
    });

    const filename = `site_${Date.now()}.html`;
    const filepath = path.join(GEN_DIR, filename);
    await fsp.writeFile(filepath, html, "utf8");
    const url = `/generated/${filename}`;

    res.json({ ok: true, url, translatedKeyword: translated });
  } catch (e) {
    console.error("generate error:", e);
    res.status(500).json({ error: "generate failed" });
  }
});

// เดิม /api/chat (ยังคงไว้ให้ใช้งานได้)
app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();
    if (!message) return res.status(400).json({ error: "message is required" });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.json({
        reply:
          "Server: ยังไม่ได้ตั้งค่า OPENAI_API_KEY ใน .env ครับ (ตอบกลับแบบจำลอง)"
      });
    }

    const payload = {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
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

    if (!resp.ok) {
      const err = await resp.text();
      return res.status(500).json({ error: `OpenAI error: ${err}` });
    }
    const data = await resp.json().catch(() => ({}));
    const reply = data?.choices?.[0]?.message?.content?.trim() || "";
    res.json({ reply });
  } catch (e) {
    console.error("chat error:", e);
    res.status(500).json({ error: "chat failed" });
  }
});

// ---------- Start ----------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
