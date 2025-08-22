// … (import/express/config เดิมคงไว้)

app.post("/api/generate", async (req, res) => {
  try {
    const { keyword, title, info, files = [] } = req.body || {};
    const base = String(keyword || "").trim();
    if (!base && files.length === 0) {
      return res.status(400).json({ error: "keyword or images required" });
    }

    // 1) เตรียมรูป header + gallery
    //    - ใช้รูปจาก Unsplash/Pixabay ถ้าคุณมีโค้ดเดิมอยู่
    //    - แต่ให้รวมรูปจากผู้ใช้ (files: Data URL) เข้าไปด้วย
    const userImages = files
      .filter(s => typeof s === "string" && s.startsWith("data:"))
      .map((s, i) => ({ url: s, alt: `user-${i}` }));

    // ตัวอย่าง: ดึงจากเดิมที่คุณมี (ถ้ามี) หรือใช้รูปผู้ใช้เป็นหลัก
    let fetched = []; // [{url, alt}]
    // TODO: ถ้ามีโค้ด searchUnsplash อยู่แล้ว ให้เติมลง fetched ที่นี่

    const all = [...userImages, ...fetched];
    const headerImages = all.slice(0, 3);
    const galleryImages = all.slice(3);

    // 2) สร้าง HTML (เทมเพลตเรียบง่าย สวยสะอาด)
    const safe = v => String(v || "").replace(/[<>&"']/g, s => ({
      "<":"&lt;", ">":"&gt;", "&":"&amp;", "\"":"&quot;", "'":"&#039;"
    }[s]));

    const pageTitle = safe(title || base || "เว็บไซต์ของคุณ");

    const html = `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${pageTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    :root{--bg:#0b0c0f;--card:#12141a;--muted:#8b95a7;--text:#e8ecf3;--pri:#60e1a3}
    *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--text);font-family:"DM Sans",system-ui}
    .wrap{max-width:1140px;margin:0 auto;padding:24px}
    header{position:relative;overflow:hidden;border:1px solid #222;border-radius:16px;background:linear-gradient(180deg,#161922,transparent)}
    .hero{position:relative;height:52vh;min-height:360px}
    .hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .8s ease}
    .hero img.active{opacity:1}
    .brand{position:absolute;left:24px;bottom:24px;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);padding:14px 18px;border-radius:12px;border:1px solid #333}
    .brand h1{margin:0;font-size:28px}
    .grid{display:grid;gap:16px;grid-template-columns:repeat(12,1fr)}
    .card{background:var(--card);border:1px solid #222;border-radius:16px;padding:18px}
    .muted{color:var(--muted)}
    .gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
    .gallery img{width:100%;height:180px;object-fit:cover;border-radius:12px;border:1px solid #222}
    @media(max-width:900px){.gallery{grid-template-columns:repeat(2,1fr)}.hero{height:40vh}}
  </style>
</head>
<body>
  <div class="wrap">
    <header class="card">
      <div class="hero">
        ${headerImages.map((im,i)=>`<img src="${im.url}" alt="header-${i}" class="${i===0?"active":""}">`).join("")}
      </div>
      <div class="brand"><h1>${pageTitle}</h1></div>
    </header>

    <main class="grid" style="margin-top:18px">
      <section class="card" style="grid-column:span 8">
        <h2>เกี่ยวกับเว็บไซต์</h2>
        <div class="muted">
          <div><b>ประเภท:</b> ${safe(info?.type)}</div>
          <div><b>กลุ่มลูกค้า:</b> ${safe(info?.audience)}</div>
          <div><b>จุดขาย/โปรโมชัน:</b> ${safe(info?.promotion)}</div>
          <div><b>ติดต่อ:</b> ${safe(info?.contact)}</div>
        </div>
      </section>
      <aside class="card" style="grid-column:span 4">
        <h3>จุดเด่น</h3>
        <ul class="muted" style="margin:0;padding-left:18px;line-height:1.7">
          <li>ดีไซน์ทันสมัย ใช้งานง่าย</li>
          <li>เน้นแปลงยอดด้วย CTA ชัดเจน</li>
          <li>รองรับมือถือเต็มรูปแบบ</li>
        </ul>
      </aside>
    </main>

    ${galleryImages.length ? `
    <section class="card" style="margin-top:18px">
      <h2>แกลเลอรี</h2>
      <div class="gallery">
        ${galleryImages.map((g,i)=>`<img src="${g.url}" alt="gallery-${i}">`).join("")}
      </div>
    </section>` : ""}

    <footer style="opacity:.75;text-align:center;margin:28px 0" class="muted">
      © ${new Date().getFullYear()} ${safe(info?.name || pageTitle)}
    </footer>
  </div>
  <script>
    // หมุนภาพ header ทุก 4 วิ
    (function(){
      const imgs = Array.from(document.querySelectorAll('.hero img'));
      if(!imgs.length) return;
      let i = 0; setInterval(()=>{
        imgs[i].classList.remove('active');
        i = (i+1) % imgs.length;
        imgs[i].classList.add('active');
      }, 4000);
    })();
  </script>
</body>
</html>`;

    // เขียนไฟล์เป็นเพจสาธารณะ (หรือส่ง html ตรง ๆ)
    // คุณอาจมีโค้ดสร้างไฟล์อยู่แล้ว — ตรงนี้ส่ง html กลับไว้ก่อน
    return res.json({ html });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "generate failed" });
  }
});
