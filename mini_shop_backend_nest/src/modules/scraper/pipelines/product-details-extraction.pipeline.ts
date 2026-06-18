import { Injectable } from '@nestjs/common';
import { ScraperHttpClient } from '../http/scraper-http.client';
import { GenericProductExtractor } from '../extractors/generic-product.extractor';
import { PlaywrightProductExtractor } from '../extractors/playwright-product.extractor';
import type { RawScrapedProduct } from '../interfaces/raw-scraped-product.interface';

@Injectable()
export class ProductDetailsExtractionPipeline {
  public constructor(
    private readonly scraperHttpClient: ScraperHttpClient,
    private readonly genericProductExtractor: GenericProductExtractor,
    private readonly playwrightProductExtractor: PlaywrightProductExtractor,
  ) {}

  public async extract(productUrl: string): Promise<RawScrapedProduct | null> {
    try {
      const productHtml = await this.scraperHttpClient.getText(productUrl);
      const staticProduct = this.genericProductExtractor.extract(
        productHtml,
        productUrl,
      );

      return (
        staticProduct ??
        (await this.playwrightProductExtractor.extract(productUrl))
      );
    } catch {
      return null;
    }
  }
}
