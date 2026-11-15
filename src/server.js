import {createApp} from './app.js';
import {createPool} from './db.js';
import {config,root} from './config.js';
import {listen} from './listen.js';
const pool=createPool();
let store;
try {
 await pool.query('SELECT 1');
 const instance=createApp(pool);store=instance.store;
 const server=await listen(instance.app,config.port,config.host);
 console.log(`Platinum local: http://${config.host}:${config.port}\nQuản trị: http://${config.host}:${config.port}/admin\nThư mục mã nguồn: ${root}`);
 console.log('Chế độ trợ lý: '+config.chatEngine+(config.chatEngine==='gemini'?(config.geminiApiKey.trim()?' · đã cấu hình key; cần kiểm tra kết nối':' · chưa có API key'):''));
 const shutdown=()=>server.close(async()=>{store.close();await pool.end();process.exit(0)});
 process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
} catch(error) {
 store?.close();
 if(error.code==='EADDRINUSE')console.error(`Cổng ${config.port} đang được một chương trình khác sử dụng. Website mới chưa khởi động. Dừng phiên website cũ hoặc chọn PORT khác rồi chạy lại.`);
 else console.error('Không khởi động được website:',error.message,'\nKiểm tra kết nối MySQL và cấu hình .env.');
 await pool.end();process.exitCode=1;
}
