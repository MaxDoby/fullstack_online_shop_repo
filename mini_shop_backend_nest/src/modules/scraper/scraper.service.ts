import { Injectable, Logger } from '@nestjs/common';
import { ScraperRegistryService } from './scraper-registry.service';
import type { StartScrapeJobDto } from './dto/start-scrape-job.dto';
import { ProductScrapeNormalizer } from './normalizers/product-scrape.normalizer';
import { ProductScrapeImporter } from './importers/product-scrape.importer';
import { ScrapeJobMapper } from './mappers/scrape-job.mapper';
import { ScraperRepository } from './scraper.repository';
import { ScraperQueueProducer } from './queue/scraper-queue.producer';

@Injectable()
export class ScraperService {
  public constructor(
    private readonly scraperRepository: ScraperRepository,
    private readonly scraperRegistry: ScraperRegistryService,
    private readonly productScrapeNormalizer: ProductScrapeNormalizer,
    private readonly productScrapeImporter: ProductScrapeImporter,
    private readonly scraperQueueProducer: ScraperQueueProducer,
  ) {}

  private readonly logger = new Logger(ScraperService.name);

  public async startJob(body: StartScrapeJobDto) {
    const scrapeJob = await this.scraperRepository.createJob(body);

    this.logger.log(`Scraper job ${scrapeJob.id} created.`);

    await this.scraperQueueProducer.publishScraperJob({
      jobId: scrapeJob.id,
      payload: body,
    });

    this.logger.log(`Scraper job ${scrapeJob.id} queued.`);

    return ScrapeJobMapper.toResponse(scrapeJob);
  }

  public async runJob(scrapeJobId: number, body: StartScrapeJobDto) {
    this.logger.log(`Scraper job ${scrapeJobId} started.`);

    try {
      const adapter = this.scraperRegistry.getAdapter(body.sourceWebsite);

      await this.scraperRepository.markRunning(scrapeJobId);

      this.logger.log(`Scraper job ${scrapeJobId} marked as RUNNING.`);

      const rawProducts = await adapter.scrapeProducts(body);

      this.logger.log(
        `Scraper job ${scrapeJobId} found ${rawProducts.length} raw products.`,
      );

      const normalizedProducts = rawProducts.map((rawProduct) =>
        this.productScrapeNormalizer.normalize(rawProduct),
      );

      if (normalizedProducts.length === 0) {
        return this.scraperRepository.markCompletedWithNoProducts(scrapeJobId);
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

          this.logger.error(
            `Product import failed in scraper job ${scrapeJobId}.`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }

      const totalImported = importedProducts.filter(
        (importedProduct) => importedProduct.action === 'created',
      ).length;
      const totalUpdated = importedProducts.filter(
        (importedProduct) => importedProduct.action === 'updated',
      ).length;

      this.logger.log(
        `Scraper job ${scrapeJobId} completed. Imported: ${totalImported}, updated: ${totalUpdated}, failed: ${totalFailed}.`,
      );

      return this.scraperRepository.markCompleted({
        id: scrapeJobId,
        totalFound: normalizedProducts.length,
        totalImported,
        totalUpdated,
        totalFailed,
      });
    } catch (error) {
      this.logger.error(
        `Scraper job ${scrapeJobId} failed.`,
        error instanceof Error ? error.stack : String(error),
      );

      return this.scraperRepository.markFailed({
        id: scrapeJobId,
        errorMessage:
          error instanceof Error ? error.message : 'Unknown scraper error.',
      });
    }
  }

  public async findAllJobs() {
    const jobs = await this.scraperRepository.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return ScrapeJobMapper.toResponseList(jobs);
  }

  public async findJobById(id: number) {
    const job = await this.scraperRepository.findUnique({
      where: { id },
    });

    if (!job) return null;

    return ScrapeJobMapper.toResponse(job);
  }

  public async deleteJob(id: number) {
    const job = await this.scraperRepository.delete({
      where: { id },
    });

    return ScrapeJobMapper.toResponse(job);
  }
}
