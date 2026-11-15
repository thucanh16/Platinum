import {seed} from '../database/seed.js';
import mysql from 'mysql2';
import {writeFileSync} from 'node:fs';
import {groups} from '../src/content.js';
seed.company.logo='';
let sql='-- Dữ liệu ban đầu. Chỉ nhập vào database mới; không dùng để ghi đè nội dung đã sửa.\n';
sql+='INSERT INTO company_info(id,payload,revision) VALUES(1,'+mysql.escape(JSON.stringify(seed.company))+',1);\n';
for(const group of groups)for(const [order,row]of seed[group].entries())sql+='INSERT INTO content_items(id,group_key,title,description,tag,details,image_path,sort_order) VALUES('+[row.id,group,row.title,row.description,row.tag,row.details||'','',order].map(mysql.escape).join(',')+');\n';
writeFileSync('database/seed.sql',sql);
