import {applyCorporateImages,corporateImage} from './corporate-images.js';
import {enhanceExperience,enhanceMegaMenu,decorateProjects} from './experience.js';
import {enhanceNavigation} from './navigation.js';
// Request an anonymous session/CSRF token before any mutations. No third-party services.
const originalFetch=window.fetch.bind(window);
const authResponse=await originalFetch('/api/auth',{cache:'no-store'});
const auth=await authResponse.json();
let csrfToken=auth.csrf;
window.fetch=async function(input,options={}){
 const url=new URL(typeof input==='string'?input:input.url,location.href);
 const method=(options.method||'GET').toUpperCase();
 const headers=new Headers(options.headers||{});
 if(url.origin===location.origin&&!['GET','HEAD','OPTIONS'].includes(method))headers.set('X-CSRF-Token',csrfToken);
 const res=await originalFetch(input,{...options,headers});
 if(res.status===401&&location.pathname==='/admin')location.assign('/login');
 return res;
};
async function logout(){const res=await fetch('/api/auth/logout',{method:'POST'});if(res.ok)location.assign('/login');else alert('Không đăng xuất được. Vui lòng thử lại.');}
async function uploadImage(file){if(file.size>2*1024*1024)throw Error('Ảnh cần nhỏ hơn 2 MB.');const form=new FormData();form.append('image',file);const response=await fetch('/api/uploads',{method:'POST',body:form});const result=await response.json();if(!response.ok)throw Error(result.error);return result.path;}
function uploadedImage(row){return row.image?'<img class="item-upload-image" src="'+esc(row.image)+'" alt="'+esc(row.title)+'">':'';}
const itemDetails = {
  products: {
    linora: 'Mục đích: Kết nối người mua và người bán trên một nền tảng giao dịch có yếu tố mạng xã hội.\nThành phần: Ứng dụng di động và website cho người dùng, dịch vụ chat để trao đổi, hệ thống quản trị để vận hành nền tảng.\nTình huống sử dụng: Người mua có thể tìm hiểu mặt hàng và trao đổi với người bán qua chat.',
    'linora-erp': 'Mục đích: Hỗ trợ doanh nghiệp quản trị hoạt động trên một hệ thống tập trung.\nHình thức: Phần mềm cung cấp dưới dạng dịch vụ (SaaS), thuộc hệ sinh thái Linora.\nPhù hợp khi: Doanh nghiệp muốn tập trung dữ liệu quản lý và giảm việc theo dõi trên nhiều công cụ rời. Phân hệ cụ thể phụ thuộc vào phạm vi triển khai.',
    'linora-ai': 'Mục đích: Đưa AI vào các tác vụ của doanh nghiệp trong hệ sinh thái Linora.\nTình huống có thể xem xét: Hỗ trợ tổng hợp thông tin hoặc tra cứu nội dung phục vụ công việc.\nKhi triển khai: Doanh nghiệp có thể xác định trước tác vụ ưu tiên và nguồn dữ liệu cần sử dụng.',
    'platinum ai agentic': 'Mục đích: Hỗ trợ bán hàng, chăm sóc khách hàng và tự động hóa công việc nội bộ.\nKênh có thể triển khai: Website, Zalo hoặc WhatsApp, tùy nhu cầu tích hợp.\nTình huống sử dụng: Hỗ trợ giải đáp câu hỏi thường gặp của khách hàng hoặc xử lý các bước lặp lại trong quy trình nội bộ.',
  },
  projects: {
    mcpayment: 'Bài toán: Xử lý thanh toán qua cổng thanh toán phần mềm.\nPhạm vi giới thiệu: Phát triển phần mềm cổng thanh toán, thuộc lĩnh vực công nghệ tài chính (fintech).',
    huewaco: 'Bài toán: Giảm thao tác thủ công khi xử lý dữ liệu giao dịch khách hàng.\nPhạm vi giới thiệu: Phần mềm số hóa và tự động hóa việc xử lý giao dịch khách hàng.',
    'thanh giong': 'Bài toán: Quản lý hoạt động của chuỗi đại lý phân phối gas.\nPhạm vi giới thiệu: Phần mềm ERP phục vụ quản trị chuỗi đại lý. Đây là ví dụ ứng dụng ERP trong lĩnh vực phân phối.',
    ar: 'Đối tượng sử dụng: Các công ty kế toán vừa và nhỏ.\nVai trò của Platinum: Tham gia phát triển phần mềm hỗ trợ nghiệp vụ kiểm toán cho nhóm doanh nghiệp này.',
    arvi: 'Bài toán: Tự động hóa công việc và hỗ trợ phân tích dữ liệu trong nghiệp vụ kiểm toán.\nVai trò của Platinum: Tham gia phát triển phần mềm phục vụ hai nhóm tác vụ này.',
    gosafe: 'Bài toán: Quản lý đội ngũ tài xế và điều phối phân công.\nPhạm vi giới thiệu: Phát triển hệ thống phần mềm quản lý và phân phối tài xế.',
    kg: 'Bài toán: Quản lý hoạt động phân phối bất động sản.\nPhạm vi giới thiệu: Phần mềm hỗ trợ quản lý và phân phối bất động sản.',
    linora: 'Bài toán: Kết nối hoạt động mua bán và trao đổi giữa người dùng trên môi trường số.\nPhạm vi giới thiệu: Phát triển nền tảng mạng xã hội giao dịch mua bán, gồm ứng dụng di động, website, dịch vụ chat và hệ thống quản trị.',
  },
};

