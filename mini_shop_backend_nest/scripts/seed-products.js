require('dotenv/config');

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL lipseste. Seteaza variabila de mediu inainte sa rulezi seed-ul.',
  );
}

const requiredS3Env = [
  'S3_ENDPOINT',
  'S3_REGION',
  'S3_ACCESS_KEY',
  'S3_SECRET_KEY',
  'S3_BUCKET',
];

for (const envName of requiredS3Env) {
  if (!process.env[envName]) {
    throw new Error(
      `${envName} lipseste. Seed-ul are nevoie de storage pentru ProductImage.`,
    );
  }
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
});

const bucketName = process.env.S3_BUCKET;

const seedFilePath = path.join(__dirname, 'products-seed-data.json');
const frontendPublicPath = path.resolve(
  __dirname,
  '../../mini_shop_frontend/public',
);

const getMimeType = (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.webp') return 'image/webp';
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.png') return 'image/png';

  return 'application/octet-stream';
};

const uploadSeedImage = async (storageKey, buffer, mimeType) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: storageKey,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);
};

const cleanDemoData = async () => {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  await prisma.productImage.deleteMany();
  await prisma.productSource.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.productSpecificationGroup.deleteMany();
  await prisma.productVariant.deleteMany();

  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
};

const main = async () => {
  const rawFile = fs.readFileSync(seedFilePath, 'utf8');
  const products = JSON.parse(rawFile);

  await cleanDemoData();

  const categories = [...new Set(products.map((product) => product.category))];

  for (const category of categories) {
    await prisma.category.create({
      data: {
        name: category,
      },
    });
  }

  for (const product of products) {
    const { category, thumbnail, ...productData } = product;

    const createdProduct = await prisma.product.create({
      data: {
        ...productData,
        thumbnail,
        category: {
          connect: {
            name: category,
          },
        },
      },
    });

    const imageRelativePath = thumbnail.replace(/^\/+/, '');
    const imagePath = path.join(frontendPublicPath, imageRelativePath);

    if (!fs.existsSync(imagePath)) {
      console.warn(
        `Imagine lipsa pentru produsul ${createdProduct.title}: ${imagePath}`,
      );
      continue;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const imageMetadata = await sharp(imageBuffer).metadata();

    if (!imageMetadata.width || !imageMetadata.height) {
      console.warn(
        `Metadata invalida pentru produsul ${createdProduct.title}: ${imagePath}`,
      );
      continue;
    }

    const originalName = path.basename(imagePath);
    const mimeType = getMimeType(imagePath);
    const storageKey = `products/seed/${originalName}`;

    await uploadSeedImage(storageKey, imageBuffer, mimeType);

    await prisma.productImage.create({
      data: {
        productId: createdProduct.id,
        storageKey,
        originalName,
        mimeType,
        size: imageBuffer.length,
        width: imageMetadata.width,
        height: imageMetadata.height,
        isPrimary: true,
      },
    });
  }

  console.log(
    `Seed completed. Inserted ${products.length} products with primary images.`,
  );
};

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
