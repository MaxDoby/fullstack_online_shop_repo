import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';
import type { RawScrapedProduct } from '../interfaces/raw-scraped-product.interface';
import { parsePriceText } from '../utils/scraper-common.utils';

type JsonLdRecord = Record<string, unknown>;

const minimumProductScore = 25;

const isRecord = (value: unknown): value is JsonLdRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

@Injectable()
export class GenericProductExtractor {
  public extract(html: string, sourceUrl: string): RawScrapedProduct | null {
    const $ = cheerio.load(html);
    const productJsonLd = this.findJsonLdByType($, 'Product');
    const breadcrumbJsonLd = this.findJsonLdByType($, 'BreadcrumbList');

    const title = this.extractTitle($, productJsonLd);
    const price = this.extractPrice($, productJsonLd);
    const imageUrls = this.extractImageUrls($, productJsonLd, sourceUrl);
    const score = this.calculateProductScore({
      hasProductJsonLd: Boolean(productJsonLd),
      hasTitle: Boolean(title),
      hasPrice: typeof price === 'number',
      hasImages: imageUrls.length > 0,
      hasCartSignal: this.hasCartSignal($),
    });

    if (
      score < minimumProductScore ||
      !title ||
      imageUrls.length === 0 ||
      typeof price !== 'number'
    ) {
      return null;
    }

    return {
      title,
      sourceUrl,
      sourceWebsite: new URL(sourceUrl).hostname,
      price,
      priceText: `${price}`,
      manufacturerName: this.extractBrand(productJsonLd),
      categoryPath: this.extractCategoryPath(breadcrumbJsonLd),
      description: this.extractDescription($, productJsonLd) ?? title,
      imageUrls,
      externalProductCode: this.extractStringField(productJsonLd, 'sku'),
      externalArticle: this.extractStringField(productJsonLd, 'mpn'),
    };
  }

  private calculateProductScore(signals: {
    hasProductJsonLd: boolean;
    hasTitle: boolean;
    hasPrice: boolean;
    hasImages: boolean;
    hasCartSignal: boolean;
  }): number {
    let score = 0;

    if (signals.hasProductJsonLd) score += 50;
    if (signals.hasTitle) score += 15;
    if (signals.hasPrice) score += 20;
    if (signals.hasImages) score += 10;
    if (signals.hasCartSignal) score += 10;

    return score;
  }

  private extractTitle(
    $: CheerioAPI,
    productJsonLd?: JsonLdRecord,
  ): string | undefined {
    return (
      this.extractStringField(productJsonLd, 'name') ??
      this.normalizeText($('h1').first().text()) ??
      this.normalizeText($('title').first().text())
    );
  }

  private extractDescription(
    $: CheerioAPI,
    productJsonLd?: JsonLdRecord,
  ): string | undefined {
    return (
      this.extractStringField(productJsonLd, 'description') ??
      this.normalizeText($('meta[name="description"]').attr('content') ?? '')
    );
  }

  private extractPrice(
    $: CheerioAPI,
    productJsonLd?: JsonLdRecord,
  ): number | undefined {
    const jsonLdPrice = this.extractJsonLdPrice(productJsonLd);

    if (typeof jsonLdPrice === 'number') return jsonLdPrice;

    const priceText = $('[class*="price"], [id*="price"]').first().text();

    return parsePriceText(priceText);
  }

  private extractJsonLdPrice(productJsonLd?: JsonLdRecord): number | undefined {
    const offers = productJsonLd?.offers;

    if (!isRecord(offers)) return undefined;

    const price = offers.price;

    if (typeof price === 'string' || typeof price === 'number') {
      const numericPrice = Number(price);

      return Number.isFinite(numericPrice) ? numericPrice : undefined;
    }

    return undefined;
  }

  private extractImageUrls(
    $: CheerioAPI,
    productJsonLd?: JsonLdRecord,
    sourceUrl?: string,
  ): string[] {
    const jsonLdImages = productJsonLd?.image;
    const imagesFromJsonLd = this.extractImageValue(jsonLdImages, sourceUrl);

    if (imagesFromJsonLd.length > 0) return imagesFromJsonLd;

    const ogImage = $('meta[property="og:image"]').attr('content');

    return this.extractImageValue(ogImage, sourceUrl);
  }

  private extractImageValue(value: unknown, sourceUrl?: string): string[] {
    if (!value) return [];

    if (typeof value === 'string') {
      const normalizedUrl = this.normalizeImageUrl(value, sourceUrl);

      return normalizedUrl ? [normalizedUrl] : [];
    }

    if (Array.isArray(value)) {
      return [
        ...new Set(
          value.flatMap((imageValue) =>
            this.extractImageValue(imageValue, sourceUrl),
          ),
        ),
      ];
    }

    if (isRecord(value)) {
      return this.extractImageValue(value.url ?? value.contentUrl, sourceUrl);
    }

    return [];
  }

  private normalizeImageUrl(value: string, sourceUrl?: string): string | null {
    try {
      const url = sourceUrl ? new URL(value, sourceUrl) : new URL(value);

      if (!['http:', 'https:'].includes(url.protocol)) return null;

      return url.href;
    } catch {
      return null;
    }
  }

  private extractBrand(productJsonLd?: JsonLdRecord): string | undefined {
    const brand = productJsonLd?.brand;

    if (isRecord(brand)) {
      const name = brand.name;

      return typeof name === 'string' ? this.normalizeText(name) : undefined;
    }

    if (typeof brand === 'string') return this.normalizeText(brand);

    return undefined;
  }

  private extractCategoryPath(breadcrumbJsonLd?: JsonLdRecord): string[] {
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

  private extractStringField(
    record: JsonLdRecord | undefined,
    fieldName: string,
  ): string | undefined {
    const value = record?.[fieldName];

    return typeof value === 'string' ? this.normalizeText(value) : undefined;
  }

  private hasCartSignal($: CheerioAPI): boolean {
    const pageText = $('body').text().toLowerCase();
    const commerceElements = [
      'form[action*="cart"]',
      'form[action*="basket"]',
      'button[class*="cart"]',
      'button[class*="basket"]',
      'button[class*="buy"]',
      'a[class*="cart"]',
      'a[class*="basket"]',
      '[data-cart]',
      '[data-basket]',
      '[data-add-to-cart]',
    ].join(', ');

    return (
      $(commerceElements).length > 0 ||
      pageText.includes('add to cart') ||
      pageText.includes('buy now')
    );
  }

  private normalizeText(value: string): string | undefined {
    const normalized = value.replace(/\s+/g, ' ').trim();

    return normalized.length > 0 ? normalized : undefined;
  }
}
