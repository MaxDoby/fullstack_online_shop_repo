import { Injectable } from '@nestjs/common';
import type { StartScrapeJobDto } from '../../dto/start-scrape-job.dto';
import type { RawScrapedProduct } from '../../interfaces/raw-scraped-product.interface';
import type { ScraperAdapter } from '../../interfaces/scraper-adapter.interface';

@Injectable()
export class UltraScraperAdapter implements ScraperAdapter {
  public readonly sourceWebsite = 'ultra.md';

  public canHandle(sourceWebsite: string): boolean {
    return sourceWebsite.toLowerCase() === this.sourceWebsite;
  }

  public scrapeProducts(
    params: StartScrapeJobDto,
  ): Promise<RawScrapedProduct[]> {
    return Promise.resolve([
      {
        title: params.searchText ?? 'Test scraped product',
        sourceWebsite: this.sourceWebsite,
        sourceUrl: `${params.sourceBaseUrl}/test-scraped-product`,
        priceText: '12 999 MDL',
        manufacturerName: params.manufacturer ?? 'Test Manufacturer',
        categoryPath: [
          'Test category',
          params.productType ?? 'Test product type',
        ],
        description: 'Temporary product used to test scraper import flow.',
        imageUrls: [],
        variants: [
          {
            name: 'Color',
            value: 'Black',
          },
        ],
        specificationGroups: [
          {
            name: 'General',
            specifications: [
              {
                name: 'Imported by',
                value: 'UltraScraperAdapter test flow',
              },
            ],
          },
        ],
        externalId: 'test-ultra-product-1',
        externalProductCode: 'TEST-ULTRA-001',
        externalArticle: 'TEST-ARTICLE-001',
      },
    ]);
  }
}
