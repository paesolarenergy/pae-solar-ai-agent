// ตั้งค่าเฉพาะ LINE OA ของแบรนด์ PAE เท่านั้น ไม่ใส่ token/secret ในไฟล์นี้
const PAE_LINE_OA_URL = 'https://line.me/R/ti/p/@YOUR_PAE_LINE_ID';
document.getElementById('lineContact')?.addEventListener('click',async()=>{
  const status=document.getElementById('lineStatus');
  const b=Number(document.getElementById('bill').value||0);
  const day=Number(document.getElementById('day').value||50);
  const tariff=document.getElementById('tariff').value;
  const text=`สวัสดีครับ PAE SOLAR ENERGY\nขอคำปรึกษา Solar + ESS\nค่าไฟ ${b.toLocaleString('th-TH')} บาท/เดือน\nกลางวัน ${day}% กลางคืน ${100-day}%\nมิเตอร์ ${tariff.toUpperCase()}\nขอให้ช่วยตรวจสอบขนาดระบบที่เหมาะสมครับ`;
  if(PAE_LINE_OA_URL.includes('YOUR_PAE_LINE_ID')){status.textContent='กรุณาตั้งค่า LINE OA URL ของ PAE ในไฟล์ pae-line.js ก่อน';return}
  try{await navigator.clipboard.writeText(text);status.textContent='คัดลอกแล้ว เปิด LINE เพื่อวางข้อความและกดส่ง';window.open(PAE_LINE_OA_URL,'_blank','noopener,noreferrer')}
  catch{status.textContent='คัดลอกอัตโนมัติไม่ได้ กรุณาส่งค่าไฟและสัดส่วนกลางวันผ่าน LINE ด้วยตัวเอง';window.open(PAE_LINE_OA_URL,'_blank','noopener,noreferrer')}
});
