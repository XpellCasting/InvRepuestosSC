import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql-db-local',
  user: process.env.DB_USER || 'inv_user',
  password: process.env.DB_PASSWORD || 'inv_password',
  database: process.env.DB_NAME || 'inventariado',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
