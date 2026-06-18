import { Injectable, Logger } from '@nestjs/common';
import type { StartScrapeJobDto } from '../dto/start-scrape-job.dto';
import { SearchDiscoveryService } from '../discovery/search-discovery.service';

export interface SearchDiscoveryResult {
  query: string;
  searchUrls: string[];
}

@Injectable()
export class SearchDiscoveryPipeline {
  private readonly logger = new Logger(SearchDiscoveryPipeline.name);

  public constructor(
    private readonly searchDiscoveryService: SearchDiscoveryService,
  ) {}

  public async discover(
    params: StartScrapeJobDto,
  ): Promise<SearchDiscoveryResult[]> {
    const searchQueries = this.buildSearchQueries(params);

    return Promise.all(
      searchQueries.map(async (query) => ({
        query,
        searchUrls: await this.buildSearchUrls(params, query),
      })),
    );
  }

  private async buildSearchUrls(
    params: StartScrapeJobDto,
    query: string,
  ): Promise<string[]> {
    const discoveredUrls = await this.searchDiscoveryService.discoverSearchUrls(
      params.sourceBaseUrl,
      query,
    );

    return [...new Set(discoveredUrls)];
  }

  private buildSearchQueries(params: StartScrapeJobDto): string[] {
    const query = params.searchText.trim();

    return query ? [query] : [];
  }
}
