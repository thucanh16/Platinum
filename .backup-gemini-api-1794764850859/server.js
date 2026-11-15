import {createApp} from './app.js';
import {createPool} from './db.js';
import {config} from './config.js';
const pool=createPool();
try{await pool.query('SELECT 1');const {app,store}=createApp(pool);const server=app.listen(config.port,config.host,()=>console.log(`Platinum local: http://${config.host}:${config.port}\nQuản trị: http://${config.host}:${config.port}/admin`));const shutdown=()=>server.close(async()=>{store.close();await pool.end();process.exit(0)});process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown)}catch(e){console.error('Không khởi động được website:',e.message,'\nKiểm tra MySQL, file .env và chạy npm run setup.');await pool.end();process.exitCode=1}
