import { Injectable } from '@nestjs/common';
import { ScrapeJobStatus } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { StartScrapeJobDto } from './dto/start-scrape-job.dto';
import { BaseRepository } from '../../core/database/repositories/base.repository';

@Injectable()
export class ScraperRepository extends BaseRepository<
  PrismaService['scrapeJob']
> {
  public constructor(private readonly prisma: PrismaService) {
    super(prisma.scrapeJob);
  }

  public createJob(body: StartScrapeJobDto) {
    return this.prisma.scrapeJob.create({
      data: {
        sourceWebsite: body.sourceWebsite,
        sourceBaseUrl: body.sourceBaseUrl,
        manufacturer: null,
        productType: null,
        targetCategoryId: body.targetCategoryId,
        model: null,
        searchText: body.searchText,
        minPrice: body.minPrice,
        maxPrice: body.maxPrice,
        status: ScrapeJobStatus.PENDING,
      },
      include: {
        targetCategory: true,
      },
    });
  }

  public findManyWithTargetCategory() {
    return this.prisma.scrapeJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        targetCategory: true,
      },
    });
  }

  public findUniqueWithTargetCategory(id: number) {
    return this.prisma.scrapeJob.findUnique({
      where: { id },
      include: {
        targetCategory: true,
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
    errorMessage?: string | null;
  }) {
    const {
      id,
      totalFound,
      totalImported,
      totalUpdated,
      totalFailed,
      errorMessage,
    } = params;

    return this.prisma.scrapeJob.update({
      where: { id },
      data: {
        status: ScrapeJobStatus.COMPLETED,
        totalFound,
        totalImported,
        totalUpdated,
        totalFailed,
        errorMessage: errorMessage ?? null,
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

  public deleteWithTargetCategory(id: number) {
    return this.prisma.scrapeJob.delete({
      where: { id },
      include: {
        targetCategory: true,
      },
    });
  }
}
