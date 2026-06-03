import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import type { RawScrapedProduct } from '../../interfaces/raw-scraped-product.interface';

type JsonLdRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonLdRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

@Injectable()
export class UltraProductParser {
  public parse(html: string, sourceUrl: string): RawScrapedProduct | null {
    const $ = cheerio.load(html);
    const productJsonLd = this.findJsonLdByType($, 'Product');
    const breadcrumbJsonLd = this.findJsonLdByType($, 'BreadcrumbList');

    const title =
      this.getStringField(productJsonLd, 'name') ?? $('h1').first().text();
    const normalizedTitle = this.normalizeText(title);

    if (!normalizedTitle) return null;

    const description =
      this.getStringField(productJsonLd, 'description') ?? normalizedTitle;

    const price = this.getPrice(productJsonLd);
    const manufacturerName = this.getBrandName(productJsonLd);
    const categoryPath = this.getCategoryPath(breadcrumbJsonLd);
    const imageUrls = this.getImageUrls(productJsonLd);

    return {
      title: normalizedTitle,
      sourceUrl,
      sourceWebsite: 'ultra.md',
      price,
      priceText: price ? `${price}` : undefined,
      manufacturerName,
      categoryPath,
      description: this.normalizeText(description),
      imageUrls,
      externalProductCode: this.getStringField(productJsonLd, 'sku'),
      externalArticle: this.getStringField(productJsonLd, 'mpn'),
    };
  }

  private findJsonLdByType(
    $: CheerioAPI,
    expectedType: string,
  ): JsonLdRecord | undefined {
    const scripts = $('script[type="application/ld+json"]').toArray();

    for (const script of scripts) {
      const scriptContent = $(script).text().trim();

      if (!scriptContent) continue;

      try {
        const parsed: unknown = JSON.parse(scriptContent);
        const records: unknown[] = Array.isArray(parsed) ? parsed : [parsed];

        const matchedRecord = records.find((record) => {
          if (!isRecord(record)) return false;

          return this.hasJsonLdType(record, expectedType);
        });

        if (isRecord(matchedRecord)) return matchedRecord;
      } catch {
        continue;
      }
    }

    return undefined;
  }

  private hasJsonLdType(record: JsonLdRecord, expectedType: string): boolean {
    const type = record['@type'];

    if (typeof type === 'string') return type === expectedType;

    if (Array.isArray(type)) {
      return type.some((item) => item === expectedType);
    }

    return false;
  }

  private getStringField(
    record: JsonLdRecord | undefined,
    fieldName: string,
  ): string | undefined {
    const value = record?.[fieldName];

    return typeof value === 'string' ? this.normalizeText(value) : undefined;
  }

  private getPrice(productJsonLd?: JsonLdRecord): number | undefined {
    const offers = productJsonLd?.offers;

    if (!isRecord(offers)) return undefined;

    const price = offers.price;

    if (typeof price === 'string' || typeof price === 'number') {
      const numericPrice = Number(price);

      return Number.isFinite(numericPrice) ? numericPrice : undefined;
    }

    return undefined;
  }

  private getBrandName(productJsonLd?: JsonLdRecord): string | undefined {
    const brand = productJsonLd?.brand;

    if (!isRecord(brand)) return undefined;

    const name = brand.name;

    return typeof name === 'string' ? this.normalizeText(name) : undefined;
  }

  private getCategoryPath(breadcrumbJsonLd?: JsonLdRecord): string[] {
    const itemListElement = breadcrumbJsonLd?.itemListElement;

    if (!Array.isArray(itemListElement)) return ['Uncategorized'];

    const categories = itemListElement
      .map((item) => {
        if (!isRecord(item)) return null;

        const name = item.name;

        return typeof name === 'string' ? this.normalizeText(name) : null;
      })
      .filter((name): name is string => Boolean(name));

    return categories.length > 0 ? categories : ['Uncategorized'];
  }

  private getImageUrls(productJsonLd?: JsonLdRecord): string[] {
    const images = productJsonLd?.image;

    if (!Array.isArray(images)) return [];

    return [
      ...new Set(
        images.filter((image): image is string => {
          return typeof image === 'string' && image.startsWith('http');
        }),
      ),
    ];
  }

  private normalizeText(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }
}
