import { Pool } from 'pg';
import { config } from 'dotenv';
config();

// Parse DATABASE_URL into components
let poolConfig = {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    family: 4  // Force IPv4
};

if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
const ipv4 = '64.227.149.75'; 
poolConfig = {
    ...poolConfig,
    user: url.username,
    password: url.password,
    host: ipv4,               // Hardcoded IPv4
    port: parseInt(url.port || '5432', 10),
    database: url.pathname.substring(1),
};
console.log(`Connecting to database at IPv4: ${ipv4}`);
} else {
    // Fallback to individual variables (if needed)
    poolConfig = {
        ...poolConfig,
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    };
    console.log('Using individual DB_* variables');
}

const pool = new Pool(poolConfig);

export default pool;