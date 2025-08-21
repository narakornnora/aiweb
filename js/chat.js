(() => {
  const msgs = document.getElementById('msgs');
  const input = document.getElementById('input');
  const sendBtn = document.getElementById('sendBtn');
  const buildBtn = document.getElementById('buildBtn');
  const attachBtn = document.getElementById('attachBtn');
  const fileInput = document.getElementById('fileInput');

  const overlay = document.getElementById('overlay');
  const overlayText = document.getElementById('overlayText');

  /** state ภายในหน้า */
  const state = {
    history: [],          // {role:'user'|'assistant', text, files?}
    pendingFiles: [],     // File objects ที่แนบไว้กับข้อความถัดไป
  };

  // --------- utility ----------
  function esc(s=''){ return s.replace(/[&<>"]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }
  function showOverlay(msg='กำลังทำงาน…'){ overlayText.textContent = msg; overlay.classList.add('show'); }
  function hideOverlay(){ overlay.classList.remove('show'); }

  function addMessage(role, text, files=[]) {
    const wrap = document.createElement('div');
    wrap.className = `bubble ${role === 'user' ? 'me' : 'ai'}`;
    wrap.innerHTML = esc(text || '');
    if (files && files.length) {
      const box = document.createElement('div');
      box.className = 'thumbs';
      files.forEach(f => {
        if (f.previewUrl) {
          const img = document.createElement('img');
          img.src = f.previewUrl;
          img.alt = f.name || 'file';
          box.appendChild(img);
        } else {
          const span = document.createElement('span');
          span.textContent = f.name || 'ไฟล์แนบ';
          box.appendChild(span);
        }
      });
      wrap.appendChild(box);
    }
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function assistantSay(text, withLink) {
    const wrap = document.createElement('div');
    wrap.className = 'bubble ai';
    wrap.innerHTML = esc(text);
    if (withLink && withLink.href) {
      const a = document.createElement('a');
      a.href = withLink.href;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = withLink.text || 'ดูเว็บไซต์';
      a.className = 'link';
      a.style.display = 'inline-block';
      a.style.marginLeft = '8px';
      wrap.appendChild(a);
    }
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function currentBrief() {
    // รวมข้อความล่าสุด ๆ (สูงสุด 10 รายการ) + รายชื่อไฟล์แนบ
    const parts = [];
    const recent = state.history.slice(-10);
    recent.forEach(m => parts.push(`${m.role === 'user' ? 'ผู้ใช้' : 'ผู้ช่วย'}: ${m.text}`));
    if (state.history.length === 0 && input.value.trim()) {
      parts.push(`ผู้ใช้: ${input.value.trim()}`);
    }
    // ไฟล์แนบล่าสุด (ชื่อไฟล์เท่านั้น; การอัปโหลดจริงค่อยต่อ API ภายหลัง)
    const last = state.history[state.history.length - 1];
    const files = last?.files?.length ? last.files : state.pendingFiles;
    if (files && files.length) {
      parts.push('ไฟล์แนบ: ' + files.map(f => f.name).join(', '));
    }
    return parts.join('\n');
  }

  // --------- actions ----------
  async function onSend() {
    const text = input.value.trim();
    if (!text && !state.pendingFiles.length) return;

    // แสดงรูปพรีวิวของไฟล์แนบในข้อความผู้ใช้
    const filesForMessage = [...state.pendingFiles];
    addMessage('user', text || '(แนบไฟล์)', filesForMessage);
    state.history.push({ role: 'user', text, files: filesForMessage });
    state.pendingFiles = []; // เคลียร์ไฟล์ที่แนบไว้
    input.value = '';

    // จำลองผู้ช่วยตอบ (ตรงนี้คุณสามารถต่อ /api/chat ได้)
    assistantSay('รับทราบครับ เดี๋ยวผมนำข้อมูลนี้ไปประกอบตอนสร้างหน้าเว็บให้สวยและเหมาะสม 👍');
  }

  async function onBuild() {
    const brief = currentBrief() || 'เว็บไซต์ธุรกิจ โทนอุ่น ในกรุงเทพ';
    showOverlay('กำลังสร้างเว็บไซต์…');

    buildBtn.disabled = true;
    sendBtn.disabled = true;

    try {
      const r = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief })
      });

      let data = null;
      try { data = await r.json(); } catch { /* เผื่อ backend ส่ง HTML/ข้อความ */ }

      if (!r.ok || !data?.ok) {
        const msg = data?.error || `Build API ${r.status}`;
        assistantSay('❌ สร้างไม่สำเร็จ: ' + msg);
        return;
      }

      // เปิดพรีวิวในแท็บใหม่
      const w = window.open(data.preview, '_blank');
      if (!w) {
        // ถ้าถูกบล็อกป็อปอัป ให้ใส่ลิงก์ในแชต
        assistantSay('พรีวิวถูกบล็อกป็อปอัป กดลิงก์นี้เพื่อเปิด:', { href: data.preview, text: 'ดูเว็บไซต์' });
      } else {
        assistantSay('✅ สร้างเสร็จแล้ว! ผมเปิดพรีวิวให้ในแท็บใหม่แล้วครับ', { href: data.preview, text: 'เปิดอีกครั้ง' });
      }
    } catch (e) {
      assistantSay('❌ สร้างไม่สำเร็จ: ' + e.message);
    } finally {
      hideOverlay();
      buildBtn.disabled = false;
      sendBtn.disabled = false;
    }
  }

  // --------- events ----------
  sendBtn.addEventListener('click', onSend);
  buildBtn.addEventListener('click', onBuild);

  input.addEventListener('keydown', (e) => {
    // รองรับ IME (ภาษาไทย) — ถ้ากำลังคอมโพสอยู่อย่าจับ Enter
    if (e.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  });

  attachBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    // เก็บไฟล์ที่เลือกไว้สำหรับข้อความถัดไป + เตรียมพรีวิว
    const files = Array.from(fileInput.files || []);
    files.forEach(f => {
      const item = { name: f.name, type: f.type, size: f.size };
      if (f.type.startsWith('image/')) {
        item.previewUrl = URL.createObjectURL(f);
      }
      state.pendingFiles.push(item);
    });
    // โชว์แถบพรีวิวไฟล์ที่จะแนบในแชต (ยังไม่ส่งจนกด “ส่ง”)
    if (state.pendingFiles.length) {
      addMessage('ai', `📎 แนบไฟล์ ${state.pendingFiles.length} รายการแล้ว — กด “ส่ง” เพื่อส่งข้อความพร้อมไฟล์`);
    }
    // reset input ให้เลือกซ้ำได้
    fileInput.value = '';
  });

  // --------- greeting ----------
  assistantSay('สวัสดีครับ 👋\nพิมพ์ความต้องการ เช่น “ร้านอาหารไทย แบรนด์ ครัวคุณแม่ กรุงเทพ โทนอุ่น cozy” แล้วกด Enter เพื่อส่ง\nพร้อมเมื่อไร กด “สร้างเว็บไซต์” ได้ทุกเวลาเลยครับ');
})();
