// translator.js
import { v2 as GoogleTranslate } from '@google-cloud/translate';

const translateClient = new GoogleTranslate.Translate({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

export async function toEnglish(text) {
  try {
    const [det] = await translateClient.detect(text);
    const lang = (Array.isArray(det) ? det[0] : det)?.language || 'und';
    if (String(lang).toLowerCase().startsWith('en')) return text; // ไม่ต้องแปล
    const [tr] = await translateClient.translate(text, 'en');
    return tr;
  } catch (e) {
    console.warn('[translate] ใช้ต้นฉบับแทน:', e.message);
    return text; // แปลไม่ได้ก็ใช้ข้อความเดิม
  }
}