let chatConfiguration={engine:'consultant',external:false,configured:true};
let data,revision=0,activeFilter='Tất cả',pendingDelete=null,logoDraft;
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastTimer;function toast(message){$('toast').textContent=message;$('toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.display='none',4500)}
function empty(){return '<p class="empty">Nội dung đang được cập nhật.</p>'}
const productImages = new Map([
  ['linora', ['linora', 'Ứng dụng mua bán với danh sách sản phẩm và tính năng trò chuyện']],
  ['linora-erp', ['linora-erp', 'Bảng điều khiển quản trị với biểu đồ bán hàng và danh sách đơn hàng']],
  ['linora-ai', ['linora-ai', 'Không gian làm việc với trợ lý AI và bảng tổng hợp thông tin']],
  ['platinum ai agentic', ['platinum-ai-agentic', 'Bảng điều khiển kết nối chăm sóc khách hàng, bán hàng và quy trình nội bộ']],
]);
function detailText(group, row) {
  const defaults=itemDetails[group]||{};return row.details?.trim() || (Object.hasOwn(defaults,row.title.trim().toLowerCase())?defaults[row.title.trim().toLowerCase()]:'');
}
function renderItemDetails(group, row) {
  const details = detailText(group, row) || row.description;
  return '<details class="item-details" id="' + esc(group + '-detail-' + row.id) + '">' +
    '<summary><span class="detail-label-closed">Xem chi tiết</span><span class="detail-label-open">Thu gọn</span><span class="detail-context"> ' + esc(row.title) + '</span></summary>' +
    details.split(/\r?\n/).filter(line => line.trim()).map(line => '<p>' + esc(line) + '</p>').join('') +
    '</details>';
}
$('showcase-detail').addEventListener('click', event => {
  const target = document.getElementById('products-detail-' + showcaseProduct);
  if (!target) return;
  event.preventDefault();
  target.open = true;
  target.querySelector('summary').focus();
  target.scrollIntoView({block: 'start'});
});
let showcaseProduct;
function renderShowcase(products) {
  const featured = products.filter(product => productImages.has(product.title.trim().toLowerCase()));
  $('hero-showcase').hidden = featured.length === 0;
  const selected = featured.find(product => product.id === showcaseProduct) || featured[0];
  const controls = $('showcase-controls');
  controls.replaceChildren();
  if (!selected) return;

  function show(product) {
    showcaseProduct = product.id;
    const [image, alt] = productImages.get(product.title.trim().toLowerCase());
    $('showcase-image').src = '/images/featured-' + image + '.webp';
    $('showcase-image').alt = alt;
    $('showcase-name').textContent = product.title;
    $('showcase-description').textContent = product.description;
    $('showcase-detail').href = '#products-detail-' + encodeURIComponent(product.id);
    for (const button of controls.children) {
      button.setAttribute('aria-pressed', String(button.dataset.productId === product.id));
    }
  }

  for (const product of featured) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.productId = product.id;
    button.textContent = product.title;
    button.addEventListener('click', () => show(product));
    controls.append(button);
  }
  show(selected);
}
function render(){const c=data.company;for(const id of ['slogan','intro','about','vision','mission','founded','address','branch'])$(id).textContent=c[id];
$('representative-name').textContent=c.ceo;$('year').textContent=new Date().getFullYear();
for(const key of ['title','intro','slogan','tax','founded','address','branch'])$('footer-'+key).textContent=c[key];
$('top-address').textContent=c.address;
const solution = $('lead-solution');
const chosen = solution.value;
solution.replaceChildren(new Option('Chọn giải pháp',''), ...data.services.map(service => new Option(service.title,service.title)), new Option('Giải pháp khác','Giải pháp khác'));
solution.value = Array.from(solution.options).some(option => option.value === chosen) ? chosen : '';
const phone='tel:'+c.phone.replace(/[^+\d]/g,''),email='mailto:'+c.email;
for(const id of ['top-email','contact-email','footer-email']){$(id).textContent=c.email;$(id).href=email}
for(const id of ['top-phone','contact-phone','footer-phone']){$(id).textContent=c.phone;$(id).href=phone}
$('contact-web').textContent=c.website;try{const u=new URL(c.website.startsWith('https://')?c.website:'https://'+c.website);$('contact-web').href=u.protocol==='https:'?u.href:'#'}catch{$('contact-web').removeAttribute('href')}
$('brand').innerHTML=c.logo?'<img src="'+esc(c.logo)+'" alt="Logo Platinum Technology">':'<span class="brandmark">pt</span><span><strong>platinum</strong><small>technology</small></span>';
$('footer-brand').innerHTML=$('brand').innerHTML;
const symbols=['&lt;/&gt;','▤','✧','◇','◎','→'];$('services').innerHTML=data.services.map((r,i)=>'<article class="card" id="'+esc('services-item-'+r.id)+'">'+uploadedImage(r)+'<div class="service-icon"><span class="symbol">'+symbols[i%symbols.length]+'</span><span class="tag">'+esc(r.tag)+'</span></div><h3>'+esc(r.title)+'</h3><p>'+esc(r.description)+'</p></article>').join('')||empty();
renderShowcase(data.products);
$('products').innerHTML = data.products.map(row => {
  const art = productImages.get(row.title.trim().toLowerCase());
  const picture = art ? '<img class="product-art" src="/images/' + art[0] + '.webp" alt="' + esc(art[1]) + '" width="900" height="600" loading="lazy" decoding="async">' : '';
  return '<article class="card product">' + picture + '<span class="tag">' + esc(row.tag) + '</span><h3>' + esc(row.title) + '</h3><p>' + esc(row.description) + '</p>' + renderItemDetails('products', row) + '</article>';
}).join('') || empty();
renderProjects();$('process').innerHTML=data.process.map(r=>'<article class="step" id="'+esc('process-item-'+r.id)+'"><span class="tag">'+esc(r.tag)+'</span><h3>'+esc(r.title)+'</h3><p>'+esc(r.description)+'</p></article>').join('')||empty();
$('values').innerHTML=data.values.map(r=>'<article class="value" id="'+esc('values-item-'+r.id)+'"><span class="tag">'+esc(r.tag)+'</span><h3>'+esc(r.title)+'</h3><p>'+esc(r.description)+'</p></article>').join('')||empty();
$('community').innerHTML=data.community.map(r=>'<article class="card" id="'+esc('community-item-'+r.id)+'"><span class="tag">'+esc(r.tag)+'</span><h3>'+esc(r.title)+'</h3><p>'+esc(r.description)+'</p></article>').join('')||empty();}
function renderProjects(){const tags=['Tất cả',...new Set(data.projects.map(r=>r.tag))];if(!tags.includes(activeFilter))activeFilter='Tất cả';$('filters').innerHTML=tags.map(t=>'<button class="filter '+(t===activeFilter?'active':'')+'" aria-pressed="'+(t===activeFilter)+'" data-filter="'+esc(t)+'">'+esc(t)+'</button>').join('');$('projects').innerHTML=data.projects.filter(r=>activeFilter==='Tất cả'||r.tag===activeFilter).map((r,i)=>'<article class="card project">'+uploadedImage(r)+'<h3>'+esc(r.title)+'<span>'+String(i+1).padStart(2,'0')+'</span></h3><p>'+esc(r.description)+'</p><span class="tag">'+esc(r.tag)+'</span>'+renderItemDetails('projects', r)+'</article>').join('')||empty()}
$('filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(b){activeFilter=b.dataset.filter;renderProjects()}});
$('menu').onclick=()=>{const open=$('nav').classList.toggle('open');$('menu').setAttribute('aria-expanded',String(open))};$('nav').onclick=e=>{if(e.target.closest('a')){$('nav').classList.remove('open');$('menu').setAttribute('aria-expanded','false')}};
async function load(){const res=await fetch('/api/content',{cache:'no-store'});if(!res.ok)throw Error('Không tải được nội dung. Vui lòng tải lại trang.');const body=await res.json();data=body.data;revision=body.revision;render()}
async function save(next){const buttons=document.querySelectorAll('dialog button[type="submit"],#delete-confirm');buttons.forEach(b=>b.disabled=true);try{const res=await fetch('/api/content',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:next,revision})});const body=await res.json();if(!res.ok){if(res.status===409){await load();adminRender();throw Error('Nội dung vừa thay đổi ở phiên khác. Đã tải bản mới; hãy kiểm tra rồi chỉnh sửa lại.')}throw Error(body.error||'Không lưu được nội dung.')}data=next;revision=body.revision;render();adminRender();toast('Đã lưu thay đổi vào cơ sở dữ liệu.');if(contentChannel)contentChannel.postMessage({type:'content-updated'});return true}catch(e){toast(e.message);return false}finally{buttons.forEach(b=>b.disabled=false)}}
const labels={title:'Tên công ty',slogan:'Slogan',intro:'Giới thiệu ngắn',about:'Giới thiệu công ty',vision:'Tầm nhìn',mission:'Sứ mệnh',ceo:'Người đại diện',tax:'Mã số thuế',founded:'Năm thành lập',phone:'Điện thoại',email:'Email',website:'Website',address:'Trụ sở chính',branch:'Chi nhánh'};
function adminRender(){const k=$('collection').value;$('add').classList.toggle('hidden',k==='company');if(k==='company'){logoDraft=data.company.logo;let fields=Object.entries(labels).map(([key,label])=>{const multi=['intro','about','vision','mission'].includes(key);return '<label class="'+(multi||['address','branch','title'].includes(key)?'full':'')+'">'+label+(multi?'<textarea name="'+key+'" required maxlength="10000">'+esc(data.company[key])+'</textarea>':'<input name="'+key+'" type="'+(key==='email'?'email':'text')+'" required maxlength="500" value="'+esc(data.company[key])+'">')+'</label>'}).join('');$('admin-content').innerHTML='<form id="company-form"><div class="save-bar"><span>Chỉnh sửa rồi bấm Lưu để cập nhật website.</span><button class="btn primary" type="submit">Lưu thông tin công ty</button></div><div class="fields">'+fields+'<label class="full">Logo công ty (PNG, JPEG, WebP; tối đa 2 MB)<input id="logo-file" type="file" accept="image/png,image/jpeg,image/webp"><img id="logo-preview" class="logo-preview '+(!logoDraft?'hidden':'')+'" alt="Logo đã chọn" '+(logoDraft?'src="'+esc(logoDraft)+'"':'')+'></label><div class="full"><button class="btn" id="logo-remove" type="button">Gỡ logo</button></div></div><div class="form-actions"><button class="btn primary" type="submit">Lưu thông tin công ty</button></div></form>';
$('logo-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{logoDraft=await uploadImage(file);$('logo-preview').src=logoDraft;$('logo-preview').classList.remove('hidden')}catch(error){toast(error.message);e.target.value=''}};
$('logo-remove').onclick=()=>{logoDraft='';$('logo-preview').removeAttribute('src');$('logo-preview').classList.add('hidden');$('logo-file').value=''};
$('company-form').onsubmit=async e=>{e.preventDefault();const next=structuredClone(data);for(const [key,val]of new FormData(e.target))next.company[key]=String(val).trim();next.company.logo=logoDraft;await save(next)};
}else{$('admin-content').innerHTML=data[k].map(r=>'<div class="admin-row"><div><strong>'+esc(r.title)+'</strong><p>'+esc(r.tag)+'</p></div><div class="buttons"><button class="btn" data-edit="'+esc(r.id)+'">Sửa</button><button class="btn danger" data-delete="'+esc(r.id)+'">Xoá</button></div></div>').join('')||empty()}}
$('admin-open').onclick=()=>{if(!data){toast('Nội dung chưa tải xong.');return}adminRender();$('admin').showModal()};$('admin-close').onclick=()=>$('admin').close();$('collection').onchange=adminRender;
function edit(id){const group=$('collection').value;const row=data[group].find(r=>r.id===id)||{id:'',title:'',description:'',tag:''};const field=$('edit-form').elements.namedItem('details');field.disabled=!['services','products','projects','process','values','community'].includes(group);$('editor-details').hidden=field.disabled;field.value=field.disabled?'':detailText(group,row);$('editor-title').textContent=id?'Chỉnh sửa nội dung':'Thêm nội dung';for(const key of ['id','title','description','tag'])$('edit-form').elements.namedItem(key).value=row[key];$('edit-form').elements.namedItem('image').value=row.image||'';$('item-image').value='';$('item-image-preview').src=row.image||'';$('item-image-preview').classList.toggle('hidden',!row.image);$('editor').showModal()}
$('add').onclick=()=>edit('');$('admin-content').onclick=e=>{const editButton=e.target.closest('[data-edit]'),deleteButton=e.target.closest('[data-delete]');if(editButton)edit(editButton.dataset.edit);if(deleteButton){const k=$('collection').value;pendingDelete={collection:k,id:deleteButton.dataset.delete};$('confirm-text').textContent='Bạn muốn xoá “'+data[k].find(r=>r.id===pendingDelete.id).title+'”?';$('confirm').showModal()}};
$('editor-close').onclick=$('edit-cancel').onclick=()=>$('editor').close();$('delete-cancel').onclick=()=>$('confirm').close();
$('edit-form').onsubmit=async e=>{e.preventDefault();const row=Object.fromEntries(new FormData(e.target));if(row.details!==undefined)row.details=row.details.trim();for(const k of ['title','description','tag']){row[k]=row[k].trim();if(!row[k]){toast('Vui lòng nhập đủ nội dung.');return}}const next=structuredClone(data),list=next[$('collection').value],idx=list.findIndex(r=>r.id===row.id);if(idx>=0)list[idx]=row;else{row.id=crypto.randomUUID();list.push(row)}if(await save(next))$('editor').close()};
$('delete-confirm').onclick=async()=>{if(!pendingDelete)return;const next=structuredClone(data);next[pendingDelete.collection]=next[pendingDelete.collection].filter(r=>r.id!==pendingDelete.id);if(await save(next)){$('confirm').close();pendingDelete=null}};
load().catch(e=>{$('notice').textContent=e.message;$('notice').classList.add('show')});

// Dedicated management page and server-backed consultation inbox.
for (const [id, direction] of [['page-up', -1], ['page-down', 1]]) {
  $(id).addEventListener('click', () => window.scrollBy({top: direction * Math.round(window.innerHeight * 0.75)}));
}
const adminRoute=location.pathname==='/admin';let chatHistory=[],chatBusy=false,statusData;
if(adminRoute){document.body.classList.add('admin-route');document.title='Quản trị | Platinum Technology';$('admin').setAttribute('open','');$('nav').innerHTML='<a href="/">← Xem website</a><button id="logout" class="btn">Đăng xuất</button>'; $('logout').onclick=logout}
const renderBase=render;
render=function(){renderBase();if(adminRoute)adminRender();else{enhanceNavigation(data,{showAllProjects:()=>{activeFilter='Tất cả';renderProjects()}});enhanceExperience(data);enhanceMegaMenu(data)}refreshStatus()};
const adminRenderBase=adminRender;
adminRender=function(){if($('collection').value==='leads'){$('add').classList.add('hidden');renderLeads()}else adminRenderBase();refreshStatus()};
$('admin-open').onclick=()=>location.assign('/admin');
async function refreshStatus(){try{const res=await fetch('/api/status',{cache:'no-store'});if(!res.ok)throw Error();const s=await res.json();statusData=s;$('dashboard').innerHTML='<div><strong>'+s.counts.content+'</strong><span>Mục nội dung</span></div><div><strong>'+s.counts.leads+'</strong><span>Yêu cầu tư vấn</span></div><div><strong>'+s.counts.pending+'</strong><span>Chưa liên hệ</span></div><div><strong>#'+s.revision+'</strong><span>Phiên bản nội dung</span></div>';$('db-status').textContent='● Dữ liệu đã kết nối · Nội dung được lưu và tải từ cơ sở dữ liệu.';chatConfiguration=s.chat||{engine:s.ai==='local_ai_configured'?'ollama':'consultant',external:false,configured:true};
const external=chatConfiguration.engine==='gemini';
$('chat-cloud-consent').hidden=!external;
$('test-gemini').hidden=!external;
$('ai-status').textContent=external?(chatConfiguration.configured?'Đã cấu hình key Gemini trên máy chủ; bấm kiểm tra để xác nhận kết nối.':'Đã chọn Gemini nhưng chưa có API key. Chạy npm run ai:gemini trong Terminal.'):(chatConfiguration.engine==='ollama'?'Đã chọn Ollama local; khi chưa kết nối được, trợ lý dùng tư vấn dự phòng.':'Trợ lý tư vấn theo hồ sơ và ngữ cảnh, không gọi dịch vụ ngoài.');
updateChatDisclosure();}catch{$('db-status').textContent='Chưa kiểm tra được kết nối dữ liệu. Vui lòng tải lại trang.'}}
async function renderLeads(){const box=$('admin-content');box.textContent='Đang tải yêu cầu…';try{const res=await fetch('/api/leads',{cache:'no-store'});const b=await res.json();if(!res.ok)throw Error(b.error);if($('collection').value!=='leads')return;box.innerHTML='<div class="admin-bar"><p>Yêu cầu gửi từ biểu mẫu trên website. Tối đa 200 yêu cầu mới nhất.</p><button class="btn" id="leads-refresh">Làm mới</button></div>'+b.leads.map(row=>'<article class="lead-card"><h3>'+esc(row.name)+'</h3><p class="lead-meta">'+esc(row.contact)+' · '+esc(new Date(row.created_at).toLocaleString('vi-VN'))+'</p><p class="lead-text">'+esc(row.message)+'</p><div class="buttons"><label>Trạng thái<select data-lead-status="'+esc(row.id)+'">'+[['new','Chưa liên hệ'],['contacted','Đã liên hệ'],['done','Hoàn thành']].map(([v,label])=>'<option value="'+v+'" '+(v===row.status?'selected':'')+'>'+label+'</option>').join('')+'</select></label><button class="btn danger" data-lead-delete="'+esc(row.id)+'">Xoá yêu cầu</button></div></article>').join('');$('leads-refresh').onclick=renderLeads;if(!b.leads.length)box.insertAdjacentHTML('beforeend','<p class="empty">Chưa có yêu cầu tư vấn. Hãy gửi thử một yêu cầu từ biểu mẫu liên hệ trên website.</p>')}catch(e){box.textContent=e.message||'Không tải được yêu cầu tư vấn.'}}
$('admin-content').addEventListener('change',async e=>{const id=e.target.dataset.leadStatus;if(!id)return;const select=e.target;select.disabled=true;try{const res=await fetch('/api/leads/'+encodeURIComponent(id),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:select.value})});const b=await res.json();if(!res.ok)throw Error(b.error);toast('Đã lưu trạng thái yêu cầu.');refreshStatus()}catch(e){toast(e.message);renderLeads()}finally{select.disabled=false}});
$('admin-content').addEventListener('click',async e=>{const btn=e.target.closest('[data-lead-delete]');if(!btn||!window.confirm('Xoá yêu cầu tư vấn này khỏi cơ sở dữ liệu?'))return;btn.disabled=true;try{const res=await fetch('/api/leads/'+encodeURIComponent(btn.dataset.leadDelete),{method:'DELETE'});const b=await res.json();if(!res.ok)throw Error(b.error);toast('Đã xoá yêu cầu tư vấn.');await renderLeads();refreshStatus()}catch(e){toast(e.message);btn.disabled=false}});
$('lead-form').onsubmit=async e=>{e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;$('lead-feedback').textContent='Đang gửi…';try{const body=Object.fromEntries(new FormData(e.target));const res=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const b=await res.json();if(!res.ok)throw Error(b.error);$('lead-feedback').textContent='Đã gửi yêu cầu thành công. Mã tiếp nhận: '+b.id.slice(0,8)+'. Công ty có thể xem và xử lý trong trang quản trị.';e.target.reset();refreshStatus()}catch(e){$('lead-feedback').textContent=e.message||'Chưa gửi được yêu cầu. Vui lòng thử lại.'}finally{button.disabled=false}};
function bubble(text,role,source){const el=document.createElement('div');el.className='chat-bubble '+role;el.textContent=text;if(source){const span=document.createElement('span');span.className='chat-source';span.textContent=source;el.appendChild(span)}$('chat-messages').appendChild(el);$('chat-messages').scrollTop=$('chat-messages').scrollHeight;return el}
function showChat(){const panel=$('chat-panel');panel.classList.remove('hidden');$('chat-launch').setAttribute('aria-expanded','true');$('chat-input').focus();if(!$('chat-messages').children.length)bubble('Chào bạn! Mình là trợ lý tư vấn Platinum. Bạn đang muốn giải quyết việc gì cho doanh nghiệp? Ví dụ, mình có thể giúp bạn tìm hướng quản lý tập trung, làm website hoặc tự động hóa chăm sóc khách hàng.','assistant')}
$('chat-launch').onclick=()=>{if($('chat-panel').classList.contains('hidden'))showChat();else closeChat()};function closeChat(){$('chat-panel').classList.add('hidden');$('chat-launch').setAttribute('aria-expanded','false');$('chat-launch').focus()}
$('chat-close').onclick=closeChat;$('chat-panel').addEventListener('keydown',e=>{if(e.key==='Escape')closeChat()});
const chatActions = {
  contact: ['Gửi yêu cầu tư vấn', '#lien-he'],
  products: ['Xem các sản phẩm', '#san-pham'],
  services: ['Xem các dịch vụ', '#dich-vu'],
};
async function sendChat(message) {
  message = message.trim();
  if (!message || chatBusy) return;
  chatBusy = true;
  $('chat-send').disabled = true;
  $('chat-input').value = '';
  await restorePromise;
  bubble(message, 'user');
  const pending = bubble('Đang trả lời…', 'assistant');
  try {
    const res = await fetch('/api/chat', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({message,allowExternalAi:$('allow-external-ai').checked}),
    });
    const response = await res.json();
    if (!res.ok) throw Error(response.error);
    const output = bubble(response.answer, 'assistant', response.source);
    $('chat-mode').textContent=response.mode==='gemini'?'Google Gemini · Tư vấn theo hồ sơ':response.mode==='local_ai'?'AI local · Tư vấn theo nhu cầu':'Tư vấn theo hồ sơ Platinum';
    updateSuggestions(response.suggestions);
    $('chat-info').textContent=response.notice||(response.mode==='gemini'?'Google Gemini xử lý nội dung chat. Cần xác nhận thông tin quan trọng với công ty.':'Câu trả lời dựa trên hồ sơ và ngữ cảnh trao đổi.');
    if (Object.hasOwn(chatActions, response.action)) {
      const [label, href] = chatActions[response.action];
      const link = document.createElement('a');
      link.className = 'chat-action';
      link.href = href;
      link.textContent = label + ' →';
      link.addEventListener('click', () => {
        if(response.action==='contact'&&response.brief){const field=$('lead-form').elements.namedItem('message');if(!field.value.trim())field.value=response.brief.slice(0,3000);}
        closeChat();
        const section = document.querySelector(href);
        const focusTarget = section.querySelector('input, h2');
        if (focusTarget) {
          if (focusTarget.tagName === 'H2') focusTarget.tabIndex = -1;
          focusTarget.focus({preventScroll:true});
        }
      });
      output.append(link);
    }
    chatHistory = [...chatHistory, {role:'user',content:message}, {role:'assistant',content:response.answer}].slice(-8);
  } catch (error) {
    bubble(error.message || 'Chưa kết nối được trợ lý. Vui lòng thử lại.', 'error');
  } finally {
    pending.remove();
    $('chat-messages').scrollTop = $('chat-messages').scrollHeight;
    chatBusy = false;
    $('chat-send').disabled = false;
    if (!$('chat-panel').classList.contains('hidden')) $('chat-input').focus();
  }
}
$('chat-form').onsubmit=e=>{e.preventDefault();sendChat($('chat-input').value)};$('chat-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat(e.target.value)}});$('chat-suggestions').onclick=e=>{const btn=e.target.closest('button');if(btn)sendChat(btn.textContent)};

const contentChannel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('platinum-content'):null;
if(contentChannel)contentChannel.onmessage=event=>{if(event.data?.type==='content-updated'&&!adminRoute)load().catch(()=>toast('Có nội dung mới. Vui lòng tải lại trang.'))};
window.addEventListener('focus',()=>{if(!adminRoute&&data)load().catch(()=>{})});


$('item-image').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const path=await uploadImage(file);$('edit-form').elements.namedItem('image').value=path;$('item-image-preview').src=path;$('item-image-preview').classList.remove('hidden')}catch(error){toast(error.message);e.target.value=''}};
$('item-image-remove').onclick=()=>{$('edit-form').elements.namedItem('image').value='';$('item-image-preview').classList.add('hidden');$('item-image-preview').removeAttribute('src');$('item-image').value=''};
// Resolve the current management renderer, including the consultation inbox.
$('collection').onchange=()=>adminRender();

