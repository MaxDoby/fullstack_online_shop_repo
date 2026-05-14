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

	await prisma.product.deleteMany();
	await prisma.category.deleteMany();

	const categories = [...new Set(products.map((product)=>product.category))];

	for (const category of categories) {
		await prisma.category.create({
			data: {
				name: category,
			},
		});
	}

	for (const product of products) {
		const { category, ...productData } = product;
		await prisma.product.create({
      data: {
        ...productData,
		category: {
			connect: {
				name: category,
			},
		},
      },
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
