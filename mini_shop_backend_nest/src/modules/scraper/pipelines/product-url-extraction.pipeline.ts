import { Injectable, Logger } from '@nestjs/common';
import { ScraperHttpClient } from '../http/scraper-http.client';
import { HtmlSearchStrategy } from '../strategies/html-search.strategy';
import { JsonLdStrategy } from '../strategies/json-ld.strategy';
import { ApiDiscoveryStrategy } from '../strategies/api-discovery.strategy';
import { PlaywrightSearchStrategy } from '../strategies/playwright-search.strategy';
import type { ProductUrlExtractionStrategy } from '../strategies/scraper-strategy.interface';

export interface ProductUrlExtractionParams {
  searchUrl: string;
  baseUrl: string;
  query: string;
  scannedUrls: Set<string>;
  usePlaywrightFallback: boolean;
}

export interface ProductUrlExtractionResult {
  productUrls: string[];
  usedPlaywrightFallback: boolean;
}

@Injectable()
export class ProductUrlExtractionPipeline {
  private readonly logger = new Logger(ProductUrlExtractionPipeline.name);

  public constructor(
    private readonly scraperHttpClient: ScraperHttpClient,
    private readonly htmlSearchStrategy: HtmlSearchStrategy,
    private readonly jsonLdStrategy: JsonLdStrategy,
    private readonly apiDiscoveryStrategy: ApiDiscoveryStrategy,
    private readonly playwrightSearchStrategy: PlaywrightSearchStrategy,
  ) {}

  public async extractFromSearchUrl(
    params: ProductUrlExtractionParams,
  ): Promise<ProductUrlExtractionResult> {
    let productUrls: string[] = [];
    let usedPlaywrightFallback = false;

    try {
      const searchHtml = await this.scraperHttpClient.getText(params.searchUrl);
      productUrls = this.extractProductUrls({
        html: searchHtml,
        baseUrl: params.baseUrl,
        query: params.query,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (!params.usePlaywrightFallback) {
        this.logger.warn(
          `Static search request failed and Playwright fallback was already used. Skipping URL. ${errorMessage}`,
        );

        return {
          productUrls: [],
          usedPlaywrightFallback,
        };
      }

      this.logger.warn(
        `Static search request failed. Trying Playwright fallback. ${errorMessage}`,
      );
    }

    if (productUrls.length === 0 && params.usePlaywrightFallback) {
      usedPlaywrightFallback = true;
      this.logger.log(
        'Static extraction returned no products. Trying Playwright fallback.',
      );
      productUrls = await this.playwrightSearchStrategy.extractProductUrls({
        baseUrl: params.baseUrl,
        searchUrl: params.searchUrl,
        query: params.query,
      });
    }

    return {
      productUrls: productUrls.filter((url) => !params.scannedUrls.has(url)),
      usedPlaywrightFallback,
    };
  }

  private extractProductUrls(params: {
    html: string;
    baseUrl: string;
    query: string;
  }): string[] {
    const strategies: ProductUrlExtractionStrategy[] = [
      this.htmlSearchStrategy,
      this.jsonLdStrategy,
      this.apiDiscoveryStrategy,
    ];

    return [
      ...new Set(
        strategies.flatMap((strategy) =>
          strategy.extractProductUrls({
            html: params.html,
            baseUrl: params.baseUrl,
            query: params.query,
          }),
        ),
      ),
    ];
  }
}