function updateSuggestions(items){if(!Array.isArray(items)||!items.length)return;const box=$('chat-suggestions');box.replaceChildren();for(const label of items.slice(0,3)){if(typeof label!=='string')continue;const button=document.createElement('button');button.type='button';button.textContent=label;box.appendChild(button)}}
async function restoreChat(){try{const res=await fetch('/api/chat/history',{cache:'no-store'});if(!res.ok)return;const {history}=await res.json();if(!Array.isArray(history)||!history.length)return;chatHistory=history.slice(-16);$('chat-messages').replaceChildren();for(const row of chatHistory)if(['user','assistant'].includes(row.role))bubble(row.content,row.role);}catch{}}
const restorePromise=restoreChat();
$('chat-reset').onclick=async()=>{if(chatBusy)return;await restorePromise;try{const res=await fetch('/api/chat/reset',{method:'POST'});if(!res.ok)throw Error('Chưa bắt đầu được cuộc tư vấn mới.');chatHistory=[];$('chat-messages').replaceChildren();updateSuggestions(['Tôi muốn quản lý tập trung','Tư vấn AI agent','Tôi cần website động']);showChat();toast('Đã bắt đầu cuộc tư vấn mới.')}catch(error){toast(error.message)}};

const originalProjectRenderer=renderProjects;
renderProjects=function(){originalProjectRenderer();decorateProjects(data)};

