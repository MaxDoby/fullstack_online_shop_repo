import { Injectable } from '@nestjs/common';
import type { RawScrapedProduct } from '../interfaces/raw-scraped-product.interface';
import type { NormalizedProduct } from '../interfaces/normalized-product.interface';
import { parsePriceText } from '../utils/scraper-common.utils';

@Injectable()
export class ProductScrapeNormalizer {
  public normalize(rawProduct: RawScrapedProduct): NormalizedProduct {
    const imageUrls = rawProduct.imageUrls ?? [];
    const thumbnail = imageUrls[0] ?? '';
    const normalizedTitle = this.normalizeTitleAndDescription(
      rawProduct.title,
      rawProduct.description,
    );

    return {
      title: normalizedTitle.title,
      description: normalizedTitle.description,
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

  private normalizeTitleAndDescription(
    rawTitle: string,
    rawDescription?: string,
  ): { title: string; description: string } {
    const title = rawTitle.trim();
    const description = rawDescription?.trim();
    const titleParts = title
      .split('|')
      .map((part) => part.trim())
      .filter(Boolean);

    if (titleParts.length < 2) {
      return {
        title,
        description: description ?? title,
      };
    }

    const firstTitlePart = titleParts[0];
    const specs = titleParts.slice(1).join(' | ');

    return {
      title: firstTitlePart,
      description: specs || description || firstTitlePart,
    };
  }
}
