import { Injectable } from '@nestjs/common';
import type { RawScrapedProduct } from '../interfaces/raw-scraped-product.interface';
import type { NormalizedProduct } from '../interfaces/normalized-product.interface';
import { parsePriceText } from '../utils/scraper-common.utils';

@Injectable()
export class ProductScrapeNormalizer {
  public normalize(rawProduct: RawScrapedProduct): NormalizedProduct {
    const imageUrls = rawProduct.imageUrls ?? [];
    const thumbnail = imageUrls[0] ?? '';

    return {
      title: rawProduct.title.trim(),
      description: rawProduct.description?.trim() ?? rawProduct.title.trim(),
      price:
        rawProduct.price ?? parsePriceText(rawProduct.priceText ?? '') ?? 0,
      stock: 0,
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
}
