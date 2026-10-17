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
    const line = (x1,y1,x2,y2,weight=1) => `0.12 G ${weight} w ${x1} ${y1} m ${x2} ${y2} l S\n`;
    const rect = (x,y,w,h,weight=1) => `0.12 G ${weight} w ${x} ${y} ${w} ${h} re S\n`;
    // Force solid black text; PDF fill colour is stateful and background fills otherwise leave text nearly white.
    const txt = (x,y,size,text,bold=false) => `0 g BT /${bold?'F2':'F1'} ${size} Tf ${x} ${y} Td (${esc(text)}) Tj ET\n`;
    const safe = (v) => (v == null || String(v).trim().toLowerCase() === 'null' || String(v).trim() === '') ? '—' : String(v).trim();
    const field = (stream,x,y,w,h,label,value,opts={}) => {
      stream += rect(x,y-h,w,h,1.1);
      stream += txt(x+7,y-13,7.2,label.toUpperCase(),true);
      const val = safe(value);
      const maxChars = Math.max(12, Math.floor((w-14)/(opts.small ? 4.1 : 4.8)));
      stream += txt(x+7,y-28,opts.small?8:9.2,val.slice(0,maxChars),false);
      return stream;
    };
    const wrap = (text,max=95) => { const out=[]; let cur=''; for(const word of String(text).split(/\s+/)){ if((cur+' '+word).trim().length>max && cur){out.push(cur);cur=word;} else cur=(cur+' '+word).trim(); } if(cur)out.push(cur); return out; };
    const section = (stream,y,title) => {
      stream += `0.91 0.95 0.90 rg 35 ${y-5} 525 22 re f\n`;
      stream += txt(43,y+2,10,title,true);
      stream += line(35,y-5,560,y-5,0.9);
      return stream;
    };
    // Page 1: polished form layout with clearly defined borders and no unused ID/college fields.
    let st = '';
    st += `0.97 0.98 0.96 rg 25 25 545 792 re f\n`;
    st += rect(25,25,545,792,1.4);
    if (logoId) st += `q 95 0 0 28 55 774 cm /Logo Do Q\n`;
    st += txt(180,789,17,'LIVINKEY AGREEMENT',true);
    st += txt(180,773,7.5,'TENANT RESIDENTIAL AGREEMENT',false);
    st += line(40,760,555,760,1.4);
    st = field(st,40,748,340,38,'APARTMENT NAME',row.pg_name);
    st = field(st,380,748,175,38,'ROOM NO.',row.room_number);
    st = field(st,40,710,255,38,'TIME PERIOD',`${row.period_of_stay || ''} MONTHS`);
    st = field(st,295,710,260,38,'ACCEPTED ON',acceptedAt,{small:true});
    st = section(st,657,'TENANT INFORMATION');
    st = field(st,40,646,255,42,'TENANT NAME',row.full_name);
    st = field(st,295,646,260,42,'MOBILE NO.',`${row.country_code || ''} ${row.phone || ''}`);
    st = field(st,40,604,255,42,'PARENTS NO.',row.parent_phone);
    st = field(st,295,604,130,42,'GENDER',row.gender);
    st = field(st,425,604,130,42,'NATIONALITY',row.nationality);
    st = section(st,548,'RENT INFORMATION');
    st = field(st,40,537,170,42,'DATE OF JOINING',row.arrival_date ? new Date(row.arrival_date).toLocaleDateString('en-IN') : '');
    st = field(st,210,537,170,42,'MONTHLY RENT (RS.)',row.rent);
    st = field(st,380,537,175,42,'SECURITY DEPOSIT (RS.)',row.security_fee);
    st = field(st,40,495,255,38,'MONTHLY PAYMENT DATE',row.payment_date);
    st = field(st,295,495,260,38,'AGREEMENT STATUS','Electronically accepted');
    st = section(st,445,'TERMS & CONDITIONS');
    // First 10 clauses on page one, inside a lightly shaded and clearly bordered panel.
    st += `0.99 0.99 0.98 rg 40 70 515 365 re f\n`;
    st += rect(40,70,515,365,1.1);
    let y=419;
    for(let i=0;i<10;i++){
      const lines=wrap(`${i+1}. ${terms[i]}`,100);
      for(const l of lines){ if(y<83) break; st+=txt(49,y,7.6,l); y-=10.3; }
      y-=4;
    }
    st += txt(40,48,7,`LivinKey | Accepted electronically: ${acceptedAt} | Page 1 of 2`);
    pages.push(st);

    // Page 2 continues all remaining clauses and places signature lines only after the final clause.
    st = '';
    st += `0.97 0.98 0.96 rg 25 25 545 792 re f\n`;
    st += rect(25,25,545,792,1.4);
    if (logoId) st += `q 75 0 0 22 42 779 cm /Logo Do Q\n`;
    st += txt(132,790,15,'LIVINKEY AGREEMENT',true);
    st += txt(132,773,8,'TERMS & CONDITIONS — CONTINUED',false);
    st += line(40,760,555,760,1.4);
    st += `0.99 0.99 0.98 rg 40 130 515 615 re f\n`;
    st += rect(40,130,515,615,1.1);
    let yy=724;
    for(let i=10;i<terms.length;i++){
      const lines=wrap(`${i+1}. ${terms[i]}`,96);
      for(const l of lines){ st+=txt(49,yy,8.2,l); yy-=12; }
      yy-=5;
    }
    // Signature block is anchored at the end of the agreement, with equal-width signing areas.
    st += line(40,112,555,112,1.3);
    st += txt(40,94,8,'SIGNATURES',true);
    st += line(42,61,195,61,1.2);
    st += line(220,61,373,61,1.2);
    st += line(398,61,553,61,1.2);
    st += txt(55,47,7.4,'Signature of Tenant',true);
    st += txt(232,47,7.4,'Signature of Tenant',true);
    st += txt(412,47,7.4,'Signature of Owner/Manager',true);
    st += txt(40,31,6.5,`LivinKey | Accepted electronically: ${acceptedAt} | Page 2 of 2`);
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
