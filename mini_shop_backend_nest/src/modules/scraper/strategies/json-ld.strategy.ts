import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import type {
  ProductUrlExtractionParams,
  ProductUrlExtractionStrategy,
} from './scraper-strategy.interface';

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

@Injectable()
export class JsonLdStrategy implements ProductUrlExtractionStrategy {
  public extractProductUrls(params: ProductUrlExtractionParams): string[] {
    const $ = cheerio.load(params.html);
    const urls = $('script[type="application/ld+json"]')
      .toArray()
      .flatMap((script) => {
        try {
          const parsed: unknown = JSON.parse($(script).text().trim());

          return this.collectUrls(parsed, params.baseUrl);
        } catch {
          return [];
        }
      });

    return [...new Set(urls)];
  }

  private collectUrls(value: unknown, baseUrl: string): string[] {
    if (Array.isArray(value)) {
      return value.flatMap((item) => this.collectUrls(item, baseUrl));
    }

    if (!isRecord(value)) return [];

    const currentUrl = this.normalizeUrl(value.url, baseUrl);
    const itemUrl = isRecord(value.item)
      ? this.normalizeUrl(value.item.url, baseUrl)
      : null;
    const nestedUrls = Object.values(value).flatMap((item) =>
      this.collectUrls(item, baseUrl),
    );

    return [currentUrl, itemUrl, ...nestedUrls].filter((url): url is string =>
      Boolean(url),
    );
  }

  private normalizeUrl(value: unknown, baseUrl: string): string | null {
    if (typeof value !== 'string') return null;

    try {
      const url = new URL(value, baseUrl);
      const base = new URL(baseUrl);

      if (url.origin !== base.origin) return null;

      return url.href.split('#')[0];
    } catch {
      return null;
    }
  }
}
