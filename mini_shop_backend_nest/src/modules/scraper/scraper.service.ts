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

      let totalFound: number = 0;
      let totalImported: number = 0;
      let totalUpdated: number = 0;
      let totalFailed: number = 0;

      for await (const rawProduct of adapter.scrapeProducts(body)) {
        totalFound += 1;

        const normalizedProduct =
          this.productScrapeNormalizer.normalize(rawProduct);

        try {
          const importedProduct =
            await this.productScrapeImporter.importProduct(
              normalizedProduct,
              scrapeJobId,
            );

          if (importedProduct.action === 'created') totalImported += 1;
          if (importedProduct.action === 'updated') totalUpdated += 1;

          this.logger.log(
            `Scraper job ${scrapeJobId} processed product ${totalFound}: ${normalizedProduct.title}.`,
          );
        } catch (error) {
          totalFailed += 1;

          this.logger.error(
            `Product import failed in scraper job ${scrapeJobId}.`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }

      if (totalFound === 0) {
        return this.scraperRepository.markCompletedWithNoProducts(scrapeJobId);
      }

      this.logger.log(
        `Scraper job ${scrapeJobId} completed. Imported: ${totalImported}, updated: ${totalUpdated}, failed: ${totalFailed}.`,
      );

      let errorMessage: string | null = null;

      if (totalFailed > 0) {
        errorMessage = `${totalFailed} product(s) failed during import.`;
      }

      return this.scraperRepository.markCompleted({
        id: scrapeJobId,
        totalFound,
        totalImported,
        totalUpdated,
        totalFailed,
        errorMessage,
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
