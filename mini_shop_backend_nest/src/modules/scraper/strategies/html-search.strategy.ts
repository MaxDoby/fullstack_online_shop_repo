import { Injectable } from '@nestjs/common';
import { ProductLinkExtractor } from '../extractors/product-link.extractor';
import type {
  ProductUrlExtractionParams,
  ProductUrlExtractionStrategy,
} from './scraper-strategy.interface';

@Injectable()
export class HtmlSearchStrategy implements ProductUrlExtractionStrategy {
  public constructor(
    private readonly productLinkExtractor: ProductLinkExtractor,
  ) {}

  public extractProductUrls(params: ProductUrlExtractionParams): string[] {
    return this.productLinkExtractor.extractProductLinks(
      params.html,
      params.baseUrl,
      params.query,
      params.productLinkSelector,
    );
  }
}
