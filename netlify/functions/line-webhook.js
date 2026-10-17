// PAE SOLAR ENERGY — LINE Messaging API webhook for Netlify Functions (Node 18+).
// No third-party dependencies. Secrets must only be stored in Netlify environment variables.
const crypto = require('node:crypto');

const headers = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const respond = (statusCode, obj) => ({ statusCode, headers, body: JSON.stringify(obj) });

function verifySignature(rawBody, header, secret) {
  if (!header || !secret) return false;
  const actual = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest();
  let supplied;
  try { supplied = Buffer.from(header, 'base64'); } catch { return false; }
  return actual.length === supplied.length && crypto.timingSafeEqual(actual, supplied);
}
function replyFor(message) {
  const msg = String(message || '').trim();
  if (/^(เริ่ม|start|เมนู|สวัสดี|hi|hello)$/i.test(msg)) {
    return 'สวัสดีครับ 👋 PAE SOLAR ENERGY ยินดีให้คำปรึกษา Solar + ESS\n\nลองพิมพ์: ค่าไฟ 5000 กลางวัน 30\nหรือ: ค่าไฟ 5000 กลางวัน 30 ไม่เอาแบต\nพิมพ์ ติดต่อเจ้าหน้าที่ เพื่อให้ทีมงานช่วยดูรายละเอียดครับ';
  }
  if (/ติดต่อเจ้าหน้าที่|คุยกับคน|ขอใบเสนอราคา/.test(msg)) {
    return 'ได้เลยครับ ทีมงาน PAE SOLAR ENERGY จะช่วยตรวจรายละเอียดเพิ่มเติม กรุณาฝากพื้นที่ติดตั้ง จังหวัด และช่วงเวลาที่สะดวกไว้ในแชท โดยไม่ต้องส่งเลขบัตรหรือข้อมูลอ่อนไหวครับ';
  }
  // Examples: ค่าไฟ 5000 กลางวัน 30, ค่าไฟ 5,000 กลางวัน 30 ไม่เอาแบต
  const billMatch = msg.match(/ค่าไฟ\s*([\d,]+(?:\.\d+)?)/);
  const dayMatch = msg.match(/กลางวัน\s*(\d{1,3})\s*%?/);
  if (billMatch) {
    const bill = Number(billMatch[1].replace(/,/g,''));
    const day = dayMatch ? Number(dayMatch[1]) : null;
    if (!Number.isFinite(bill) || bill < 300 || bill > 500000 || (day !== null && (day < 0 || day > 100))) {
      return 'กรุณาตรวจสอบยอดค่าไฟและสัดส่วนกลางวันอีกครั้งครับ เช่น ค่าไฟ 5000 กลางวัน 30';
    }
    if (day === null) return 'รับค่าไฟแล้วครับ ช่วยระบุสัดส่วนการใช้ไฟกลางวัน เช่น ค่าไฟ 5000 กลางวัน 30';
    const noBattery = /ไม่เอาแบต|ไม่มีแบต|ไม่ใช้แบต/.test(msg);
    const unitPrice = 4.5; // Only a simplifying assumption, not the official tariff.
    const load = bill / unitPrice / 30;
    const daytime = load * day / 100;
    const solar = Math.ceil(Math.max(1, daytime / 3.8) * 2) / 2;
    const pvProduction = solar * 3.8;
    const directUse = Math.min(pvProduction, daytime);
    const monthlySavings = Math.round(Math.min(bill, directUse * 30 * unitPrice));
    const fmt = n => Math.round(n).toLocaleString('th-TH');
    return `PAE SOLAR ENERGY ☀️ ประเมินเบื้องต้น\nค่าไฟ ${fmt(bill)} บาท/เดือน\nกลางวัน ${day}% / กลางคืน ${100-day}%\nใช้ไฟประมาณ ${load.toFixed(1)} หน่วย/วัน\n\nแนวทาง Solar ใช้ตรง${noBattery ? ' (ไม่มีแบต)' : ''}: ประมาณ ${solar.toFixed(1)} kWp\nผลิตไฟจำลอง ${pvProduction.toFixed(1)} หน่วย/วัน\nประหยัดจำลองประมาณ ${fmt(monthlySavings)} บาท/เดือน\n\n${noBattery ? 'หากต้องการเพิ่ม ESS สามารถให้ทีมงานประเมินได้ครับ' : 'หากต้องการ ESS ต้องตรวจการใช้ไฟช่วงกลางคืนและโหลดสำรองเพิ่มเติมครับ'}\n\n⚠️ ตัวเลขเป็นการจำลองหยาบ ใช้อัตราเฉลี่ย 4.5 บาท/หน่วย และผลผลิต 3.8 หน่วย/kWp/วัน ไม่ใช่ใบเสนอราคา ผลจริงขึ้นกับอุปกรณ์ เงาบัง อัตราค่าไฟ และหน้างานครับ\nพิมพ์ ติดต่อเจ้าหน้าที่ เพื่อให้ทีมงานประเมินระบบจริง`; 
  }
  return 'ยินดีให้คำปรึกษา Solar + ESS ครับ ☀️\nลองส่ง: ค่าไฟ 5000 กลางวัน 30\nหรือพิมพ์ เริ่ม เพื่อดูเมนู และ ติดต่อเจ้าหน้าที่ เพื่อให้ทีมงานช่วยครับ';
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' });
  const secret = process.env.LINE_CHANNEL_SECRET;
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!secret || !token) return respond(503, { error: 'Server is not configured' });
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '');
  const sig = event.headers?.['x-line-signature'] || event.headers?.['X-Line-Signature'];
  if (!verifySignature(rawBody, sig, secret)) return respond(401, { error: 'Invalid signature' });
  let payload;
  try { payload = JSON.parse(rawBody); } catch { return respond(400, { error: 'Invalid JSON' }); }
  if (!Array.isArray(payload.events)) return respond(400, { error: 'Invalid events' });
  // LINE Verify posts an empty events list, so the 200 response below is intentional.
  for (const e of payload.events.slice(0, 5)) {
    if (e.type !== 'message' || e.message?.type !== 'text' || !e.replyToken) continue;
    const answer = replyFor(e.message.text).slice(0, 4900);
    let res;
    try {
      res = await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ replyToken: e.replyToken, messages: [{ type: 'text', text: answer }] }),
        signal: AbortSignal.timeout(8000)
      });
    } catch (err) { console.error('LINE reply network error', err?.message); return respond(502, { error: 'LINE reply failed' }); }
    if (!res.ok) { console.error('LINE reply rejected', res.status); return respond(502, { error: 'LINE reply rejected', status: res.status }); }
  }
  return respond(200, { ok: true });
};
