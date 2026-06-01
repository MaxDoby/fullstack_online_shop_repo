import { Injectable } from '@nestjs/common';
import { ScrapeJobStatus } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ScraperRegistryService } from './scraper-registry.service';
import type { StartScrapeJobDto } from './dto/start-scrape-job.dto';
import { ProductScrapeNormalizer } from './normalizers/product-scrape.normalizer';
import { ProductScrapeImporter } from './importers/product-scrape.importer';

@Injectable()
export class ScraperService {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly scraperRegistry: ScraperRegistryService,
    private readonly productScrapeNormalizer: ProductScrapeNormalizer,
    private readonly productScrapeImporter: ProductScrapeImporter,
  ) {}

  public async startJob(body: StartScrapeJobDto) {
    const scrapeJob = await this.prisma.scrapeJob.create({
      data: {
        sourceWebsite: body.sourceWebsite,
        sourceBaseUrl: body.sourceBaseUrl,
        manufacturer: body.manufacturer,
        productType: body.productType,
        searchText: body.searchText,
        minPrice: body.minPrice,
        maxPrice: body.maxPrice,
        status: ScrapeJobStatus.PENDING,
      },
    });

    try {
      const adapter = this.scraperRegistry.getAdapter(body.sourceWebsite);

      await this.prisma.scrapeJob.update({
        where: { id: scrapeJob.id },
        data: { status: ScrapeJobStatus.RUNNING },
      });

      const rawProducts = await adapter.scrapeProducts(body);

      const normalizedProducts = rawProducts.map((rawProduct) =>
        this.productScrapeNormalizer.normalize(rawProduct),
      );

      const importedProducts: Awaited<
        ReturnType<typeof this.productScrapeImporter.importProduct>
      >[] = [];

      for (const normalizedProduct of normalizedProducts) {
        const importedProduct = await this.productScrapeImporter.importProduct(
          normalizedProduct,
          scrapeJob.id,
        );

        importedProducts.push(importedProduct);
      }

      const totalImported = importedProducts.filter(
        (importedProduct) => importedProduct.action === 'created',
      ).length;
      const totalUpdated = importedProducts.filter(
        (importedProduct) => importedProduct.action === 'updated',
      ).length;

      return this.prisma.scrapeJob.update({
        where: { id: scrapeJob.id },
        data: {
          status: ScrapeJobStatus.COMPLETED,
          totalFound: normalizedProducts.length,
          totalImported,
          totalUpdated,
          finishedAt: new Date(),
        },
      });
    } catch (error) {
      return this.prisma.scrapeJob.update({
        where: { id: scrapeJob.id },
        data: {
          status: ScrapeJobStatus.FAILED,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown scraper error.',
          finishedAt: new Date(),
        },
      });
    }
  }

  public findAllJobs() {
    return this.prisma.scrapeJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  public findJobById(id: number) {
    return this.prisma.scrapeJob.findUnique({
      where: { id },
      include: {
        productSources: true,
      },
    });
  }
}
