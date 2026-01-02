const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Attempting to connect to database...');
        console.log('DATABASE_URL starts with:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'undefined');
        const products = await prisma.product.findMany({ take: 1 });
        console.log('Connection successful! Found products:', products.length);
    } catch (err) {
        console.error('DATABASE CONNECTION ERROR FULL:');
        console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    } finally {
        await prisma.$disconnect();
    }
}

test();
