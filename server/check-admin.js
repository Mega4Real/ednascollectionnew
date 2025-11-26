require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdmin() {
    try {
        console.log('Checking for admin users...');
        const admins = await prisma.admin.findMany();
        console.log('Found', admins.length, 'admin(s):');
        admins.forEach(admin => {
            console.log('- Username:', admin.username);
            console.log('  ID:', admin.id);
            console.log('  Password hash:', admin.password.substring(0, 20) + '...');
        });
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdmin();
