import type { ScrapeJobResponseDto } from '../dto/scrape-job-response.dto';

type ScrapeJobEntity = {
  id: number;
  sourceWebsite: string;
  sourceBaseUrl: string;
  manufacturer: string | null;
  productType: string | null;
  model: string | null;
  description: string | null;
  searchText: string | null;
  minPrice: number | null;
  maxPrice: number | null;
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
      manufacturer: job.manufacturer,
      productType: job.productType,
      model: job.model,
      description: job.description,
      searchText: job.searchText,
      minPrice: job.minPrice,
      maxPrice: job.maxPrice,
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
