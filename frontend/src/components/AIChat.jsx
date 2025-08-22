import React, { useState } from 'react';

const styles = {
  wrap: {display:'flex',flexDirection:'column',height:'100vh',background:'#f6f7fb'},
  head: {padding:'14px 16px',fontWeight:700,borderBottom:'1px solid #e8eaf0',background:'#fff'},
  body: {flex:1,overflowY:'auto',padding:'16px',display:'flex',flexDirection:'column',gap:12},
  row: (me)=>({alignSelf: me?'flex-end':'flex-start',maxWidth:680,display:'flex',gap:8}),
  bubble: (me)=>({
    background: me?'#3b82f6':'#ffffff',
    color: me?'#fff':'#111',
    padding:'10px 12px',borderRadius:14,
    border: me?'none':'1px solid #e8eaf0'
  }),
  thumb:{width:120,height:90,objectFit:'cover',borderRadius:8,border:'1px solid #e8eaf0',marginTop:8},
  dock:{display:'flex',gap:8,padding:12,background:'#fff',borderTop:'1px solid #e8eaf0'},
  input:{flex:1,border:'1px solid #dbe1ea',borderRadius:10,padding:'10px 12px'}
};

export default function AIChat() {
  const [messages,setMessages] = useState([
    {id:'1',role:'ai',type:'text',text:'สวัสดีครับ 👋 บอกผมชื่อเว็บ/แบรนด์ ประเภทเว็บ กลุ่มลูกค้า ได้เลยครับ'}
  ]);
  const [input,setInput] = useState('');

  const send = () => {
    if(!input.trim()) return;
    setMessages(prev=>[...prev,{id:crypto.randomUUID(),role:'user',type:'text',text:input}]);
    setInput('');
    // mock AI ตอบ
    setTimeout(()=>{
      setMessages(prev=>[...prev,{id:crypto.randomUUID(),role:'ai',type:'text',text:'โอเคครับ ✨ ได้รับข้อความแล้ว'}]);
    },600);
  };

  const onAttach = async (e) => {
    const files = Array.from(e.target.files||[]);
    for(const f of files){
      const url = await new Promise(r=>{
        const fr=new FileReader(); fr.onload=()=>r(fr.result); fr.readAsDataURL(f);
      });
      setMessages(prev=>[...prev,{id:crypto.randomUUID(),role:'user',type:'image',url}]);
      setMessages(prev=>[...prev,{id:crypto.randomUUID(),role:'ai',type:'text',text:'ได้รับรูปแล้วครับ ✅'}]);
    }
    e.target.value='';
  };

  const generateSite = async () => {
    const images = messages.filter(m=>m.type==='image').map(m=>m.url);
    const info = { audience:'ลูกค้าทั่วไป' };
    try {
      const res = await fetch('http://localhost:5000/api/generate',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({title:'เว็บตัวอย่าง',info,files:images})
      });
      const data = await res.json();
      if(data?.url) window.open(`http://localhost:5000${data.url}`,'_blank');
    } catch(e){ alert('สร้างเว็บไม่สำเร็จ'); }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.head}>AI Builder</div>
      <div style={styles.body}>
        {messages.map(m=>{
          const me = m.role==='user';
          return (
            <div key={m.id} style={styles.row(me)}>
              <div style={styles.bubble(me)}>
                {m.type==='text' && <div>{m.text}</div>}
                {m.type==='image' && <img src={m.url} alt="img" style={styles.thumb}/>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={styles.dock}>
        <input type="file" multiple onChange={onAttach}/>
        <input style={styles.input} value={input} onChange={e=>setInput(e.target.value)} placeholder="พิมพ์ข้อความ…"/>
        <button onClick={send}>ส่ง</button>
        <button onClick={generateSite}>สร้างเว็บ</button>
      </div>
    </div>
  );
}
