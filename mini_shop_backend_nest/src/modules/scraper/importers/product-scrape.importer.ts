import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { NormalizedProduct } from '../interfaces/normalized-product.interface';
import { ProductMetadataScrapeImporter } from './product-metadata-scrape.importer';
import { ProductImageScrapeImporter } from './product-image-scrape.importer';
import { SCRAPED_CATEGORY_MAP } from '../constants/scraped-category-map';

export interface ProductScrapeImportResult {
  productId: number;
  action: 'created' | 'updated';
}

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
    const categoryName = this.getExistingCategoryName(product.categoryName);

    const category = await this.prisma.category.findUnique({
      where: { name: categoryName },
    });

    if (!category) {
      throw new Error(`Category "${categoryName}" does not exist.`);
    }

    const manufacturer = product.manufacturerName
      ? await this.findOrCreateManufacturer(product.manufacturerName)
      : null;

    const existingSource = await this.prisma.productSource.findUnique({
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
      ? await this.prisma.product.update({
          where: { id: existingSource.productId },
          data: productData,
        })
      : await this.prisma.product.create({
          data: productData,
        });

    await this.prisma.productSource.upsert({
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
    );

    await this.productImageScrapeImporter.importProductImages(
      savedProduct.id,
      product.images,
    );

    return {
      productId: savedProduct.id,
      action: existingSource ? 'updated' : 'created',
    };
  }

  private getExistingCategoryName(scrapedCategoryName: string): string {
    const normalizedCategoryName = scrapedCategoryName.trim().toLowerCase();

    return SCRAPED_CATEGORY_MAP[normalizedCategoryName] ?? scrapedCategoryName;
  }

  private async findOrCreateManufacturer(manufacturerName: string) {
    const normalizedName = this.normalizeManufacturerName(manufacturerName);
    const slug = this.createSlug(normalizedName);

    const existingManufacturer = await this.prisma.manufacturer.findFirst({
      where: {
        OR: [{ name: normalizedName }, { slug }],
      },
    });

    if (existingManufacturer) return existingManufacturer;

    return this.prisma.manufacturer.create({
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
