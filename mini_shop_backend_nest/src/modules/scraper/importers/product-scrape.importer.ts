import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { NormalizedProduct } from '../interfaces/normalized-product.interface';
import { ProductMetadataScrapeImporter } from './product-metadata-scrape.importer';
import { ProductImageScrapeImporter } from './product-image-scrape.importer';
import { SCRAPED_CATEGORY_MAP } from '../constants/scraped-category-map';

export interface ProductScrapeImportResult {
  productId: number;
  action: 'created' | 'updated';
}

type PrismaTransactionClient = Prisma.TransactionClient;

@Injectable()
export class ProductScrapeImporter {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly productMetadataScrapeImporter: ProductMetadataScrapeImporter,
    private readonly productImageScrapeImporter: ProductImageScrapeImporter,
  ) {}

  public async importProduct(
    product: NormalizedProduct,
    scrapeJobId: number,
  ): Promise<ProductScrapeImportResult> {
    const importResult = await this.prisma.$transaction(async (tx) => {
      const categoryName = this.getExistingCategoryName(product.categoryName);

      const category = await tx.category.findUnique({
        where: { name: categoryName },
      });

      if (!category) {
        throw new Error(`Category "${categoryName}" does not exist.`);
      }

      const manufacturer = product.manufacturerName
        ? await this.findOrCreateManufacturer(product.manufacturerName, tx)
        : null;

      const existingSource = await tx.productSource.findUnique({
        where: {
          sourceWebsite_sourceUrl: {
            sourceWebsite: product.sourceWebsite,
            sourceUrl: product.sourceUrl,
          },
        },
      });

      const productData = {
        title: product.title,
        description: product.description,
        price: product.price,
        stock: product.stock,
        thumbnail: product.thumbnail,
        categoryId: category.id,
        manufacturerId: manufacturer?.id,
        deletedAt: null,
      };

      const savedProduct = existingSource
        ? await tx.product.update({
            where: { id: existingSource.productId },
            data: productData,
          })
        : await tx.product.create({
            data: productData,
          });

      await tx.productSource.upsert({
        where: {
          sourceWebsite_sourceUrl: {
            sourceWebsite: product.sourceWebsite,
            sourceUrl: product.sourceUrl,
          },
        },
        update: {
          scrapeJobId,
          externalId: product.externalId,
          externalProductCode: product.externalProductCode,
          externalArticle: product.externalArticle,
          externalHash: product.externalHash,
          lastScrapedAt: new Date(),
        },
        create: {
          productId: savedProduct.id,
          scrapeJobId,
          sourceWebsite: product.sourceWebsite,
          sourceUrl: product.sourceUrl,
          externalId: product.externalId,
          externalProductCode: product.externalProductCode,
          externalArticle: product.externalArticle,
          externalHash: product.externalHash,
        },
      });

      await this.productMetadataScrapeImporter.importMetadata(
        savedProduct.id,
        product,
        tx,
      );

      return {
        productId: savedProduct.id,
        action: existingSource ? ('updated' as const) : ('created' as const),
      };
    });

    await this.productImageScrapeImporter.importProductImages(
      importResult.productId,
      product.images,
    );

    return importResult;
  }

  private getExistingCategoryName(scrapedCategoryName: string): string {
    const normalizedCategoryName = scrapedCategoryName.trim().toLowerCase();

    return SCRAPED_CATEGORY_MAP[normalizedCategoryName] ?? scrapedCategoryName;
  }

  private async findOrCreateManufacturer(
    manufacturerName: string,
    prismaClient: PrismaTransactionClient,
  ) {
    const normalizedName = this.normalizeManufacturerName(manufacturerName);
    const slug = this.createSlug(normalizedName);

    const existingManufacturer = await prismaClient.manufacturer.findFirst({
      where: {
        OR: [{ name: normalizedName }, { slug }],
      },
    });

    if (existingManufacturer) return existingManufacturer;

    return prismaClient.manufacturer.create({
      data: {
        name: normalizedName,
        slug,
      },
    });
  }

  private normalizeManufacturerName(value: string): string {
    return value.trim().replace(/[.]+$/g, '').trim();
  }

  private createSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
