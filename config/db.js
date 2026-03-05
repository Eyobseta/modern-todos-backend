import { Pool } from 'pg';
import { config } from 'dotenv';
config();

// Parse DATABASE_URL into components
let poolConfig = {
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    family: 4  // Force IPv4
};

if (process.env.DATABASE_URL) {
    // Parse the connection string
    const url = new URL(process.env.DATABASE_URL);
    poolConfig = {
        ...poolConfig,
        user: url.username,
        password: url.password,
        host: '127.0.0.53',
        port: parseInt(url.port || '5432', 10),
        database: url.pathname.substring(1), // Remove leading '/'
    };
     console.log(`Connecting to database at IP: 123.45.67.89 (forced IPv4)`);
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