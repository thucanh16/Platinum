const normalize = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim();

const products = {
  linora: 'linora', 'linora-erp': 'linora-erp', 'linora-ai': 'linora-ai',
  'platinum ai agentic': 'platinum-ai-agentic',
};
const projects = {
  mcpayment: 'mcpayment', huewaco: 'huewaco', 'thanh giong': 'thanh-giong',
  'thanh-giong': 'thanh-giong', ar: 'ar', arvi: 'arvi', gosafe: 'gosafe', kg: 'kg', linora: 'linora',
};

export function corporateImage(group, row) {
  const title = normalize(row.title);
  if (group === 'products' && Object.hasOwn(products, title)) return '/images/' + products[title] + '.webp';
  if (group === 'projects' && Object.hasOwn(projects, title)) return '/images/project-' + projects[title] + '.webp';
  if (group === 'services') {
    let name;
    if (/dao tao|huan luyen|tu van/.test(title)) name = 'training';
    else if (/cloud|devops|bao tri|ha tang/.test(title)) name = 'cloud';
    else if (/\bui\b|\bux\b|trai nghiem|giao dien/.test(title)) name = 'ui-ux';
    else if (/\bai\b|agent/.test(title)) name = 'ai-agent';
    else if (/web|mobile|di dong/.test(title)) name = 'web-mobile';
    else if (/phan mem/.test(title)) name = 'software';
    if (name) return '/images/service-' + name + '.webp';
  }
  return null;
}

export function applyCorporateImages(document) {
  const next = structuredClone(document);
  let changed = 0;
  for (const group of ['services', 'products', 'projects']) {
    for (const row of next[group] || []) {
      const image = corporateImage(group, row);
      if (image && row.image !== image) { row.image = image; changed++; }
    }
  }
  return { data: next, changed };
}
