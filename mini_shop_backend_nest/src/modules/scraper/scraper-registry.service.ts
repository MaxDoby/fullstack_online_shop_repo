import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { SCRAPER_ADAPTERS } from './constants/scraper-adapters.token';
import type { ScraperAdapter } from './interfaces/scraper-adapter.interface';

@Injectable()
export class ScraperRegistryService {
  public constructor(
    @Inject(SCRAPER_ADAPTERS)
    private readonly adapters: ScraperAdapter[],
  ) {}

  public getAdapter(sourceWebsite: string): ScraperAdapter {
    const adapter = this.adapters.find((currentAdapter) =>
      currentAdapter.canHandle(sourceWebsite),
    );

    if (!adapter) {
      throw new BadRequestException(
        `Unsupported scraper source: ${sourceWebsite}`,
      );
    }

    return adapter;
  }
}
