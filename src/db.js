import mysql from 'mysql2/promise';
import {config} from './config.js';
export function createPool(options={}){return mysql.createPool({...config.db,...options})}
