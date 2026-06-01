import { Injectable } from '@nestjs/common';
import type { StartScrapeJobDto } from '../../dto/start-scrape-job.dto';
import type { RawScrapedProduct } from '../../interfaces/raw-scraped-product.interface';
import type { ScraperAdapter } from '../../interfaces/scraper-adapter.interface';
import { ScraperHttpClient } from '../../http/scraper-http.client';
import { findBestUltraCategoryUrl } from './ultra-category.matcher';
import {
  isMissingUltraProductJsonLdError,
  parseUltraProductPage,
} from './ultra-product-page.parser';

@Injectable()
export class UltraScraperAdapter implements ScraperAdapter {
  public readonly sourceWebsite = 'ultra.md';

  public constructor(private readonly scraperHttpClient: ScraperHttpClient) {}

  public canHandle(sourceWebsite: string): boolean {
    return sourceWebsite.toLowerCase() === this.sourceWebsite;
  }

  public async scrapeProducts(
    params: StartScrapeJobDto,
  ): Promise<RawScrapedProduct[]> {
    const limit = params.limit ?? 1;
    const rawProducts: RawScrapedProduct[] = [];
    const visitedProductUrls = new Set<string>();

    await this.scrapeMatchedCategoryPages(
      params,
      rawProducts,
      visitedProductUrls,
    );

    if (rawProducts.length >= limit) return rawProducts;

    await this.scrapeProductsSitemap(params, rawProducts, visitedProductUrls);

    return rawProducts;
  }

  private async scrapeMatchedCategoryPages(
    params: StartScrapeJobDto,
    rawProducts: RawScrapedProduct[],
    visitedProductUrls: Set<string>,
  ): Promise<void> {
    const limit = params.limit ?? 1;
    const matchedCategoryUrl = await this.findMatchedCategoryUrl(params);

    if (!matchedCategoryUrl) return;

    const maxCategoryPages = Math.ceil(limit / 20) + 2;

    for (
      let page = 1;
      page <= maxCategoryPages && rawProducts.length < limit;
      page += 1
    ) {
      const categoryPageUrl = this.buildCategoryPageUrl(
        matchedCategoryUrl,
        page,
      );
      const categoryHtml =
        await this.scraperHttpClient.getText(categoryPageUrl);
      const productUrls = this.extractProductUrlsFromCategoryPage(
        categoryHtml,
        params.sourceBaseUrl,
      );

      if (productUrls.length === 0) break;

      await this.scrapeProductUrls(
        productUrls,
        params,
        rawProducts,
        visitedProductUrls,
      );
    }
  }

  private async scrapeProductsSitemap(
    params: StartScrapeJobDto,
    rawProducts: RawScrapedProduct[],
    visitedProductUrls: Set<string>,
  ): Promise<void> {
    const limit = params.limit ?? 1;
    const productsSitemapUrl = this.buildProductsSitemapUrl(
      params.sourceBaseUrl,
    );
    const sitemapXml = await this.scraperHttpClient.getText(productsSitemapUrl);
    const productUrls = this.extractSitemapUrls(sitemapXml);

    if (productUrls.length === 0) {
      throw new Error('Ultra products sitemap does not contain product URLs.');
    }

    await this.scrapeProductUrls(
      productUrls.slice(0, Math.max(limit * 20, limit)),
      params,
      rawProducts,
      visitedProductUrls,
    );
  }

  private async scrapeProductUrls(
    productUrls: string[],
    params: StartScrapeJobDto,
    rawProducts: RawScrapedProduct[],
    visitedProductUrls: Set<string>,
  ): Promise<void> {
    const limit = params.limit ?? 1;

    for (const productUrl of productUrls) {
      if (rawProducts.length >= limit) break;
      if (visitedProductUrls.has(productUrl)) continue;

      visitedProductUrls.add(productUrl);

      const html = await this.scraperHttpClient.getText(productUrl);
      const rawProduct = this.tryParseProductPage(html, productUrl, params);

      if (rawProduct) rawProducts.push(rawProduct);
    }
  }

  private async findMatchedCategoryUrl(
    params: StartScrapeJobDto,
  ): Promise<string | null> {
    if (!params.productType) return null;

    try {
      const categoriesSitemapUrl = this.buildCategoriesSitemapUrl(
        params.sourceBaseUrl,
      );
      const categoriesSitemapXml =
        await this.scraperHttpClient.getText(categoriesSitemapUrl);
      const categoryUrls = this.extractSitemapUrls(categoriesSitemapXml);

      return findBestUltraCategoryUrl(categoryUrls, params.productType);
    } catch {
      return null;
    }
  }

  private tryParseProductPage(
    html: string,
    productUrl: string,
    params: StartScrapeJobDto,
  ): RawScrapedProduct | null {
    try {
      return parseUltraProductPage(
        html,
        productUrl,
        params,
        this.sourceWebsite,
      );
    } catch (error) {
      if (isMissingUltraProductJsonLdError(error)) return null;

      throw error;
    }
  }

  private buildProductsSitemapUrl(sourceBaseUrl: string): string {
    return new URL('/sitemap/products-ro.xml', sourceBaseUrl).toString();
  }

  private buildCategoriesSitemapUrl(sourceBaseUrl: string): string {
    return new URL('/sitemap/old_categories_ro.xml', sourceBaseUrl).toString();
  }

  private buildCategoryPageUrl(categoryUrl: string, page: number): string {
    const pageUrl = new URL(categoryUrl);

    if (page > 1) {
      pageUrl.searchParams.set('page', String(page));
    }

    return pageUrl.toString();
  }

  private extractSitemapUrls(sitemapXml: string): string[] {
    return [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(
      (match) => match[1],
    );
  }

  private extractProductUrlsFromCategoryPage(
    html: string,
    sourceBaseUrl: string,
  ): string[] {
    const productUrls = [
      ...html.matchAll(/href="([^"]*\/product\/[^"]+)"/g),
    ].map((match) => new URL(match[1], sourceBaseUrl).toString());

    return [...new Set(productUrls)];
  }
}
