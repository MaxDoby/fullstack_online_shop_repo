import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import type { StartScrapeJobDto } from '../../dto/start-scrape-job.dto';
import type { RawScrapedProduct } from '../../interfaces/raw-scraped-product.interface';
import type { ScraperAdapter } from '../../interfaces/scraper-adapter.interface';
import { ScraperHttpClient } from '../../http/scraper-http.client';
import { UltraProductParser } from './ultra-product.parser';

const defaultLimit = 20;
const maxProductLinksToScan = 30;
const minProductLinksToScan = 10;
const maxSearchPagesToScan = 8;
const productPageConcurrency = 3;
const ultraSearchTermMap: Record<string, string> = {
  accessories: 'accesorii',
  accessory: 'accesorii',
  headphones: 'casti',
  laptops: 'laptop',
  notebooks: 'laptop',
  phones: 'smartphone',
  tablets: 'tablete',
  tablet: 'tablete',
};

@Injectable()
export class UltraSearchAdapter implements ScraperAdapter {
  public readonly sourceWebsite = 'ultra.md';

  private readonly logger = new Logger(UltraSearchAdapter.name);

  public constructor(
    private readonly scraperHttpClient: ScraperHttpClient,
    private readonly ultraProductParser: UltraProductParser,
  ) {}

  public canHandle(sourceWebsite: string): boolean {
    return sourceWebsite.toLowerCase().includes('ultra.md');
  }

  public async *scrapeProducts(
    params: StartScrapeJobDto,
  ): AsyncGenerator<RawScrapedProduct> {
    const baseUrl = this.getBaseUrl(params.sourceBaseUrl);
    const limit = params.limit ?? defaultLimit;
    const maxPages = this.getMaxSearchPages(limit);
    const maxLinksPerPage = this.getMaxProductLinksToScan(limit);
    const scannedProductUrls = new Set<string>();
    let matchedProductsCount = 0;

    for (let page = 1; page <= maxPages; page += 1) {
      const searchUrl = this.buildSearchUrl(baseUrl, params, page);
      const searchHtml = await this.scraperHttpClient.getText(searchUrl);
      const productUrls = this.extractProductUrls(searchHtml, baseUrl)
        .filter((productUrl) => !scannedProductUrls.has(productUrl))
        .slice(0, maxLinksPerPage);

      if (productUrls.length === 0) continue;

      this.logger.log(
        `Ultra search page ${page}/${maxPages}: ${productUrls.length} product candidates selected.`,
      );

      productUrls.forEach((productUrl) => scannedProductUrls.add(productUrl));

      for (const productUrlBatch of this.chunkProductUrls(productUrls)) {
        const products = await Promise.all(
          productUrlBatch.map((productUrl) =>
            this.loadMatchingProduct(productUrl, params),
          ),
        );

        for (const product of products) {
          if (!product) continue;

          matchedProductsCount += 1;
          yield product;

          if (matchedProductsCount >= limit) return;
        }
      }
    }
  }

  private async loadMatchingProduct(
    productUrl: string,
    params: StartScrapeJobDto,
  ): Promise<RawScrapedProduct | null> {
    try {
      const productHtml = await this.scraperHttpClient.getText(productUrl);
      const product = this.ultraProductParser.parse(productHtml, productUrl);

      if (!product) return null;
      if (!this.matchesFilters(product, params)) return null;

      return product;
    } catch {
      return null;
    }
  }

  private getMaxSearchPages(limit: number): number {
    return Math.min(
      maxSearchPagesToScan,
      Math.max(2, Math.ceil(limit / 10) + 1),
    );
  }

  private getMaxProductLinksToScan(limit: number): number {
    return Math.min(
      maxProductLinksToScan,
      Math.max(minProductLinksToScan, limit * 3),
    );
  }

  private chunkProductUrls(productUrls: string[]): string[][] {
    const chunks: string[][] = [];

    for (
      let index = 0;
      index < productUrls.length;
      index += productPageConcurrency
    ) {
      chunks.push(productUrls.slice(index, index + productPageConcurrency));
    }

    return chunks;
  }

  private extractProductUrls(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);

    const urls = $('a[href]')
      .toArray()
      .map((element) => {
        const href = $(element).attr('href');

        return href ? this.toAbsoluteUrl(href, baseUrl) : null;
      })
      .filter((url): url is string => {
        if (!url) return false;

        return this.isProductCandidateUrl(url, baseUrl);
      });

    return [...new Set(urls)];
  }

  private isProductCandidateUrl(url: string, baseUrl: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const parsedBaseUrl = new URL(baseUrl);

      if (parsedUrl.origin !== parsedBaseUrl.origin) return false;

      return parsedUrl.pathname.includes('/product/');
    } catch {
      return false;
    }
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
      .map((value) => this.toUltraSearchTerm(value))
      .join(' ');

    const url = new URL('/search', baseUrl);
    url.searchParams.set('search', searchText);
    url.searchParams.set('page', String(page));

    return url.href;
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

  private toUltraSearchTerm(value: string): string {
    const normalizedValue = this.normalizeForSearch(value);

    return ultraSearchTermMap[normalizedValue] ?? value;
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
      .replaceAll('/', ' ')
      .replaceAll('laptops', 'laptop')
      .replaceAll('notebooks', 'notebook')
      .replaceAll('phones', 'phone')
      .replaceAll('smartphones', 'smartphone')
      .replaceAll('tablets', 'tablet');
  }
}
