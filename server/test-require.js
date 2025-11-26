try {
    console.log('Requiring @prisma/client...');
    const { PrismaClient } = require('@prisma/client');
    console.log('Success!');
    const prisma = new PrismaClient();
    console.log('Instance created');
} catch (e) {
    console.error('Error:', e);
    console.log('Require paths:', module.paths);
}
