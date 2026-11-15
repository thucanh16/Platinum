import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const config={
 port:Number(process.env.PORT||3000),host:process.env.HOST||'127.0.0.1',
 production:process.env.NODE_ENV==='production',
 db:{host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER||'root',password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME||'platinum_local',charset:'utf8mb4',connectionLimit:8,dateStrings:false},
 sessionSecret:process.env.SESSION_SECRET||'',
 demoErrors:process.env.ENABLE_DEMO_ERRORS==='true',
 chatEngine:process.env.CHAT_ENGINE||'consultant',
 ollamaUrl:process.env.OLLAMA_URL||'http://127.0.0.1:11434',
 ollamaModel:process.env.OLLAMA_MODEL||'qwen2.5:3b',
};
