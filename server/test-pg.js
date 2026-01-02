const { Client } = require('pg');
require('dotenv').config();

async function test() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log('Connecting via pg driver...');
        await client.connect();
        console.log('Successfully connected via pg driver!');
        const res = await client.query('SELECT NOW()');
        console.log('Query result:', res.rows[0]);
    } catch (err) {
        console.error('PG DRIVER ERROR:');
        console.error(err);
    } finally {
        await client.end();
    }
}

test();
