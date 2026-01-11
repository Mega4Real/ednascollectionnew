const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkColumns() {
    try {
        const result = await prisma.$queryRaw`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Order'
        `;
        console.log('Columns in Order table:');
        console.table(result);
    } catch (error) {
        console.error('Error checking columns:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkColumns();
