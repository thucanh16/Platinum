export const groups=['services','products','projects','process','values','community'];
export const companyKeys=['title','slogan','intro','about','vision','mission','ceo','tax','founded','phone','email','website','address','branch','logo'];
export function problem(status,message){return Object.assign(new Error(message),{status})}
const text=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
export function imagePath(v){return v===''||typeof v==='string'&&/^\/(uploads\/[\w-]+\.(png|jpg|webp)|images\/[\w-]+\.webp)$/.test(v)}
export function validateContent(data){
 if(!data||typeof data!=='object'||!data.company)throw problem(400,'Thiếu thông tin công ty.');
 for(const key of companyKeys){const value=data.company[key];if(typeof value!=='string'||value.length>(['intro','about','vision','mission'].includes(key)?10000:500))throw problem(400,'Thông tin công ty không hợp lệ: '+key);if(key!=='logo'&&!value.trim())throw problem(400,'Vui lòng điền đủ thông tin công ty.');}
 if(!imagePath(data.company.logo))throw problem(400,'Đường dẫn logo không hợp lệ.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.company.email))throw problem(400,'Email công ty không hợp lệ.');
 const ids=new Set();
 for(const group of groups){if(!Array.isArray(data[group])||data[group].length>100)throw problem(400,'Danh sách nội dung không hợp lệ.');
 for(const row of data[group]){if(!row||!text(row.id,100)||ids.has(row.id)||!text(row.title,200)||!text(row.description,5000)||!text(row.tag,100))throw problem(400,'Nội dung thiếu hoặc không hợp lệ.');ids.add(row.id);if(row.details!==undefined&&(typeof row.details!=='string'||row.details.length>5000))throw problem(400,'Chi tiết quá dài.');if(row.image!==undefined&&!imagePath(row.image))throw problem(400,'Ảnh không hợp lệ.');}}
}
export async function readContent(pool){
 const conn=await pool.getConnection();try{await conn.beginTransaction();const [[company]]=await conn.query('SELECT payload,revision FROM company_info WHERE id=1');if(!company)throw problem(503,'Database chưa có dữ liệu. Hãy chạy npm run setup.');
 const [items]=await conn.query('SELECT * FROM content_items ORDER BY group_key,sort_order');const data={company:typeof company.payload==='string'?JSON.parse(company.payload):company.payload};for(const key of groups)data[key]=[];
 for(const row of items)if(data[row.group_key])data[row.group_key].push({id:row.id,title:row.title,description:row.description,tag:row.tag,details:row.details,...(row.image_path?{image:row.image_path}:{})});await conn.commit();return{data,revision:company.revision};
 }catch(e){await conn.rollback();throw e}finally{conn.release()}
}
export async function saveContent(pool,data,revision){
 validateContent(data);if(!Number.isSafeInteger(revision)||revision<1)throw problem(400,'Phiên bản dữ liệu không hợp lệ.');
 const conn=await pool.getConnection();try{await conn.beginTransaction();const [[current]]=await conn.execute('SELECT revision FROM company_info WHERE id=1 FOR UPDATE');if(!current||current.revision!==revision)throw problem(409,'Nội dung vừa được cập nhật ở phiên khác. Hãy tải lại dữ liệu.');
 await conn.execute('UPDATE company_info SET payload=?,revision=revision+1 WHERE id=1',[JSON.stringify(data.company)]);
 await conn.query('DELETE FROM content_items');for(const group of groups)for(const [order,row]of data[group].entries())await conn.execute('INSERT INTO content_items (id,group_key,title,description,tag,details,image_path,sort_order) VALUES (?,?,?,?,?,?,?,?)',[row.id,group,row.title.trim(),row.description.trim(),row.tag.trim(),row.details||'',row.image||'',order]);
 await conn.commit();return revision+1;
 }catch(e){await conn.rollback();throw e}finally{conn.release()}
}
