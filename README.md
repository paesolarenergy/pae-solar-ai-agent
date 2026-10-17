# PAE SOLAR ENERGY — Smart Advisor + LINE Bot V1

## สิ่งที่ใช้งานได้
- เว็บไซต์คำนวณ Solar + ESS และ Energy Dashboard (จำลอง ไม่ใช่ใบเสนอราคา)
- LINE Messaging API webhook พร้อมตรวจ HMAC SHA256 signature ก่อนตอบกลับ
- คำสั่ง LINE: `เริ่ม`, `ค่าไฟ 5000 กลางวัน 30`, `ค่าไฟ 5000 กลางวัน 30 ไม่เอาแบต`, `ติดต่อเจ้าหน้าที่`
- ปุ่มเว็บไซต์คัดลอกผลเบื้องต้นและเปิด LINE OA เมื่อระบุ URL ใน `pae-line.js`

## วิธีติดตั้ง
1. แตก ZIP แล้วนำ **เนื้อหาภายในโฟลเดอร์ `pae-agent-v1`** ไปไว้ที่ root ของ project ที่จะ deploy ผ่าน Netlify (เช่น GitHub repository root). ไม่ต้องอัปโหลด ZIP ตรง ๆ ให้แน่ใจว่า `index.html` และ `netlify.toml` อยู่ที่ root.
2. Netlify จะใช้ `netlify.toml`: publish = `.` และ functions = `netlify/functions`. สำหรับ Functions แนะนำ Deploy แบบเชื่อม Git หรือ Netlify CLI เพื่อให้แน่ใจว่า Netlify build Functions ครบ ไม่ใช่การอัปโหลดเว็บ static อย่างเดียว
3. ตั้งค่า Netlify: Project configuration > Environment variables ดังนี้:
    - `LINE_CHANNEL_SECRET` = จาก LINE Developers > Messaging API channel > Basic settings
    - `LINE_CHANNEL_ACCESS_TOKEN` = จาก LINE Developers > Messaging API channel > Messaging API
   อย่าใส่ค่าสองตัวนี้ใน frontend, repo หรือส่งในแชต
4. กด Deploy / Trigger deploy ใหม่หลังตั้ง Environment variables
5. LINE Developers Console ของ OA เดียวกัน > Messaging API > Webhook URL:
   `https://ชื่อเว็บไซต์.netlify.app/api/line-webhook`
   กด Verify และเปิด Use webhook แล้วตรวจการตั้งค่า Auto-response ของ OA ป้องกันการตอบซ้ำ
6. ในไฟล์ `pae-line.js` เปลี่ยน `https://line.me/R/ti/p/@YOUR_PAE_LINE_ID` เป็นลิงก์เพิ่มเพื่อนของ PAE OA ตัวจริง (เผยแพร่ได้) จาก LINE OA Manager แล้ว redeploy
7. ลองพิมพ์ใน LINE: `เริ่ม` และ `ค่าไฟ 5000 กลางวัน 30`

## สำคัญ
- V1 นี้ **เป็น rule-based bot** ยังไม่มี LLM AI และไม่มี CRM; ชื่อ AI Agent V1 คือชื่อโปรเจกต์ตั้งต้น
- Engine เว็บไซต์และ Engine LINE เป็นสอง implementation ที่มีสมมติฐานต่างกัน ไม่ได้ sync ผลลัพธ์ 1:1. LINE เป็นการประเมินหยาบโดยใช้อัตราเฉลี่ย 4.5 บาท/kWh และ solar yield 3.8; เว็บปรับ Normal/TOU เองได้. อย่านำไปเสนอราคาโดยไม่ตรวจสอบ
- Webhook ตอบใน request เดียว: เหมาะสำหรับทดสอบปริมาณน้อย ยังไม่มี queue, deduplication, การติดตาม leads และ logging แบบพร้อม production
- เว็บไม่ส่งข้อมูลเข้าระบบ LINE เอง; ผู้ใช้ต้องกดปุ่มและวางข้อความใน LINE โดยตั้งใจ
- LINE OA Manager อาจมีการตอบอัตโนมัติอีกระบบหนึ่ง ควรปิดหรือจัดกฎไม่ให้ตอบชนกับ webhook
- การติดต่อกลับต้องทำตามนโยบายข้อมูลส่วนบุคคลและขอความยินยอมตามความเหมาะสม
- หาก Deploy แล้ว Verify ไม่ผ่าน ตรวจ Function logs, environment variables, path, secret/token ของ OA เดียวกัน และการ deploy ใหม่
