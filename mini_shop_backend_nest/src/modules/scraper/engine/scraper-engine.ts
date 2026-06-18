import { Injectable, Logger } from '@nestjs/common';
import type { StartScrapeJobDto } from '../dto/start-scrape-job.dto';
import type { RawScrapedProduct } from '../interfaces/raw-scraped-product.interface';
import { chunkArray } from '../utils/scraper-common.utils';
import type { DiscoveredSourceProfile } from '../interfaces/source-profile.interface';
import { SearchDiscoveryPipeline } from '../pipelines/search-discovery.pipeline';
import { ProductUrlExtractionPipeline } from '../pipelines/product-url-extraction.pipeline';
import { ProductDetailsExtractionPipeline } from '../pipelines/product-details-extraction.pipeline';
import { ProductValidationPipeline } from '../pipelines/product-validation.pipeline';

const defaultLimit = 20;
const maxSearchPages = 3;
const maxLinksPerPage = 20;
const productPageConcurrency = 5;

type ScrapeProductsParams = StartScrapeJobDto & {
  sourceProfile?: DiscoveredSourceProfile | null;
};

@Injectable()
export class UniversalScraperEngine {
  private readonly logger = new Logger(UniversalScraperEngine.name);

  public constructor(
    private readonly searchDiscoveryPipeline: SearchDiscoveryPipeline,
    private readonly productUrlExtractionPipeline: ProductUrlExtractionPipeline,
    private readonly productDetailsExtractionPipeline: ProductDetailsExtractionPipeline,
    private readonly productValidationPipeline: ProductValidationPipeline,
  ) {}

  public async *scrapeProducts(
    params: ScrapeProductsParams,
  ): AsyncGenerator<RawScrapedProduct> {
    const limit = params.limit ?? defaultLimit;
    const searchResults = await this.searchDiscoveryPipeline.discover(params);
    const scannedUrls = new Set<string>();
    let matchedProductsCount = 0;
    const maxCandidateUrlsToVisit = Math.max(limit * 20, 60);

    for (const { query, searchUrls, productLinkSelector } of searchResults) {
      let queryCandidateUrlsVisited = 0;
      let playwrightFallbackUsed = false;

      searchUrlLoop: for (const baseSearchUrl of searchUrls) {
        for (let page = 1; page <= maxSearchPages; page += 1) {
          const searchUrl = this.withPage(baseSearchUrl, page);
          const extractionResult =
            await this.productUrlExtractionPipeline.extractFromSearchUrl({
              searchUrl,
              baseUrl: params.sourceBaseUrl,
              query,
              productLinkSelector,
              scannedUrls,
              maxLinksPerPage,
              usePlaywrightFallback: !playwrightFallbackUsed,
            });
          const productUrls = extractionResult.productUrls;

          if (extractionResult.usedPlaywrightFallback) {
            playwrightFallbackUsed = true;
          }

          if (productUrls.length === 0) continue;

          this.logger.log(
            `Universal scraper page ${page}/${maxSearchPages}: ${productUrls.length} candidate links selected.`,
          );

          productUrls.forEach((url) => scannedUrls.add(url));
          queryCandidateUrlsVisited += productUrls.length;

          for (const urlBatch of chunkArray(
            productUrls,
            productPageConcurrency,
          )) {
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

          if (queryCandidateUrlsVisited >= maxCandidateUrlsToVisit) {
            break searchUrlLoop;
          }
        }
      }
    }
  }

  private async extractMatchingProduct(
    productUrl: string,
    params: StartScrapeJobDto,
  ): Promise<RawScrapedProduct | null> {
    const product =
      await this.productDetailsExtractionPipeline.extract(productUrl);

    if (!product) return null;
    if (!this.productValidationPipeline.matchesFilters(product, params)) {
      return null;
    }

    return product;
  }

  private withPage(searchUrl: string, page: number): string {
    const url = new URL(searchUrl);

    if (page > 1) {
      url.searchParams.set('page', String(page));
    }

    return url.href;
  }
}
