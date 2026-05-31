import { Module } from '@nestjs/common';
import { ScraperRegistryService } from './scraper-registry.service';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { SCRAPER_ADAPTERS } from './constants/scraper-adapters.token';
import { UltraScraperAdapter } from './adapters/ultra/ultra-scraper.adapter';
import { ProductScrapeNormalizer } from './normalizers/product-scrape.normalizer';
import { ProductScrapeImporter } from './importers/product-scrape.importer';
import { AuthModule } from '../auth/auth.module';
import { ScraperHttpClient } from './http/scraper-http.client';

@Module({
  imports: [AuthModule],
  controllers: [ScraperController],
  providers: [
    ScraperService,
    ScraperRegistryService,
    UltraScraperAdapter,
    ProductScrapeNormalizer,
    ProductScrapeImporter,
    ScraperHttpClient,
    {
      provide: SCRAPER_ADAPTERS,
      useFactory: (ultraAdapter: UltraScraperAdapter) => [ultraAdapter],
      inject: [UltraScraperAdapter],
    },
  ],
})
export class ScraperModule {}
