import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { ScraperHttpClient } from '../http/scraper-http.client';

export interface SearchDiscoveryResult {
  searchUrl: string;
  method: 'GET';
}

@Injectable()
export class SearchDiscoveryService {
  public constructor(private readonly scraperHttpClient: ScraperHttpClient) {}

  public async discoverSearchUrl(
    sourceBaseUrl: string,
    query: string,
  ): Promise<SearchDiscoveryResult> {
    const baseUrl = this.normalizeBaseUrl(sourceBaseUrl);
    const homepageHtml = await this.scraperHttpClient.getText(baseUrl);
    const $ = cheerio.load(homepageHtml);

    const formResult = this.findSearchForm($, baseUrl, query);

    if (formResult) return formResult;

    return {
      searchUrl: this.buildFallbackSearchUrl(baseUrl, query),
      method: 'GET',
    };
  }

  private findSearchForm(
    $: cheerio.CheerioAPI,
    baseUrl: string,
    query: string,
  ): SearchDiscoveryResult | null {
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

      return {
        searchUrl: searchUrl.href,
        method: 'GET',
      };
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
      name === 'q' ||
      placeholder.includes('search') ||
      placeholder.includes('caut') ||
      ariaLabel.includes('search') ||
      ariaLabel.includes('caut')
    );
  }

  private buildFallbackSearchUrl(baseUrl: string, query: string): string {
    const searchUrl = new URL('/search', baseUrl);

    searchUrl.searchParams.set('search', query);

    return searchUrl.href;
  }

  private normalizeBaseUrl(sourceBaseUrl: string): string {
    return sourceBaseUrl.endsWith('/')
      ? sourceBaseUrl.slice(0, -1)
      : sourceBaseUrl;
  }
}
