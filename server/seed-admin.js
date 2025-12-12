require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
    try {
        const hashedPassword = await bcrypt.hash('yaa3478edna', 10);
        const admin = await prisma.admin.upsert({
            where: { username: 'Edna' },
            update: {
                password: hashedPassword,
            },
            create: {
                username: 'Edna',
                password: hashedPassword,
            },
        });
        console.log('Admin user created/found:', admin);
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
