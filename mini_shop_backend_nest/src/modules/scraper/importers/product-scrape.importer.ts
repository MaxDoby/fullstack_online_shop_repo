import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { NormalizedProduct } from '../interfaces/normalized-product.interface';

@Injectable()
export class ProductScrapeImporter {
  public constructor(private readonly prisma: PrismaService) {}

  public async importProduct(product: NormalizedProduct, scrapeJobId: number) {
    const category = await this.prisma.category.upsert({
      where: { name: product.categoryName },
      update: {},
      create: { name: product.categoryName },
    });

    const manufacturer = product.manufacturerName
      ? await this.prisma.manufacturer.upsert({
          where: { name: product.manufacturerName },
          update: {},
          create: {
            name: product.manufacturerName,
            slug: this.createSlug(product.manufacturerName),
          },
        })
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

    return savedProduct;
  }

  private createSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