// Only image choices change; descriptions, records and uploaded files are preserved.
const imageBackupKey='platinum-image-choices-v1';
let imageRefreshBusy=false;
$('apply-corporate-images').onclick=async()=>{
 if(imageRefreshBusy)return;
 imageRefreshBusy=true;
 const button=$('apply-corporate-images');button.disabled=true;
 const status=$('image-refresh-status');
 try{
  await load();
  const next=applyCorporateImages(data);
  if(!next.changed){status.textContent='Các mục đã sử dụng bộ ảnh doanh nghiệp.';return;}
  const previous=[];
  for(const group of ['services','products','projects'])for(const row of data[group]){
   const applied=corporateImage(group,row);
   if(applied&&row.image!==applied)previous.push({group,id:row.id,image:row.image||'',applied});
  }
  localStorage.setItem(imageBackupKey,JSON.stringify(previous));
  if(await save(next.data))status.textContent='Đã thay '+next.changed+' ảnh. Mở website để xem kết quả.';
 }catch(error){status.textContent='Chưa áp dụng được: '+error.message;}
 finally{imageRefreshBusy=false;button.disabled=false;}
};
$('restore-corporate-images').onclick=async()=>{
 if(imageRefreshBusy)return;
 imageRefreshBusy=true;const button=$('restore-corporate-images');button.disabled=true;
 const status=$('image-refresh-status');
 try{
  const previous=JSON.parse(localStorage.getItem(imageBackupKey)||'[]');
  if(!Array.isArray(previous)||!previous.length){status.textContent='Chưa có bản sao lựa chọn ảnh trong trình duyệt này.';return;}
  await load();const next=structuredClone(data);let changed=0;
  for(const saved of previous){const row=next[saved.group]?.find(r=>r.id===saved.id);if(row&&row.image===saved.applied){row.image=saved.image;changed++;}}
  if(!changed){status.textContent='Không có ảnh cần khôi phục; các ảnh đã sửa tiếp được giữ nguyên.';return;}
  if(await save(next)){localStorage.removeItem(imageBackupKey);status.textContent='Đã khôi phục '+changed+' lựa chọn ảnh trước đó.';}
 }catch(error){status.textContent='Chưa khôi phục được: '+error.message;}
 finally{imageRefreshBusy=false;button.disabled=false;}
};

