import { Injectable, Logger } from '@nestjs/common';
import type { StartScrapeJobDto } from '../dto/start-scrape-job.dto';
import { SearchDiscoveryService } from '../discovery/search-discovery.service';
import { SourceProfileDiscoveryService } from '../discovery/source-profile-discovery.service';
import type { DiscoveredSourceProfile } from '../interfaces/source-profile.interface';

export type SearchDiscoveryParams = StartScrapeJobDto & {
  sourceProfile?: DiscoveredSourceProfile | null;
};

export interface SearchDiscoveryResult {
  query: string;
  searchUrls: string[];
  productLinkSelector?: string;
}

@Injectable()
export class SearchDiscoveryPipeline {
  private readonly logger = new Logger(SearchDiscoveryPipeline.name);

  public constructor(
    private readonly searchDiscoveryService: SearchDiscoveryService,
    private readonly sourceProfileDiscoveryService: SourceProfileDiscoveryService,
  ) {}

  public async discover(
    params: SearchDiscoveryParams,
  ): Promise<SearchDiscoveryResult[]> {
    const searchQueries = this.buildSearchQueries(params);
    const sourceProfile =
      params.sourceProfile ?? (await this.discoverSourceProfile(params));

    return Promise.all(
      searchQueries.map(async (query) => ({
        query,
        searchUrls: await this.buildSearchUrls(params, query, sourceProfile),
        productLinkSelector: sourceProfile?.productLinkSelector,
      })),
    );
  }

  private async discoverSourceProfile(
    params: StartScrapeJobDto,
  ): Promise<DiscoveredSourceProfile | null> {
    if (!params.exampleSearchUrl || !params.exampleSearchTerm) return null;

    try {
      const sourceProfile =
        await this.sourceProfileDiscoveryService.discoverFromExample({
          sourceBaseUrl: params.sourceBaseUrl,
          exampleSearchUrl: params.exampleSearchUrl,
          exampleSearchTerm: params.exampleSearchTerm,
        });

      this.logger.log(
        `Source profile discovered with confidence ${sourceProfile.confidenceScore}.`,
      );

      return sourceProfile;
    } catch (error) {
      this.logger.warn(
        `Source profile discovery failed. Falling back to generic search discovery. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return null;
    }
  }

  private async buildSearchUrls(
    params: StartScrapeJobDto,
    query: string,
    sourceProfile: DiscoveredSourceProfile | null,
  ): Promise<string[]> {
    if (sourceProfile) {
      return [
        this.sourceProfileDiscoveryService.buildSearchUrl(sourceProfile, query),
      ];
    }

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
