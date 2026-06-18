import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { ScraperHttpClient } from '../http/scraper-http.client';
import { SourceSearchConfigService } from '../config/source-search.config';
import { PlaywrightSearchStrategy } from '../strategies/playwright-search.strategy';

@Injectable()
export class SearchDiscoveryService {
  public constructor(
    private readonly scraperHttpClient: ScraperHttpClient,
    private readonly sourceSearchConfigService: SourceSearchConfigService,
    private readonly playwrightSearchStrategy: PlaywrightSearchStrategy,
  ) {}

  public async discoverSearchUrls(
    sourceBaseUrl: string,
    query: string,
  ): Promise<string[]> {
    const baseUrl = this.normalizeBaseUrl(sourceBaseUrl);
    const browserDiscoveredUrl = await this.discoverBrowserSearchUrl(
      baseUrl,
      query,
    );
    const configuredUrls =
      this.sourceSearchConfigService.buildSearchUrlCandidates(baseUrl, query);

    try {
      const homepageHtml = await this.scraperHttpClient.getText(baseUrl);
      const $ = cheerio.load(homepageHtml);
      const formSearchUrl = this.findSearchFormUrl($, baseUrl, query);
      const urls = [
        browserDiscoveredUrl,
        formSearchUrl,
        ...configuredUrls,
      ].filter((url): url is string => Boolean(url));

      return [...new Set(urls)];
    } catch {
      return [
        ...new Set(
          [browserDiscoveredUrl, ...configuredUrls].filter(
            (url): url is string => Boolean(url),
          ),
        ),
      ];
    }
  }

  public async discoverPrimarySearchUrl(
    sourceBaseUrl: string,
    query: string,
  ): Promise<string> {
    const [searchUrl] = await this.discoverSearchUrls(sourceBaseUrl, query);

    if (!searchUrl) {
      throw new Error('Could not discover search URL for source.');
    }

    return searchUrl;
  }

  private findSearchFormUrl(
    $: cheerio.CheerioAPI,
    baseUrl: string,
    query: string,
  ): string | null {
    const forms = $('form').toArray();

    for (const form of forms) {
      const currentForm = $(form);
      const input = currentForm
        .find('input')
        .toArray()
        .find((inputElement) => this.isSearchInput($, inputElement));

      if (!input) continue;

      const inputName = $(input).attr('name');

      if (!inputName) continue;

      const action = currentForm.attr('action') ?? '/search';
      const searchUrl = new URL(action, baseUrl);

      searchUrl.searchParams.set(inputName, query);

      return searchUrl.href;
    }

    return null;
  }

  private isSearchInput($: cheerio.CheerioAPI, inputElement: AnyNode): boolean {
    const input = $(inputElement);

    const type = input.attr('type')?.toLowerCase() ?? '';
    const name = input.attr('name')?.toLowerCase() ?? '';
    const placeholder = input.attr('placeholder')?.toLowerCase() ?? '';
    const ariaLabel = input.attr('aria-label')?.toLowerCase() ?? '';

    return (
      type === 'search' ||
      name.includes('search') ||
      name.includes('query') ||
      name.includes('keyword') ||
      name === 'q' ||
      placeholder.includes('search') ||
      placeholder.includes('find') ||
      ariaLabel.includes('search')
    );
  }

  private normalizeBaseUrl(sourceBaseUrl: string): string {
    return sourceBaseUrl.endsWith('/')
      ? sourceBaseUrl.slice(0, -1)
      : sourceBaseUrl;
  }

  private discoverBrowserSearchUrl(
    baseUrl: string,
    query: string,
  ): Promise<string | null> {
    return this.playwrightSearchStrategy.discoverSearchResultUrl({
      baseUrl,
      query,
    });
  }
}
