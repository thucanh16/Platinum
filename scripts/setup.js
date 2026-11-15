import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import {randomBytes} from 'node:crypto';
import {root,config} from '../src/config.js';
import {createAdmin} from './create-admin.js';
let conn;
try{
 const envPath=path.join(root,'.env');let content;try{content=await fs.readFile(envPath,'utf8')}catch{content=await fs.readFile(path.join(root,'.env.example'),'utf8')}
 if(!config.sessionSecret||config.sessionSecret.length<32){const value=randomBytes(48).toString('hex');content=/^SESSION_SECRET=.*$/m.test(content)?content.replace(/^SESSION_SECRET=.*$/m,'SESSION_SECRET='+value):content+'\nSESSION_SECRET='+value+'\n';await fs.writeFile(envPath,content,{mode:0o600})}
 const database=config.db.database;if(!/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(database))throw Error('DB_NAME không hợp lệ.');
 const {database:ignored,connectionLimit,...db}=config.db;conn=await mysql.createConnection({...db,multipleStatements:true});await conn.query('CREATE DATABASE IF NOT EXISTS `'+database+'` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');await conn.query('USE `'+database+'`');await conn.query(await fs.readFile(path.join(root,'database/schema.sql'),'utf8'));
 const [[existing]]=await conn.query('SELECT COUNT(*) AS total FROM company_info');if(!existing.total){await conn.beginTransaction();try{await conn.query(await fs.readFile(path.join(root,'database/seed.sql'),'utf8'));await conn.commit()}catch(e){await conn.rollback();throw e}console.log('Đã nhập hồ sơ công ty và dữ liệu mẫu.')}else console.log('Giữ nguyên dữ liệu đang có; không nạp lại dữ liệu mẫu.');
 const [[admins]]=await conn.query('SELECT COUNT(*) AS total FROM admins');if(!admins.total)await createAdmin(conn);else console.log('Đã có tài khoản quản trị.');
 console.log('Cài đặt hoàn tất. Chạy npm start rồi mở http://localhost:'+config.port);
}catch(e){console.error('Cài đặt thất bại:',e.message,'\nKiểm tra MySQL và thông tin DB_* trong .env.');process.exitCode=1}finally{if(conn)await conn.end()}
