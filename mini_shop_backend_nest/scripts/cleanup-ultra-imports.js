require('dotenv/config');

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const sourceWebsite = 'ultra.md';
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL lipseste. Seteaza variabila de mediu inainte sa rulezi cleanup-ul.',
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const main = async () => {
  const productIds = (
    await prisma.productSource.findMany({
      where: { sourceWebsite },
      select: { productId: true },
      distinct: ['productId'],
    })
  ).map((item) => item.productId);

  if (productIds.length === 0) {
    console.log(`Nu exista produse importate din ${sourceWebsite}.`);
    return;
  }

  const result = await prisma.$transaction(async (tx) => {
    const deletedSpecifications = await tx.productSpecification.deleteMany({
      where: { group: { productId: { in: productIds } } },
    });

    const deletedSpecificationGroups =
      await tx.productSpecificationGroup.deleteMany({
        where: { productId: { in: productIds } },
      });

    const deletedVariants = await tx.productVariant.deleteMany({
      where: { productId: { in: productIds } },
    });

    const deletedImages = await tx.productImage.deleteMany({
      where: { productId: { in: productIds } },
    });

    const deletedSources = await tx.productSource.deleteMany({
      where: { sourceWebsite },
    });

    const deletedProducts = await tx.product.deleteMany({
      where: { id: { in: productIds } },
    });

    const deletedJobs = await tx.scrapeJob.deleteMany({
      where: { sourceWebsite },
    });

    return {
      productsFound: productIds.length,
      deletedSpecifications: deletedSpecifications.count,
      deletedSpecificationGroups: deletedSpecificationGroups.count,
      deletedVariants: deletedVariants.count,
      deletedImages: deletedImages.count,
      deletedSources: deletedSources.count,
      deletedProducts: deletedProducts.count,
      deletedJobs: deletedJobs.count,
    };
  });

  console.log(`Cleanup ${sourceWebsite} completed:`);
  console.table(result);
};

main()
  .catch((error) => {
    console.error(`Cleanup ${sourceWebsite} failed:`, error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  // node -r dotenv/config - <<'NODE'
// const { PrismaClient } = require('@prisma/client');
// const { PrismaPg } = require('@prisma/adapter-pg');

// const prisma = new PrismaClient({
//   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
// });

// (async () => {
//   const result = await prisma.category.deleteMany({
//     where: {
//       name: {
//         in: ['Boxe Portabile', 'Aparate încălzire aer', 'Căști'],
//       },
//       products: {
//         none: {},
//       },
//     },
//   });

//   console.log(`Categorii goale sterse: ${result.count}`);
// })().finally(() => prisma.$disconnect());
// NODE