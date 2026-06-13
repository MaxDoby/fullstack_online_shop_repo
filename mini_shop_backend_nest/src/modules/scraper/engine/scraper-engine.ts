import { Injectable, Logger } from '@nestjs/common';
import type { StartScrapeJobDto } from '../dto/start-scrape-job.dto';
import type { RawScrapedProduct } from '../interfaces/raw-scraped-product.interface';
import { ScraperHttpClient } from '../http/scraper-http.client';
import { SearchDiscoveryService } from '../discovery/search-discovery.service';
import { ProductLinkExtractor } from '../extractors/product-link.extractor';
import { GenericProductExtractor } from '../extractors/generic-product.extractor';

const defaultLimit = 20;
const maxSearchPages = 5;
const maxLinksPerPage = 30;
const productPageConcurrency = 3;

@Injectable()
export class UniversalScraperEngine {
  private readonly logger = new Logger(UniversalScraperEngine.name);

  public constructor(
    private readonly scraperHttpClient: ScraperHttpClient,
    private readonly searchDiscoveryService: SearchDiscoveryService,
    private readonly productLinkExtractor: ProductLinkExtractor,
    private readonly genericProductExtractor: GenericProductExtractor,
  ) {}

  public async *scrapeProducts(
    params: StartScrapeJobDto,
  ): AsyncGenerator<RawScrapedProduct> {
    const limit = params.limit ?? defaultLimit;
    const query = this.buildSearchQuery(params);
    const scannedUrls = new Set<string>();
    let matchedProductsCount = 0;

    const discoveredSearch =
      await this.searchDiscoveryService.discoverSearchUrl(
        params.sourceBaseUrl,
        query,
      );

    for (let page = 1; page <= maxSearchPages; page += 1) {
      const searchUrl = this.withPage(discoveredSearch.searchUrl, page);
      const searchHtml = await this.scraperHttpClient.getText(searchUrl);
      const productUrls = this.productLinkExtractor
        .extractProductLinks(searchHtml, params.sourceBaseUrl)
        .filter((url) => !scannedUrls.has(url))
        .slice(0, maxLinksPerPage);

      if (productUrls.length === 0) continue;

      this.logger.log(
        `Universal scraper page ${page}/${maxSearchPages}: ${productUrls.length} candidate links selected.`,
      );

      productUrls.forEach((url) => scannedUrls.add(url));

      for (const urlBatch of this.chunkUrls(productUrls)) {
        const products = await Promise.all(
          urlBatch.map((url) => this.extractMatchingProduct(url, params)),
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

  private async extractMatchingProduct(
    productUrl: string,
    params: StartScrapeJobDto,
  ): Promise<RawScrapedProduct | null> {
    try {
      const productHtml = await this.scraperHttpClient.getText(productUrl);
      const product = this.genericProductExtractor.extract(
        productHtml,
        productUrl,
      );

      if (!product) return null;
      if (!this.matchesFilters(product, params)) return null;

      return product;
    } catch {
      return null;
    }
  }

  private buildSearchQuery(params: StartScrapeJobDto): string {
    return [
      params.productType,
      params.manufacturer,
      params.model,
      params.searchText,
    ]
      .filter((value): value is string => Boolean(value?.trim()))
      .join(' ');
  }

  private withPage(searchUrl: string, page: number): string {
    const url = new URL(searchUrl);

    if (page > 1) {
      url.searchParams.set('page', String(page));
    }

    return url.href;
  }

  private chunkUrls(urls: string[]): string[][] {
    const chunks: string[][] = [];

    for (let index = 0; index < urls.length; index += productPageConcurrency) {
      chunks.push(urls.slice(index, index + productPageConcurrency));
    }

    return chunks;
  }

  private matchesFilters(
    product: RawScrapedProduct,
    params: StartScrapeJobDto,
  ): boolean {
    if (
      params.productType &&
      !this.containsAllWords(
        `${product.title} ${product.description ?? ''} ${product.categoryPath?.join(' ') ?? ''}`,
        params.productType,
      )
    ) {
      return false;
    }
    if (
      params.manufacturer &&
      !this.containsAllWords(
        `${product.manufacturerName ?? ''} ${product.title}`,
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
