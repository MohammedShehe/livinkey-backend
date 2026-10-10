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

// Download the latest currently-valid accepted agreement for a tenant.
exports.downloadAcceptedAgreement = async (req, res) => {
  try {
    const tenantId = Number(req.params.id);
    if (!Number.isInteger(tenantId) || tenantId < 1) return res.status(400).json({ success: false, message: 'Invalid tenant id.' });
    const agreementService = require('../services/agreement.service');
    const db = require('../config/db');
    const current = await agreementService.getTenantAgreement(tenantId);
    if (!current) return res.status(404).json({ success: false, message: 'Tenant not found.' });
    if (!current.accepted) return res.status(404).json({ success: false, message: 'No current accepted agreement is available for this tenant.' });
    const [rows] = await db.execute(`SELECT a.agreement_text, a.accepted_at, t.full_name, t.email, t.phone, t.country_code, t.parent_phone, p.name AS pg_name, r.room_number FROM tenant_agreement_acceptances a JOIN tenants t ON t.id=a.tenant_id LEFT JOIN tenant_details td ON td.tenant_id=t.id LEFT JOIN pgs p ON p.id=td.pg_id LEFT JOIN rooms r ON r.id=td.room_id WHERE a.tenant_id=? AND a.agreement_hash=? LIMIT 1`, [tenantId, current.hash]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Current accepted agreement record not found.' });
    const row = rows[0];
    const acceptedAt = row.accepted_at ? new Date(row.accepted_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Not recorded';
    const clean = (v) => String(v ?? '').normalize('NFKD').replace(/[^\x20-\x7E]/g, '').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const wrap = (str, max=88) => { const words=String(str||'').split(/\s+/); const out=[]; let line=''; for(const word of words){ if((line+' '+word).trim().length>max && line){out.push(line);line=word;}else line=(line+' '+word).trim(); } if(line)out.push(line); return out; };
    const lines = [
      'LIVINKEY  |  TENANCY AGREEMENT',
      'OFFICIAL RECORD • CURRENT ACCEPTED VERSION',
      '', 'TENANT DETAILS',
      `Tenant: ${row.full_name || ''}`, `Email: ${row.email || ''}`,
      `Phone: ${row.country_code || ''} ${row.phone || ''}`, `Parent phone: ${row.parent_phone || 'Not provided'}`,
      `Property: ${row.pg_name || '—'}    Room: ${row.room_number || '—'}`,
      '', 'AGREEMENT TERMS', ...wrap(row.agreement_text, 88),
      '', 'ACCEPTANCE RECORD', `Accepted on: ${acceptedAt}`,
    ];
    const pages=[]; for(let i=0;i<lines.length;i+=43) pages.push(lines.slice(i,i+43));
    const objects=[]; const add=(v)=>{objects.push(v);return objects.length;};
    const catalogId=add(''); const pagesId=add('');
    const fontId=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    const boldFontId=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
    // Embed the company logo into the PDF so it remains visible when shared or printed.
    const logoPath=path.join(__dirname, '..', 'assets', 'livinkey-logo.jpg');
    const logoHex=fs.readFileSync(logoPath).toString('hex').toUpperCase()+'>';
    const logoId=add(`<< /Type /XObject /Subtype /Image /Width 200 /Height 60 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${logoHex.length} >>\nstream\n${logoHex}\nendstream`);
    const pageIds=[];
    for(let pageIndex=0; pageIndex<pages.length; pageIndex++){
      const pageLines=pages[pageIndex];
      let stream='';
      stream+='q 220 0 0 66 48 755 cm /Logo Do Q\n';
      stream+='BT /F2 16 Tf 48 731 Td ('+clean('TENANCY AGREEMENT')+') Tj ET\n';
      stream+='BT /F1 8 Tf 48 716 Td ('+clean('OFFICIAL RECORD  |  CURRENT ACCEPTED VERSION')+') Tj ET\n';
      stream+='0.35 0.55 0.12 rg 48 704 499 2 re f\n';
      let y=680;
      for(let i=2;i<pageLines.length;i++){
        const line=pageLines[i];
        const bold=/^(TENANT DETAILS|AGREEMENT TERMS|ACCEPTANCE RECORD)$/.test(line);
        if(bold){ y-=4; stream+=`0.16 0.22 0.12 rg BT /F2 10 Tf 48 ${y} Td (${clean(line)}) Tj ET\n`; y-=19; }
        else { stream+=`0.08 0.08 0.08 rg BT /F1 9 Tf 48 ${y} Td (${clean(line)}) Tj ET\n`; y-=14; }
      }
      stream+=`0.35 0.55 0.12 rg 48 42 499 1 re f\n`;
      stream+=`0.2 0.2 0.2 rg BT /F1 8 Tf 48 28 Td (${clean('LivinKey  |  Confidential tenant record  |  Page '+(pageIndex+1)+' of '+pages.length)}) Tj ET\n`;
      const contentId=add(`<< /Length ${Buffer.byteLength(stream,'binary')} >>\nstream\n${stream}endstream`);
      const pageId=add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${boldFontId} 0 R >> /XObject << /Logo ${logoId} 0 R >> >> /Contents ${contentId} 0 R >>`);
      pageIds.push(pageId);
    }
    objects[catalogId-1]=`<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objects[pagesId-1]=`<< /Type /Pages /Kids [${pageIds.map(id=>id+' 0 R').join(' ')}] /Count ${pageIds.length} >>`;
    let pdf='%PDF-1.4\n%âãÏÓ\n'; const offsets=[0];
    objects.forEach((obj,i)=>{offsets.push(Buffer.byteLength(pdf,'binary'));pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`;});
    const xref=Buffer.byteLength(pdf,'binary'); pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
    for(let i=1;i<offsets.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    pdf+=`trailer\n<< /Size ${objects.length+1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const filename=`LivinKey-Agreement-${tenantId}.pdf`;
    res.setHeader('Content-Type','application/pdf'); res.setHeader('Content-Disposition',`attachment; filename="${filename}"`); res.setHeader('Cache-Control','no-store');
    return res.send(Buffer.from(pdf,'binary'));
  } catch (error) { console.error('Download accepted agreement error:', error); return res.status(500).json({ success:false, message:'Unable to generate agreement PDF.' }); }
};
