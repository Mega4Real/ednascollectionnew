const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);

    try {
        const admin = await prisma.admin.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password: adminPassword
            }
        });
        console.log('Admin user created:', admin.username);
    } catch (e) {
        console.error('Error creating admin:', e);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
