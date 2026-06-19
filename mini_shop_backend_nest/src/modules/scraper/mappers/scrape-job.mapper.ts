import type { ScrapeJobResponseDto } from '../dto/scrape-job-response.dto';

type ScrapeJobEntity = {
  id: number;
  sourceWebsite: string;
  sourceBaseUrl: string;
  targetCategory: {
    id: number;
    name: string;
  } | null;
  searchText: string | null;
  status: string;
  totalFound: number;
  totalImported: number;
  totalUpdated: number;
  totalFailed: number;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  finishedAt: Date | null;
};

export class ScrapeJobMapper {
  public static toResponse(job: ScrapeJobEntity): ScrapeJobResponseDto {
    return {
      id: job.id,
      sourceWebsite: job.sourceWebsite,
      sourceBaseUrl: job.sourceBaseUrl,
      targetCategory: job.targetCategory
        ? {
            id: job.targetCategory.id,
            name: job.targetCategory.name,
          }
        : null,
      searchText: job.searchText,
      status: job.status,
      totalFound: job.totalFound,
      totalImported: job.totalImported,
      totalUpdated: job.totalUpdated,
      totalFailed: job.totalFailed,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      finishedAt: job.finishedAt,
    };
  }

  public static toResponseList(
    jobs: ScrapeJobEntity[],
  ): ScrapeJobResponseDto[] {
    return jobs.map((job) => this.toResponse(job));
  }
}
