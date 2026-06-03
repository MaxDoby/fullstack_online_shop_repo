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
        model: body.model,
        searchText: body.searchText,
        minPrice: body.minPrice,
        maxPrice: body.maxPrice,
        status: ScrapeJobStatus.PENDING,
      },
    });

    void this.runJob(scrapeJob.id, body);

    return scrapeJob;
  }

  private async runJob(scrapeJobId: number, body: StartScrapeJobDto) {
    try {
      const adapter = this.scraperRegistry.getAdapter(body.sourceWebsite);

      await this.prisma.scrapeJob.update({
        where: { id: scrapeJobId },
        data: { status: ScrapeJobStatus.RUNNING },
      });

      const rawProducts = await adapter.scrapeProducts(body);

      const normalizedProducts = rawProducts.map((rawProduct) =>
        this.productScrapeNormalizer.normalize(rawProduct),
      );

      if (normalizedProducts.length === 0) {
        return this.prisma.scrapeJob.update({
          where: { id: scrapeJobId },
          data: {
            status: ScrapeJobStatus.COMPLETED,
            totalFound: 0,
            totalImported: 0,
            totalUpdated: 0,
            totalFailed: 0,
            errorMessage: 'No products matched the selected filters.',
            finishedAt: new Date(),
          },
        });
      }

      const importedProducts: Awaited<
        ReturnType<typeof this.productScrapeImporter.importProduct>
      >[] = [];

      let totalFailed: number = 0;

      for (const normalizedProduct of normalizedProducts) {
        try {
          const importedProduct =
            await this.productScrapeImporter.importProduct(
              normalizedProduct,
              scrapeJobId,
            );

          importedProducts.push(importedProduct);
        } catch (error) {
          totalFailed += 1;

          console.error(
            'Product import failed:',
            error instanceof Error ? error.message : error,
          );
        }
      }

      const totalImported = importedProducts.filter(
        (importedProduct) => importedProduct.action === 'created',
      ).length;
      const totalUpdated = importedProducts.filter(
        (importedProduct) => importedProduct.action === 'updated',
      ).length;

      return this.prisma.scrapeJob.update({
        where: { id: scrapeJobId },
        data: {
          status: ScrapeJobStatus.COMPLETED,
          totalFound: normalizedProducts.length,
          totalImported,
          totalUpdated,
          totalFailed,
          finishedAt: new Date(),
        },
      });
    } catch (error) {
      return this.prisma.scrapeJob.update({
        where: { id: scrapeJobId },
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

  public deleteJob(id: number) {
    return this.prisma.scrapeJob.delete({
      where: { id },
    });
  }
}
