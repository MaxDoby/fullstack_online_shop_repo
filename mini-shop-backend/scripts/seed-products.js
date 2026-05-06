const dotenv = require('dotenv/config')
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('DATABASE_URL lipseste. Seteaza variabila de mediu inainte sa rulezi seed-ul.');
}


const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const seedFilePath = path.join(__dirname, 'products-seed-data.json');

const main = async () => {
	const rawFile = fs.readFileSync(seedFilePath, 'utf8');
	const products = JSON.parse(rawFile);

	const existingProducts = await prisma.product.findMany();

	for (const product of existingProducts) {
		await prisma.product.delete({
			where: {
				id: product.id,
			},
		});
	}

	for (const product of products) {
		await prisma.product.create({
			data: product,
		});
	}

	console.log(`Seed completed. Inserted ${products.length} products.`);
};

main()
	.catch((error) => {
		console.error('Seed failed:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
