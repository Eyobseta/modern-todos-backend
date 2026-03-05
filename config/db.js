import { Pool } from 'pg';
import { config } from 'dotenv';
config();

// Log the host being used (sanitized)
if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`Connecting to database at host: ${url.hostname}`);
} else {
    console.log('DATABASE_URL not set, falling back to individual parameters');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    family: 4   // 👈 FORCE IPv4
});

export default pool;