const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const dataPath = path.join(__dirname, '../../client/src/data/dresses.js');
    const fileContent = fs.readFileSync(dataPath, 'utf8');

    // Extract the array content
    const match = fileContent.match(/const dresses = (\[[\s\S]*?\]);/);
    let dresses = [];

    if (match) {
        // This is a bit hacky but works for the specific format
        try {
            // We need to make it valid JSON or evaluate it
            // Since it uses keys without quotes, we can't just JSON.parse
            // We'll use eval in a safe-ish way
            dresses = eval(match[1]);
        } catch (e) {
            console.error('Error parsing data:', e);
            return;
        }
    } else {
        // Try finding export default
        const match2 = fileContent.match(/let dresses = (\[[\s\S]*?\]);/);
        if (match2) {
            dresses = eval(match2[1]);
        } else {
            console.error('Could not find dresses array');
            return;
        }
    }

    console.log(`Found ${dresses.length} dresses to migrate`);

    for (const dress of dresses) {
        await prisma.product.create({
            data: {
                imageUrl: dress.image,
                price: parseFloat(dress.price),
                sizes: dress.sizes,
                // Preserve ID if possible, but Prisma autoincrements. 
                // We can force ID if we turn off autoincrement or just let it map
                // For simplicity, let's let Prisma generate new IDs or use the existing ones if we change schema
                // But schema has @default(autoincrement())
                // We can pass ID if we want to keep them consistent
                id: dress.id
            }
        });
    }

    console.log('Migration completed');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
