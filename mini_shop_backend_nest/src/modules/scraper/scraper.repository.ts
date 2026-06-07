import { Injectable } from '@nestjs/common';
import { ScrapeJobStatus } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { StartScrapeJobDto } from './dto/start-scrape-job.dto';

@Injectable()
export class ScraperRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public createJob(body: StartScrapeJobDto) {
    return this.prisma.scrapeJob.create({
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
  }

  public markRunning(id: number) {
    return this.prisma.scrapeJob.update({
      where: { id },
      data: {
        status: ScrapeJobStatus.RUNNING,
      },
    });
  }

  public markCompletedWithNoProducts(id: number) {
    return this.prisma.scrapeJob.update({
      where: { id },
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

  public markCompleted(params: {
    id: number;
    totalFound: number;
    totalImported: number;
    totalUpdated: number;
    totalFailed: number;
  }) {
    const { id, totalFound, totalImported, totalUpdated, totalFailed } = params;

    return this.prisma.scrapeJob.update({
      where: { id },
      data: {
        status: ScrapeJobStatus.COMPLETED,
        totalFound,
        totalImported,
        totalUpdated,
        totalFailed,
        finishedAt: new Date(),
      },
    });
  }

  public markFailed(params: { id: number; errorMessage: string }) {
    const { id, errorMessage } = params;

    return this.prisma.scrapeJob.update({
      where: { id },
      data: {
        status: ScrapeJobStatus.FAILED,
        errorMessage,
        finishedAt: new Date(),
      },
    });
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
    });
  }

  public deleteJob(id: number) {
    return this.prisma.scrapeJob.delete({
      where: { id },
    });
  }
}
