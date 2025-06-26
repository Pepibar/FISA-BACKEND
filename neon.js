import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();
console.log('dotenv cargado, JWT_SECRET:', process.env.JWT_SECRET);
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;