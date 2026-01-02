const dns = require('dns');
const { Client } = require('pg');
require('dotenv').config();

const host = 'ep-round-glade-a438c8la.us-east-1.aws.neon.tech';

dns.lookup(host, (err, address, family) => {
    console.log('DNS lookup for host:', host);
    if (err) {
        console.error('DNS LOOKUP ERROR:', err);
        return;
    }
    console.log('Address:', address, 'Family: IPv', family);

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Try with relaxed SSL first for debug
    });

    client.connect()
        .then(() => {
            console.log('Successfully connected via direct pg Client with relaxed SSL!');
            return client.query('SELECT NOW()');
        })
        .then(res => {
            console.log('Query result:', res.rows[0]);
            return client.end();
        })
        .catch(connErr => {
            console.error('PG CONNECTION ERROR:', connErr);
        });
});
