// Tra cứu theo quy tắc, không gọi AI/API bên ngoài.
const normalize=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
export function lookup(question,data){const q=normalize(question),c=data.company;let answer;
if(/\b(gia|bao gia|chi phi|bao nhieu)\b/.test(q))answer='Chi phí phụ thuộc phạm vi và yêu cầu triển khai. Hồ sơ hiện chưa có bảng giá. Bạn có thể gửi yêu cầu tư vấn để công ty khảo sát và báo giá.';
else if(/(dia chi|o dau|tru so|chi nhanh)/.test(q))answer='Trụ sở: '+c.address+'. Chi nhánh: '+c.branch+'.';
else if(/(lien he|dien thoai|email|hotline)/.test(q))answer='Liên hệ '+c.phone+' hoặc '+c.email+'.';
else if(/(nguoi dai dien|giam doc|ceo)/.test(q))answer='Người đại diện theo thông tin hiện tại: '+c.ceo+'.';
else if(/(sang lap|thanh lap|gioi thieu)/.test(q))answer=c.about;
else if(/quy trinh/.test(q))answer=data.process.map((r,i)=>`${i+1}. ${r.title}: ${r.description}`).join('\n');
else if(/(dich vu|lam gi)/.test(q))answer=data.services.map(r=>r.title+': '+r.description).join('\n\n');
else if(/\b(ai|agent|phan mem|san pham|du an|linora|erp|crm|devops|cloud|web|mobile|fintech|logistic|kiem toan)\b/.test(q)){const terms=q.split(/\W+/).filter(x=>x.length>2);const matches=['services','products','projects'].flatMap(k=>data[k]).map(r=>({...r,score:terms.reduce((s,t)=>s+Number(normalize(r.title+' '+r.description).includes(t)),0)})).filter(r=>r.score>=Math.min(2,terms.length)).sort((a,b)=>b.score-a.score).slice(0,3);if(matches.length)answer=matches.map(r=>r.title+': '+r.description).join('\n\n')}
return {answer:answer||'Mình là trợ lý tra cứu hồ sơ Platinum, chưa phải chatbot AI trò chuyện tự do. Bạn có thể hỏi về dịch vụ, sản phẩm, quy trình, người đại diện hoặc thông tin liên hệ.',mode:'profile',source:'Tra cứu hồ sơ trong MySQL local'};
}
