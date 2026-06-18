import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import { ScraperHttpClient } from '../http/scraper-http.client';
import { ProductLinkExtractor } from '../extractors/product-link.extractor';
import type { DiscoveredSourceProfile } from '../interfaces/source-profile.interface';

const queryPlaceholder = '{{query}}';

@Injectable()
export class SourceProfileDiscoveryService {
  public constructor(
    private readonly scraperHttpClient: ScraperHttpClient,
    private readonly productLinkExtractor: ProductLinkExtractor,
  ) {}

  public async discoverFromExample(params: {
    sourceBaseUrl: string;
    exampleSearchUrl: string;
    exampleSearchTerm: string;
  }): Promise<DiscoveredSourceProfile> {
    const searchUrlTemplate = this.buildSearchUrlTemplate(
      params.exampleSearchUrl,
      params.exampleSearchTerm,
    );
    const html = await this.scraperHttpClient.getText(params.exampleSearchUrl);
    const productUrlCandidates = this.productLinkExtractor
      .extractProductLinks(html, params.sourceBaseUrl, params.exampleSearchTerm)
      .slice(0, 20);

    return {
      sourceBaseUrl: params.sourceBaseUrl,
      exampleSearchUrl: params.exampleSearchUrl,
      exampleSearchTerm: params.exampleSearchTerm,
      searchUrlTemplate,
      productUrlCandidates,
      productLinkSelector: this.detectProductLinkSelector(
        html,
        params.sourceBaseUrl,
        productUrlCandidates,
      ),
      confidenceScore: this.calculateConfidenceScore(productUrlCandidates),
    };
  }

  public buildSearchUrl(
    profile: DiscoveredSourceProfile,
    query: string,
  ): string {
    return profile.searchUrlTemplate.replace(
      queryPlaceholder,
      encodeURIComponent(query),
    );
  }

  private buildSearchUrlTemplate(
    exampleSearchUrl: string,
    exampleSearchTerm: string,
  ): string {
    const url = new URL(exampleSearchUrl);
    const term = exampleSearchTerm.trim();

    for (const [key, value] of url.searchParams.entries()) {
      if (this.containsSearchTerm(value, term)) {
        url.searchParams.set(key, queryPlaceholder);

        return this.decodeQueryPlaceholder(url.href);
      }
    }

    const queryParamKeys = [...url.searchParams.keys()];
    const lastQueryParamKey = queryParamKeys.at(-1);

    if (lastQueryParamKey) {
      url.searchParams.set(lastQueryParamKey, queryPlaceholder);

      return this.decodeQueryPlaceholder(url.href);
    }

    if (this.containsSearchTerm(url.pathname, term)) {
      url.pathname = url.pathname.replace(
        encodeURIComponent(term),
        queryPlaceholder,
      );

      return this.decodeQueryPlaceholder(url.href);
    }

    url.searchParams.set('q', queryPlaceholder);

    return this.decodeQueryPlaceholder(url.href);
  }

  private detectProductLinkSelector(
    html: string,
    sourceBaseUrl: string,
    productUrlCandidates: string[],
  ): string | undefined {
    if (productUrlCandidates.length === 0) return undefined;

    const $ = cheerio.load(html);
    const candidateSet = new Set(productUrlCandidates);
    const selectorScores = new Map<string, number>();

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      const absoluteUrl = href ? this.toAbsoluteUrl(href, sourceBaseUrl) : null;

      if (!absoluteUrl || !candidateSet.has(absoluteUrl)) return;

      const selector = this.buildStableLinkSelector($, element);

      if (!selector) return;

      selectorScores.set(selector, (selectorScores.get(selector) ?? 0) + 1);
    });

    return [...selectorScores.entries()].sort(
      (first, second) => second[1] - first[1],
    )[0]?.[0];
  }

  private buildStableLinkSelector(
    $: cheerio.CheerioAPI,
    element: AnyNode,
  ): string | undefined {
    const link = $(element);
    const parent = link.parent();
    const linkClass = this.firstClassName(link.attr('class'));
    const parentClass = this.firstClassName(parent.attr('class'));

    if (parentClass && linkClass) return `.${parentClass} a.${linkClass}`;
    if (parentClass) return `.${parentClass} a[href]`;
    if (linkClass) return `a.${linkClass}`;

    return 'a[href]';
  }

  private firstClassName(className?: string): string | undefined {
    return className
      ?.split(/\s+/)
      .map((value) => value.trim())
      .find((value) => value.length > 0);
  }

  private calculateConfidenceScore(productUrlCandidates: string[]): number {
    if (productUrlCandidates.length >= 10) return 90;
    if (productUrlCandidates.length >= 5) return 75;
    if (productUrlCandidates.length >= 2) return 55;
    if (productUrlCandidates.length === 1) return 35;

    return 10;
  }

  private containsSearchTerm(value: string, searchTerm: string): boolean {
    return decodeURIComponent(value)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  }

  private decodeQueryPlaceholder(value: string): string {
    return value.replace(
      encodeURIComponent(queryPlaceholder),
      queryPlaceholder,
    );
  }

  private toAbsoluteUrl(href: string, baseUrl: string): string | null {
    try {
      return new URL(href, baseUrl).href.split('#')[0];
    } catch {
      return null;
    }
  }
}