function updateChatDisclosure(){
 const external=chatConfiguration.engine==='gemini';
 $('chat-mode').textContent=external&&$('allow-external-ai').checked?'Google Gemini · Có tư vấn dự phòng':chatConfiguration.engine==='ollama'?'AI local · Có tư vấn dự phòng':'Tư vấn theo hồ sơ Platinum';
 $('chat-info').textContent=external?'Nếu chọn dùng Gemini, câu hỏi, lịch sử chat và hồ sơ công khai Platinum sẽ được gửi tới Google. Không nhập mật khẩu hay API key vào chat.':'Tư vấn theo hồ sơ tại máy chủ; không gửi nội dung tới Google.';
}
$('allow-external-ai').onchange=updateChatDisclosure;
$('test-gemini').onclick=async()=>{
 const button=$('test-gemini');button.disabled=true;
 $('gemini-test-status').textContent='Đang kiểm tra một yêu cầu ngắn tới Google…';
 try{const response=await fetch('/api/ai/test',{method:'POST'});const result=await response.json();if(!response.ok)throw Error(result.message||result.error||'Chưa kiểm tra được.');$('gemini-test-status').textContent=result.message+(result.ok?' Mô hình: '+result.model:'');}
 catch(error){$('gemini-test-status').textContent=error.message;}
 finally{button.disabled=false;}
};
