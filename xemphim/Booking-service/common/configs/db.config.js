import pg from 'pg';
const {Pool} = pg;
import * as dotenv from 'dotenv';
dotenv.config();

console.log("Checking DB Config:");
console.log("   - URL:", process.env.DATABASE_URL ? "Đã tìm thấy" : "KHÔNG THẤY");
console.log("   - Schema:", process.env.DB_SCHEMA);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) =>{
    console.error('Lỗi kết nối PostgreSQL bất ngờ:', err);
    process.exit(-1);
});

pool.on('connect', (client) =>{
    client.query(`SET search_path TO ${process.env.DB_SCHEMA}, public`);
});

export default pool;