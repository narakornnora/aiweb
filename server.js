import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' })); // รองรับ base64 รูป

// โฟลเดอร์เก็บไฟล์ที่สร้าง
const outDir = path.join(process.cwd(), 'generated');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

// เสิร์ฟไฟล์ preview
app.use('/preview', express.static(outDir));

function htmlTemplateWithContent({ title, info = {}, headerImages = [], galleryImages = [] }) {
  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family:sans-serif; margin:0; padding:0; }
    header { background:#f6f7fb; padding:30px; text-align:center; }
    header h1 { margin:0; }
    .slideshow { display:flex; overflow:hidden; }
    .slideshow img { width:100%; max-height:300px; object-fit:cover; }
    .gallery { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:10px; padding:20px; }
    .gallery img { width:100%; height:150px; object-fit:cover; border-radius:8px; }
  </style>
</head>
<body>
  <header>
    <h1>${title}</h1>
    <p>${info?.audience || ''}</p>
  </header>
  <section class="slideshow">
    ${headerImages.map(u=>`<img src="${u}" />`).join('')}
  </section>
  <section class="gallery">
    ${galleryImages.map(u=>`<img src="${u}" />`).join('')}
  </section>
</body>
</html>`;
}

// Endpoint generate
app.post('/api/generate', async (req, res) => {
  try {
    const { title = 'My Site', info = {}, files = [] } = req.body || {};

    const headerImages = files.slice(0, 3);
    const galleryImages = files.slice(3);

    const html = htmlTemplateWithContent({ title, info, headerImages, galleryImages });
    const filename = `${Date.now()}.html`;
    const outPath = path.join(outDir, filename);
    fs.writeFileSync(outPath, html, 'utf8');

    res.json({ ok: true, url: `/preview/${filename}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'generate failed' });
  }
});

app.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));
