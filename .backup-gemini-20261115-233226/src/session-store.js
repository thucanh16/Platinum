import session from 'express-session';
export class MysqlSessionStore extends session.Store{
 constructor(pool){super();this.pool=pool;this.timer=setInterval(()=>pool.execute('DELETE FROM sessions WHERE expires_at < ?',[Date.now()]).catch(()=>{}),600000);this.timer.unref()}
 get(id,cb){this.pool.execute('SELECT data FROM sessions WHERE session_id=? AND expires_at>?',[id,Date.now()]).then(([[row]])=>cb(null,row?(typeof row.data==='string'?JSON.parse(row.data):row.data):null)).catch(cb)}
 set(id,value,cb=()=>{}){const expires=value.cookie?.expires?new Date(value.cookie.expires).getTime():Date.now()+28800000;this.pool.execute('INSERT INTO sessions(session_id,data,expires_at) VALUES (?,?,?) ON DUPLICATE KEY UPDATE data=VALUES(data),expires_at=VALUES(expires_at)',[id,JSON.stringify(value),expires]).then(()=>cb()).catch(cb)}
 destroy(id,cb=()=>{}){this.pool.execute('DELETE FROM sessions WHERE session_id=?',[id]).then(()=>cb()).catch(cb)}
 touch(id,value,cb=()=>{}){this.pool.execute('UPDATE sessions SET expires_at=? WHERE session_id=?',[new Date(value.cookie.expires).getTime(),id]).then(()=>cb()).catch(cb)}
 close(){clearInterval(this.timer)}
}
