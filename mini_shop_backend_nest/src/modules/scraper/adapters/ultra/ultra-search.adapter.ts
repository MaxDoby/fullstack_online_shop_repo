import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import type { StartScrapeJobDto } from '../../dto/start-scrape-job.dto';
import type { RawScrapedProduct } from '../../interfaces/raw-scraped-product.interface';
import type { ScraperAdapter } from '../../interfaces/scraper-adapter.interface';
import { ScraperHttpClient } from '../../http/scraper-http.client';
import { UltraProductParser } from './ultra-product.parser';

const defaultLimit = 20;
const maxProductLinksToScan = 40;
const maxSearchPagesToScan = 50;

@Injectable()
export class UltraSearchAdapter implements ScraperAdapter {
  public readonly sourceWebsite = 'ultra.md';

  public constructor(
    private readonly scraperHttpClient: ScraperHttpClient,
    private readonly ultraProductParser: UltraProductParser,
  ) {}

  public canHandle(sourceWebsite: string): boolean {
    return sourceWebsite.toLowerCase().includes('ultra.md');
  }

  public async scrapeProducts(
    params: StartScrapeJobDto,
  ): Promise<RawScrapedProduct[]> {
    const baseUrl = this.getBaseUrl(params.sourceBaseUrl);
    const products: RawScrapedProduct[] = [];
    const limit = params.limit ?? defaultLimit;
    const scannedProductUrls = new Set<string>();

    for (let page = 1; page <= maxSearchPagesToScan; page += 1) {
      const searchUrl = this.buildSearchUrl(baseUrl, params, page);
      const searchHtml = await this.scraperHttpClient.getText(searchUrl);
      const productUrls = this.extractProductUrls(searchHtml, baseUrl)
        .filter((productUrl) => !scannedProductUrls.has(productUrl))
        .slice(0, maxProductLinksToScan);

      if (productUrls.length === 0) continue;

      for (const productUrl of productUrls) {
        scannedProductUrls.add(productUrl);

        const productHtml = await this.scraperHttpClient.getText(productUrl);
        const product = this.ultraProductParser.parse(productHtml, productUrl);

        if (!product) continue;
        if (!this.matchesFilters(product, params)) continue;

        products.push(product);

        if (products.length >= limit) return products;
      }
    }
    return products;
  }

  private buildSearchUrl(
    baseUrl: string,
    params: StartScrapeJobDto,
    page: number,
  ): string {
    const searchText = [
      params.productType,
      params.manufacturer,
      params.model,
      params.searchText,
    ]
      .filter((value): value is string => Boolean(value?.trim()))
      .join(' ');

    const url = new URL('/search', baseUrl);
    url.searchParams.set('search', searchText);
    url.searchParams.set('page', String(page));

    return url.href;
  }

  private extractProductUrls(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);

    const urls = $('a[href*="/product/"]')
      .toArray()
      .map((element) => {
        const href = $(element).attr('href');

        return href ? this.toAbsoluteUrl(href, baseUrl) : null;
      })
      .filter((url): url is string => Boolean(url));

    return [...new Set(urls)];
  }

  private matchesFilters(
    product: RawScrapedProduct,
    params: StartScrapeJobDto,
  ): boolean {
    if (
      params.productType &&
      !this.containsAllWords(
        `${product.title} ${product.categoryPath?.join(' ') ?? ''}`,
        params.productType,
      )
    ) {
      return false;
    }

    if (
      params.manufacturer &&
      !this.containsAllWords(
        product.manufacturerName ?? '',
        params.manufacturer,
      )
    ) {
      return false;
    }

    if (params.model && !this.containsAllWords(product.title, params.model)) {
      return false;
    }

    if (
      params.searchText &&
      !this.containsAllWords(
        `${product.title} ${product.description ?? ''}`,
        params.searchText,
      )
    ) {
      return false;
    }

    if (params.minPrice && product.price && product.price < params.minPrice) {
      return false;
    }

    if (params.maxPrice && product.price && product.price > params.maxPrice) {
      return false;
    }

    return true;
  }

  private containsAllWords(value: string, expectedWords: string): boolean {
    const normalizedValue = this.normalizeForSearch(value);
    const words = this.normalizeForSearch(expectedWords)
      .split(' ')
      .filter((word) => word.length > 0);

    return words.every((word) => normalizedValue.includes(word));
  }

  private getBaseUrl(sourceBaseUrl: string): string {
    return sourceBaseUrl.endsWith('/')
      ? sourceBaseUrl.slice(0, -1)
      : sourceBaseUrl;
  }

  private toAbsoluteUrl(href: string, baseUrl: string): string | null {
    try {
      return new URL(href, baseUrl).href.split('#')[0];
    } catch {
      return null;
    }
  }

  private normalizeForSearch(value: string): string {
    return Array.from(value.normalize('NFD').toLowerCase())
      .filter((char) => {
        const code = char.charCodeAt(0);

        return code < 0x0300 || code > 0x036f;
      })
      .join('')
      .replaceAll('-', ' ')
      .replaceAll('_', ' ')
      .replaceAll('/', ' ');
  }
}
