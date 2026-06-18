import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { toSearchTokens } from '../utils/scraper-common.utils';

@Injectable()
export class ProductLinkExtractor {
  public extractProductLinks(
    html: string,
    baseUrl: string,
    query: string,
    productLinkSelector?: string,
  ): string[] {
    const $ = cheerio.load(html);
    const profileLinks = productLinkSelector
      ? this.extractLinksBySelector($, baseUrl, productLinkSelector)
      : [];

    if (profileLinks.length > 0) return profileLinks;

    const queryTokens = toSearchTokens(query);
    const links = $('a[href]')
      .toArray()
      .map((element) => {
        const href = $(element).attr('href');
        const absoluteUrl = href ? this.toAbsoluteUrl(href, baseUrl) : null;

        if (!absoluteUrl || !this.isInternalUrl(absoluteUrl, baseUrl)) {
          return null;
        }

        const card = $(element).closest(
          'article, li, [class*="product"], [class*="card"], [class*="item"], [data-product]',
        );
        const text = [
          $(element).text(),
          $(element).find('img').attr('alt'),
          card.text(),
        ].join(' ');
        const score = this.scoreCandidate({
          url: absoluteUrl,
          text,
          queryTokens,
        });

        return score > 0 ? { url: absoluteUrl, score } : null;
      })
      .filter((candidate): candidate is { url: string; score: number } =>
        Boolean(candidate),
      )
      .sort((first, second) => second.score - first.score);

    return [...new Set(links.map((candidate) => candidate.url))];
  }

  private extractLinksBySelector(
    $: cheerio.CheerioAPI,
    baseUrl: string,
    productLinkSelector: string,
  ): string[] {
    try {
      return [
        ...new Set(
          $(productLinkSelector)
            .toArray()
            .map((element) => {
              const href = $(element).attr('href');
              const absoluteUrl = href
                ? this.toAbsoluteUrl(href, baseUrl)
                : null;

              if (!absoluteUrl || !this.isInternalUrl(absoluteUrl, baseUrl)) {
                return null;
              }

              const path = new URL(absoluteUrl).pathname.toLowerCase();

              return this.isBlockedPath(path) ? null : absoluteUrl;
            })
            .filter((url): url is string => Boolean(url)),
        ),
      ];
    } catch {
      return [];
    }
  }

  private scoreCandidate(params: {
    url: string;
    text: string;
    queryTokens: string[];
  }): number {
    const { url, text, queryTokens } = params;
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.toLowerCase();
    const textTokens = toSearchTokens(text);
    const pathTokens = toSearchTokens(path);
    const allTokens = [...pathTokens, ...textTokens];

    if (this.isBlockedPath(path)) return 0;

    const matchedQueryTokens = queryTokens.filter((queryToken) =>
      allTokens.some((token) => this.tokenMatches(token, queryToken)),
    ).length;
    const hasProductTextSignal = textTokens.length >= 3;
    const hasPriceSignal = /\d[\d\s.,]*(lei|mdl|ron|eur|€)/i.test(text);

    if (matchedQueryTokens === 0 && !hasPriceSignal) return 0;

    let score = 0;

    if (hasPriceSignal) score += 25;
    if (hasProductTextSignal) score += 15;

    score += matchedQueryTokens * 15;

    return score;
  }

  private isBlockedPath(path: string): boolean {
    if (path === '/' || path === '') return true;

    return [
      '/cart',
      '/checkout',
      '/login',
      '/register',
      '/account',
      '/favorites',
      '/wishlist',
      '/compare',
      '/contacts',
      '/delivery',
      '/promo',
      '/blog',
      '/news',
      '/search',
      '/catalogsearch',
      '/category',
      '/categories',
      '/cauta',
      '/cautare',
      '/filter',
      '/privacy',
      '/terms',
    ].some((blockedPath) => path.includes(blockedPath));
  }

  private tokenMatches(valueToken: string, expectedToken: string): boolean {
    return (
      valueToken === expectedToken ||
      (expectedToken.length >= 5 && valueToken.startsWith(expectedToken))
    );
  }

  private isInternalUrl(url: string, baseUrl: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const parsedBaseUrl = new URL(baseUrl);

      return parsedUrl.origin === parsedBaseUrl.origin;
    } catch {
      return false;
    }
  }

  private toAbsoluteUrl(href: string, baseUrl: string): string | null {
    try {
      return new URL(href, baseUrl).href.split('#')[0];
    } catch {
      return null;
    }
  }
}
