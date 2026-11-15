import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import {rateLimit} from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import {randomBytes,randomUUID,timingSafeEqual} from 'node:crypto';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
import {root,config} from './config.js';
import {MysqlSessionStore} from './session-store.js';
import {readContent,saveContent,groups,problem} from './content.js';
import {consult,localAiUrl} from './local-ai.js';
import {sanitizeHistory} from './advisor.js';
import {checkGemini,geminiModel} from './gemini-ai.js';
import {resolvePublicPath} from './public-pages.js';

export function createApp(pool,options={}){
 const settings={...config,...options};if(settings.sessionSecret.length<32)throw Error('SESSION_SECRET phải có ít nhất 32 ký tự. Chạy npm run setup trước.');
 if(!['consultant','ollama','gemini'].includes(settings.chatEngine))throw Error('CHAT_ENGINE cần là consultant, ollama hoặc gemini.');if(settings.chatEngine==='ollama')localAiUrl(settings.ollamaUrl);if(settings.chatEngine==='gemini')geminiModel(settings.geminiModel);
 const chatConfiguration=()=>({engine:settings.chatEngine,external:settings.chatEngine==='gemini',configured:settings.chatEngine==='gemini'?!!settings.geminiApiKey.trim():true,requiresConsent:settings.chatEngine==='gemini'});
 const app=express(),store=new MysqlSessionStore(pool);
 app.disable('x-powered-by');app.set('trust proxy',false);
 app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'","data:"],connectSrc:["'self'"],objectSrc:["'none'"],baseUri:["'none'"],formAction:["'self'"],upgradeInsecureRequests:null}},strictTransportSecurity:settings.production?undefined:false}));
 app.use(express.json({limit:'1mb'}));
 app.use((req,res,next)=>{if(req.path.startsWith('/api/')||['/admin','/login'].includes(req.path))res.set('Cache-Control','no-store');next()});
 app.use('/css',express.static(path.join(root,'public/css')));app.use('/js',express.static(path.join(root,'public/js')));app.use('/images',express.static(path.join(root,'public/images')));app.use('/uploads',express.static(path.join(root,'public/uploads'),{dotfiles:'deny',setHeaders:res=>res.set('X-Content-Type-Options','nosniff')}));
 app.use(session({name:'platinum.sid',secret:settings.sessionSecret,store,resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:settings.production,maxAge:8*60*60*1000}}));
 const requireAdmin=(req,res,next)=>req.session.admin?next():res.status(401).json({error:'Vui lòng đăng nhập quản trị.'});
 app.use('/api',(req,res,next)=>{if(['GET','HEAD','OPTIONS'].includes(req.method))return next();const origin=req.get('origin');if(origin&&origin!==`${req.protocol}://${req.get('host')}`)return next(problem(403,'Nguồn yêu cầu không hợp lệ.'));
 const expected=req.session.csrf,actual=req.get('x-csrf-token');if(!expected||!actual||Buffer.byteLength(actual)!==Buffer.byteLength(expected)||!timingSafeEqual(Buffer.from(actual),Buffer.from(expected)))return next(problem(403,'Phiên làm việc hết hạn hoặc mã xác thực không hợp lệ. Tải lại trang.'));next()});
 app.get('/api/auth',(req,res)=>{if(!req.session.csrf)req.session.csrf=randomBytes(24).toString('hex');res.json({authenticated:!!req.session.admin,username:req.session.admin?.username||null,csrf:req.session.csrf})});
 const loginLimiter=rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Bạn đăng nhập quá nhiều lần. Vui lòng thử lại sau.'}});
 app.post('/api/auth/login',loginLimiter,async(req,res)=>{const {username,password}=req.body||{};if(typeof username!=='string'||typeof password!=='string'||username.length>80||password.length>200)throw problem(400,'Thông tin đăng nhập không hợp lệ.');const [[admin]]=await pool.execute('SELECT id,username,password_hash FROM admins WHERE username=?',[username.trim()]);if(!admin||!await bcrypt.compare(password,admin.password_hash))throw problem(401,'Tên đăng nhập hoặc mật khẩu không đúng.');await new Promise((resolve,reject)=>req.session.regenerate(e=>e?reject(e):resolve()));req.session.admin={id:admin.id,username:admin.username};req.session.csrf=randomBytes(24).toString('hex');await new Promise((resolve,reject)=>req.session.save(e=>e?reject(e):resolve()));res.json({authenticated:true,username:admin.username,csrf:req.session.csrf})});
 app.post('/api/auth/logout',requireAdmin,async(req,res)=>{await new Promise((resolve,reject)=>req.session.destroy(e=>e?reject(e):resolve()));res.clearCookie('platinum.sid',{path:'/'}).json({ok:true})});
 app.get('/api/content',async(req,res)=>res.json(await readContent(pool)));
 app.put('/api/content',requireAdmin,async(req,res)=>res.json({revision:await saveContent(pool,req.body?.data,req.body?.revision)}));
 // REST endpoints for individual collections. The management UI uses the same transactional save function.
 for(const group of groups){
 app.get('/api/'+group,async(req,res)=>{const current=await readContent(pool);res.json({items:current.data[group],revision:current.revision})});
 app.post('/api/'+group,requireAdmin,async(req,res)=>{const current=await readContent(pool);const row={...req.body?.item,id:randomUUID()};current.data[group].push(row);res.status(201).json({item:row,revision:await saveContent(pool,current.data,req.body?.revision)})});
 app.put('/api/'+group+'/:id',requireAdmin,async(req,res)=>{const current=await readContent(pool);const index=current.data[group].findIndex(r=>r.id===req.params.id);if(index<0)throw problem(404,'Không tìm thấy nội dung.');current.data[group][index]={...req.body?.item,id:req.params.id};res.json({revision:await saveContent(pool,current.data,req.body?.revision)})});
 app.delete('/api/'+group+'/:id',requireAdmin,async(req,res)=>{const current=await readContent(pool);if(!current.data[group].some(r=>r.id===req.params.id))throw problem(404,'Không tìm thấy nội dung.');current.data[group]=current.data[group].filter(r=>r.id!==req.params.id);res.json({revision:await saveContent(pool,current.data,req.body?.revision)})});
 }
 const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:2*1024*1024,files:1}});
 app.post('/api/uploads',requireAdmin,upload.single('image'),async(req,res)=>{const b=req.file?.buffer;if(!b)throw problem(400,'Chưa chọn ảnh.');let ext;if(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';else if(b[0]===255&&b[1]===216&&b[2]===255)ext='jpg';else if(b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP')ext='webp';else throw problem(400,'Chỉ nhận ảnh PNG, JPEG hoặc WebP hợp lệ.');const filename=randomUUID()+'.'+ext;await mkdir(path.join(root,'public/uploads'),{recursive:true});await writeFile(path.join(root,'public/uploads',filename),b,{flag:'wx'});res.status(201).json({path:'/uploads/'+filename})});
 const publicLimiter=rateLimit({windowMs:60000,limit:30,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau.'}});
 app.post('/api/leads',publicLimiter,async(req,res)=>{const {name,contact,message}=req.body||{};if(typeof name!=='string'||!name.trim()||name.length>120||typeof message!=='string'||!message.trim()||message.length>3000||typeof contact!=='string'||contact.length>200||!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)||/^\+?[\d\s().-]{8,25}$/.test(contact)))throw problem(400,'Nhập họ tên, email hoặc điện thoại hợp lệ và nhu cầu tư vấn.');const extras=[];for(const [key,label,max]of [['company','Công ty',120],['phone','Điện thoại',25],['solution','Giải pháp quan tâm',200]]){const value=req.body[key];if(value!==undefined&&(typeof value!=='string'||value.length>max))throw problem(400,'Thông tin bổ sung không hợp lệ.');if(value?.trim())extras.push(label+': '+value.trim())}const savedMessage=[...extras,message.trim()].join('\n');const id=randomUUID();await pool.execute('INSERT INTO consultation_requests(id,name,contact,message) VALUES (?,?,?,?)',[id,name.trim(),contact.trim(),savedMessage]);res.status(201).json({id})});
 app.get('/api/leads',requireAdmin,async(req,res)=>{const [leads]=await pool.query('SELECT * FROM consultation_requests ORDER BY created_at DESC LIMIT 200');res.json({leads})});
 app.patch('/api/leads/:id',requireAdmin,async(req,res)=>{if(!['new','contacted','done'].includes(req.body?.status))throw problem(400,'Trạng thái không hợp lệ.');const [result]=await pool.execute('UPDATE consultation_requests SET status=? WHERE id=?',[req.body.status,req.params.id]);if(!result.affectedRows)throw problem(404,'Không tìm thấy yêu cầu.');res.json({ok:true})});
 app.delete('/api/leads/:id',requireAdmin,async(req,res)=>{const [result]=await pool.execute('DELETE FROM consultation_requests WHERE id=?',[req.params.id]);if(!result.affectedRows)throw problem(404,'Không tìm thấy yêu cầu.');res.json({ok:true})});
 app.get('/api/status',async(req,res)=>{const current=await readContent(pool);let counts={content:groups.reduce((n,k)=>n+current.data[k].length,0)};if(req.session.admin){const [[row]]=await pool.query("SELECT COUNT(*) AS total,SUM(status='new') AS pending FROM consultation_requests");counts={...counts,leads:row.total,pending:Number(row.pending||0)}}res.json({database:'connected',revision:current.revision,ai:settings.chatEngine==='gemini'?(settings.geminiApiKey.trim()?'gemini_configured':'gemini_missing_key'):settings.chatEngine==='ollama'?'local_ai_configured':'consultant',chat:chatConfiguration(),counts})});
 app.get('/api/chat/config',(req,res)=>res.json(chatConfiguration()));
 const aiTestLimiter=rateLimit({windowMs:60000,limit:3,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Chờ một phút trước khi kiểm tra Gemini tiếp.'}});
 app.post('/api/ai/test',requireAdmin,aiTestLimiter,async(req,res)=>{
  if(settings.chatEngine!=='gemini')return res.status(400).json({ok:false,message:'Đặt CHAT_ENGINE=gemini trong .env rồi khởi động lại website.'});
  const result=await checkGemini({apiKey:settings.geminiApiKey,model:settings.geminiModel},settings.aiTransport||fetch);
  res.json(result);
 });
 app.get('/api/chat/history',(req,res)=>{const current=req.session.chat;res.json({history:current&&Date.now()-current.updatedAt<3600000?sanitizeHistory(current.turns):[]})});
 app.post('/api/chat/reset',(req,res)=>{delete req.session.chat;res.json({ok:true})});
 app.post('/api/chat',publicLimiter,async(req,res)=>{if(typeof req.body?.message!=='string'||!req.body.message.trim()||req.body.message.length>2000)throw problem(400,'Câu hỏi trống hoặc quá dài.');const current=req.session.chat;const history=current&&Date.now()-current.updatedAt<3600000?sanitizeHistory(current.turns):[];const message=req.body.message.trim();const answer=await consult(message,(await readContent(pool)).data,history,{engine:settings.chatEngine,url:settings.ollamaUrl,model:settings.chatEngine==='gemini'?settings.geminiModel:settings.ollamaModel,apiKey:settings.geminiApiKey,allowExternalAi:req.body.allowExternalAi===true,context:current&&Date.now()-current.updatedAt<3600000?current.context||{}:{}},settings.aiTransport||fetch);const {userTurns,...savedContext}=answer.context;req.session.chat={context:savedContext,turns:[...history,{role:'user',content:message},{role:'assistant',content:answer.answer}].slice(-16),updatedAt:Date.now()};const {context,...publicAnswer}=answer;res.json(publicAnswer)});
 app.get('/',(req,res)=>res.sendFile(path.join(root,'views/index.html')));
 app.use(async(req,res,next)=>{if(req.method!=='GET')return next();const page=resolvePublicPath(req.path);if(!page)return next();if(page.type==='detail'){const current=await readContent(pool);if(!current.data[page.group].some(row=>row.id===page.id))return res.status(404).sendFile(path.join(root,'views/errors/404.html'))}res.set('Cache-Control','no-store').sendFile(path.join(root,'views/index.html'))});
 app.get('/login',(req,res)=>req.session.admin?res.redirect('/admin'):res.sendFile(path.join(root,'views/login.html')));
 app.get('/admin',(req,res)=>req.session.admin?res.sendFile(path.join(root,'views/index.html')):res.redirect('/login'));
 app.get('/demo/500',(req,res,next)=>{if(!settings.demoErrors||!req.session.admin)return next();next(Error('Lỗi mô phỏng chỉ dùng khi demo local.'))});
 app.use((req,res,next)=>{if(req.path.startsWith('/api/'))return res.status(404).json({error:'API không tồn tại.'});res.status(404).sendFile(path.join(root,'views/errors/404.html'))});
 app.use((err,req,res,next)=>{if(res.headersSent)return next(err);const status=err.code==='LIMIT_FILE_SIZE'?413:err.status>=400&&err.status<600?err.status:500;const message=err.code==='LIMIT_FILE_SIZE'?'Ảnh vượt quá 2 MB.':status===500?'Máy chủ gặp lỗi. Vui lòng thử lại sau.':err.type==='entity.parse.failed'?'JSON không hợp lệ.':err.message;if(status>=500)console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}: ${err.message}`);if(req.path.startsWith('/api/'))return res.status(status).json({error:message});res.status(status).sendFile(path.join(root,'views/errors/500.html'))});
 return {app,store};
}
