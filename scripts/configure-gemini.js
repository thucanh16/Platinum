import {readFile,writeFile,rename,unlink} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {root} from '../src/config.js';
import {ask,secret} from './prompt.js';
import {updateGeminiEnv} from './gemini-env.js';
import {defaultGeminiModel} from '../src/gemini-ai.js';

const destination=path.join(root,'.env');
const temporary=path.join(root,'.env.gemini-tmp-'+randomUUID());
try {
  const original=await readFile(destination,'utf8');
  console.log('Tạo key tại https://aistudio.google.com/apikey. Không gửi key qua chat.');
  const model=(await ask('Mô hình ['+defaultGeminiModel+']: ')).trim()||defaultGeminiModel;
  const key=(await secret('Dán Gemini API key rồi Enter (không hiển thị): ')).trim();
  const updated=updateGeminiEnv(original,key,model);
  await writeFile(temporary,updated,{mode:0o600,flag:'wx'});
  await rename(temporary,destination);
  console.log('Đã lưu cấu hình Gemini vào .env; giữ nguyên cấu hình MySQL và tài khoản.');
  console.log('Khởi động lại npm start. Vào Quản trị → Kiểm tra kết nối Gemini.');
} catch(error) {
  console.error(error.code==='ENOENT'?'Chưa có .env của website. Mở đúng thư mục đã cài đặt trước.':error.message);
  process.exitCode=1;
} finally {await unlink(temporary).catch(()=>{});}
