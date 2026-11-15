export const publicSections={
 '/gioi-thieu':{section:'gioi-thieu',title:'Về Platinum Technology',description:'Hồ sơ công ty, tầm nhìn, sứ mệnh và các giá trị được theo đuổi.'},
 '/dich-vu':{section:'dich-vu',group:'services',title:'Dịch vụ & giải pháp',description:'Tìm hướng giải quyết bài toán phần mềm, nền tảng số và vận hành của doanh nghiệp.'},
 '/san-pham':{section:'san-pham',group:'products',title:'Hệ sinh thái sản phẩm',description:'Tìm hiểu Linora, Linora-ERP, Linora-AI và Platinum AI Agentic theo hồ sơ công ty.'},
 '/du-an':{section:'du-an',group:'projects',title:'Dự án trong hồ sơ năng lực',description:'Khám phá các dự án phát triển và tham gia phát triển theo từng lĩnh vực.'},
 '/giai-phap-ai':{section:'ai-solutions',title:'AI cho bài toán thực tế',description:'Từ nguồn dữ liệu đến quy trình phối hợp với con người: tìm cách ứng dụng AI phù hợp.'},
 '/quy-trinh':{section:'quy-trinh',group:'process',title:'Quy trình hợp tác',description:'Làm rõ nhu cầu, thống nhất phạm vi và phối hợp qua từng giai đoạn.'},
 '/hoat-dong':{section:'cong-dong',group:'community',title:'Cộng đồng & hợp tác',description:'Những thông tin hợp tác và hoạt động cộng đồng trong hồ sơ Platinum.'},
 '/hoi-dap':{section:'hoi-dap',title:'Giải đáp trước khi bắt đầu',description:'Các câu hỏi thường gặp về giải pháp, quy trình và cách liên hệ tư vấn.'},
 '/lien-he':{section:'lien-he',title:'Cùng trao đổi về dự án',description:'Chia sẻ nhu cầu để Platinum có cơ sở trao đổi và khảo sát phù hợp.'}
};
export const detailGroups={'dich-vu':'services','san-pham':'products','du-an':'projects'};
export function resolvePublicPath(path){if(Object.hasOwn(publicSections,path))return {type:'section',...publicSections[path]};const match=path.match(/^\/(dich-vu|san-pham|du-an)\/([^/]+)$/);if(!match)return null;let id;try{id=decodeURIComponent(match[2])}catch{return null}if(!id||id.length>100)return null;return {type:'detail',group:detailGroups[match[1]],id,prefix:'/'+match[1],...publicSections['/'+match[1]]}}
