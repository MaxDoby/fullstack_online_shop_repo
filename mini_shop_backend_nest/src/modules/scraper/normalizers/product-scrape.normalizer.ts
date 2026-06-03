import { Injectable } from '@nestjs/common';
import type { RawScrapedProduct } from '../interfaces/raw-scraped-product.interface';
import type { NormalizedProduct } from '../interfaces/normalized-product.interface';

@Injectable()
export class ProductScrapeNormalizer {
  public normalize(rawProduct: RawScrapedProduct): NormalizedProduct {
    const imageUrls = rawProduct.imageUrls ?? [];
    const categoryName =
      rawProduct.categoryPath?.[1] ??
      rawProduct.categoryPath?.[0] ??
      'Uncategorized';
    const thumbnail = imageUrls[0] ?? '';

    return {
      title: rawProduct.title.trim(),
      description: rawProduct.description?.trim() ?? rawProduct.title.trim(),
      price: rawProduct.price ?? this.parsePrice(rawProduct.priceText),
      stock: 0,
      categoryName,
      thumbnail,
      manufacturerName: rawProduct.manufacturerName,
      sourceWebsite: rawProduct.sourceWebsite,
      sourceUrl: rawProduct.sourceUrl,
      externalId: rawProduct.externalId,
      externalProductCode: rawProduct.externalProductCode,
      externalArticle: rawProduct.externalArticle,
      images: imageUrls.map((url, index) => ({
        url,
        originalName: url.split('/').pop(),
        isPrimary: index === 0,
      })),
      variants: rawProduct.variants ?? [],
      specificationGroups: rawProduct.specificationGroups ?? [],
    };
  }

  private parsePrice(priceText?: string): number {
    if (!priceText) return 0;

    const normalizedPrice = priceText.replace(/[^\d.,]/g, '').replace(',', '.');

    return Number(normalizedPrice) || 0;
  }
}
