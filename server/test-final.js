const { Client } = require('pg');
require('dotenv').config();

async function test() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 10000,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Final check: Connecting with 10s timeout...');
        const start = Date.now();
        await client.connect();
        console.log('CONNECTED in', Date.now() - start, 'ms');
        const res = await client.query('SELECT current_database()');
        console.log('Result:', res.rows[0]);
    } catch (err) {
        console.error('TIMEOUT OR CONNECTION ERROR:');
        console.error('Code:', err.code);
        console.error('Message:', err.message);
    } finally {
        await client.end();
    }
}

test();
