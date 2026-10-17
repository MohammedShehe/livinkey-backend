const agreementService = require('../services/agreement.service');
const ActivityService = require('../services/activity.log.service');
const fs = require('fs');
const path = require('path');

exports.getAgreement = async (req, res) => {
  try {
    const agreement = await agreementService.getTenantAgreement(req.tenant.id);
    if (!agreement) return res.status(404).json({ success: false, message: 'Tenant agreement not found.' });
    return res.json({ success: true, data: agreement });
  } catch (error) {
    console.error('Get Tenant Agreement Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.acceptAgreement = async (req, res) => {
  try {
    const agreement = await agreementService.acceptTenantAgreement(
      req.tenant.id,
      req.ip,
      req.get('user-agent')
    );
    await ActivityService.log(req, {
      actorType: 'tenant',
      action: 'agreement_accepted',
      module: 'agreements',
      tenantId: req.tenant.id,
      pgId: agreement.pg_id || null,
      entityType: 'agreement',
      entityId: agreement.pg_id || null,
      metadata: { agreement_hash: agreement.hash, reacceptance: agreement.accepted_at ? true : false }
    });
    return res.json({ success: true, message: 'Agreement accepted successfully.', data: agreement });
  } catch (error) {
    console.error('Accept Tenant Agreement Error:', error);
    return res.status(400).json({ success: false, message: error.message || 'Unable to accept agreement.' });
  }
};

// Download the accepted agreement using the original LivinKey boxed form layout.
exports.downloadAcceptedAgreement = async (req, res) => {
  try {
    const tenantId = Number(req.params.id);
    if (!Number.isInteger(tenantId) || tenantId < 1) return res.status(400).json({ success: false, message: 'Invalid tenant id.' });
    const agreementService = require('../services/agreement.service');
    const db = require('../config/db');
    const current = await agreementService.getTenantAgreement(tenantId);
    if (!current) return res.status(404).json({ success: false, message: 'Tenant not found.' });
    if (!current.accepted) return res.status(404).json({ success: false, message: 'No current accepted agreement is available for this tenant.' });
    const [rows] = await db.execute(`SELECT a.agreement_text, a.accepted_at, t.full_name, t.email, t.phone, t.country_code, t.parent_phone, t.gender, t.nationality, td.residency, td.aadhaar_id, td.c_form_number, td.period_of_stay, td.arrival_date, td.rent, td.security_fee, td.payment_date, p.name AS pg_name, r.room_number FROM tenant_agreement_acceptances a JOIN tenants t ON t.id=a.tenant_id LEFT JOIN tenant_details td ON td.tenant_id=t.id LEFT JOIN pgs p ON p.id=td.pg_id LEFT JOIN rooms r ON r.id=td.room_id WHERE a.tenant_id=? AND a.agreement_hash=? LIMIT 1`, [tenantId, current.hash]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Current accepted agreement record not found.' });
    const row = rows[0];
    const acceptedAt = row.accepted_at ? new Date(row.accepted_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Not recorded';
    const terms = require('../services/agreement.service').AGREEMENT_TERMS;
    const esc = (v) => String(v ?? '').normalize('NFKD').replace(/[^\x20-\x7E]/g, '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const objects = []; const add = (v) => { objects.push(v); return objects.length; };
    const catalogId = add(''); const pagesId = add('');
    const fontId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    const boldFontId = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
    const logoPath = path.join(__dirname, '..', 'assets', 'livinkey-logo.jpg');
    let logoId = null;
    if (fs.existsSync(logoPath)) {
      const logoHex = fs.readFileSync(logoPath).toString('hex').toUpperCase() + '>';
      logoId = add(`<< /Type /XObject /Subtype /Image /Width 200 /Height 60 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${logoHex.length} >>\nstream\n${logoHex}\nendstream`);
    }
    const pages = [];
    const line = (x1,y1,x2,y2) => `0.25 G 0.7 w ${x1} ${y1} m ${x2} ${y2} l S\n`;
    const rect = (x,y,w,h) => `0.25 G 0.7 w ${x} ${y} ${w} ${h} re S\n`;
    const txt = (x,y,size,text,bold=false) => `BT /${bold?'F2':'F1'} ${size} Tf ${x} ${y} Td (${esc(text)}) Tj ET\n`;
    const field = (stream,x,y,w,label,value) => { stream += txt(x+5,y-13,7,label,true); stream += txt(x+5,y-28,9,String(value || '').slice(0,70)); stream += rect(x,y-36,w,36); return stream; };
    // Page 1: agreement form fields in the same boxed/ruled style as the supplied sheet.
    let st = '';
    if (logoId) st += `q 110 0 0 33 245 790 cm /Logo Do Q\n`;
    st += txt(185,778,14,'LIVINKEY AGREEMENT',true);
    st += line(35,766,560,766);
    st += txt(40,750,8,'APARTMENT NAME',true); st += txt(145,750,9,row.pg_name || '');
    st += txt(370,750,8,'ROOM NO.',true); st += txt(430,750,9,row.room_number || '');
    st += rect(35,730,340,24); st += rect(375,730,185,24);
    st += txt(40,738,8,'TIME PERIOD',true); st += txt(130,738,9,`${row.period_of_stay || ''} MONTHS`);
    st += txt(380,738,8,'ACCEPTED ON',true); st += txt(445,738,8,acceptedAt);
    st += txt(40,710,10,'TENANT INFORMATION',true);
    st = field(st,35,704,260,'NAME',row.full_name);
    st = field(st,295,704,265,'MOBILE NO.',`${row.country_code || ''} ${row.phone || ''}`);
    st = field(st,35,668,260,'PARENTS NO.',row.parent_phone);
    st = field(st,295,668,265,'AADHAR/PASSPORT/VISA NO.',row.aadhaar_id || row.c_form_number || '');
    st = field(st,35,632,260,'COLLEGE REGISTRATION NO.', '');
    st = field(st,295,632,90,'BATCH','');
    st = field(st,385,632,85,'GENDER',row.gender);
    st = field(st,470,632,90,'NATIONALITY',row.nationality);
    st += txt(40,582,10,'RENT INFORMATION',true);
    st = field(st,35,576,175,'DATE OF JOINING',row.arrival_date ? new Date(row.arrival_date).toLocaleDateString('en-IN') : '');
    st = field(st,210,576,175,'STARTING METER READING','');
    st = field(st,385,576,175,'MONTHLY RENT AMOUNT RS',row.rent);
    st = field(st,35,540,260,'SECURITY DEPOSIT RS',row.security_fee);
    st = field(st,295,540,265,'PAYMENT DATE',row.payment_date);
    st += txt(40,492,10,'TERMS & CONDITIONS',true);
    st += rect(35,180,525,300);
    const wrap = (text,max=105) => { const out=[]; let cur=''; for(const word of String(text).split(/\s+/)){ if((cur+' '+word).trim().length>max && cur){out.push(cur);cur=word;} else cur=(cur+' '+word).trim(); } if(cur)out.push(cur); return out; };
    let y=464;
    for(let i=0;i<12;i++){ const lines=wrap(`${i+1}. ${terms[i]}`,105); for(const l of lines){ if(y<190) break; st+=txt(42,y,6.7,l); y-=10; } }
    st += txt(40,157,8,'Signature of Tenant',true); st += txt(220,157,8,'Signature of Tenant',true); st += txt(420,157,8,'Signature of Owner/Manager',true);
    st += line(35,174,190,174)+line(205,174,360,174)+line(375,174,560,174);
    st += txt(40,28,7,`LivinKey | Accepted electronically: ${acceptedAt} | Page 1`);
    pages.push(st);
    // Page 2: remaining original clauses and the exact stored accepted wording.
    st = '';
    if (logoId) st += `q 90 0 0 27 252 790 cm /Logo Do Q\n`;
    st += txt(40,775,13,'LIVINKEY AGREEMENT - TERMS & CONDITIONS',true);
    st += line(35,764,560,764);
    let yy=740;
    for(let i=12;i<terms.length;i++){
      const lines=wrap(`${i+1}. ${terms[i]}`,105);
      for(const l of lines){ st+=txt(42,yy,8,l); yy-=13; }
      yy-=3;
    }
    yy-=12; st+=txt(40,yy,10,'AGREEMENT TEXT ACCEPTED BY TENANT',true); yy-=18;
    for(const l of wrap(row.agreement_text || '',105)){ if(yy<55) break; st+=txt(42,yy,7.5,l); yy-=11; }
    st+=line(35,42,560,42); st+=txt(40,28,7,`LivinKey | Accepted electronically: ${acceptedAt} | Page 2`);
    pages.push(st);
    const pageIds = [];
    for (const stream of pages) {
      const contentId = add(`<< /Length ${Buffer.byteLength(stream,'binary')} >>\nstream\n${stream}endstream`);
      const xobj = logoId ? ` /XObject << /Logo ${logoId} 0 R >>` : '';
      pageIds.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >>${xobj} >> /Contents ${contentId} 0 R >>`));
    }
    objects[catalogId-1]=`<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId-1]=`<< /Type /Pages /Kids [${pageIds.map(id=>id+' 0 R').join(' ')}] /Count ${pageIds.length} >>`;
    let pdf='%PDF-1.4\n%âãÏÓ\n'; const offsets=[0];
    objects.forEach((obj,i)=>{offsets.push(Buffer.byteLength(pdf,'binary'));pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`;});
    const xref=Buffer.byteLength(pdf,'binary'); pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
    for(let i=1;i<offsets.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    pdf+=`trailer\n<< /Size ${objects.length+1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition',`attachment; filename="LivinKey-Agreement-${tenantId}.pdf"`);
    res.setHeader('Cache-Control','no-store');
    return res.send(Buffer.from(pdf,'binary'));
  } catch (error) { console.error('Download accepted agreement error:', error); return res.status(500).json({ success:false, message:'Unable to generate agreement PDF.' }); }
};
