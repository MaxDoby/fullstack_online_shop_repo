import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { toSearchTokens } from '../utils/scraper-common.utils';

@Injectable()
export class ProductLinkExtractor {
  public extractProductLinks(
    html: string,
    baseUrl: string,
    query: string,
  ): string[] {
    const $ = cheerio.load(html);
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
        const directText = [
          $(element).text(),
          $(element).find('img').attr('alt'),
        ].join(' ');
        const cardText = [directText, card.text()].join(' ');
        const score = this.scoreCandidate({
          url: absoluteUrl,
          directText,
          cardText,
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

  private scoreCandidate(params: {
    url: string;
    directText: string;
    cardText: string;
    queryTokens: string[];
  }): number {
    const { url, directText, cardText, queryTokens } = params;
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.toLowerCase();
    const directTextTokens = toSearchTokens(directText);
    const cardTextTokens = toSearchTokens(cardText);
    const pathTokens = toSearchTokens(path);
    const primaryTokens = [...pathTokens, ...directTextTokens];

    if (this.isBlockedPath(path)) return 0;

    const matchedQueryTokens = queryTokens.filter((queryToken) =>
      primaryTokens.some((token) => this.tokenMatches(token, queryToken)),
    ).length;
    const requiredQueryMatches = Math.min(queryTokens.length, 2);
    const hasProductTextSignal = directTextTokens.length >= 3;
    const hasPriceSignal = /\d[\d\s.,]*(lei|mdl|ron|eur)/i.test(cardText);

    if (matchedQueryTokens < requiredQueryMatches) return 0;

    let score = 0;

    if (hasPriceSignal) score += 25;
    if (hasProductTextSignal) score += 15;

    score += matchedQueryTokens * 15;
    score += this.scorePrimaryQueryTokenPosition({
      pathTokens,
      textTokens:
        directTextTokens.length > 0 ? directTextTokens : cardTextTokens,
      queryTokens,
    });

    return score;
  }

  private scorePrimaryQueryTokenPosition(params: {
    pathTokens: string[];
    textTokens: string[];
    queryTokens: string[];
  }): number {
    const { pathTokens, textTokens, queryTokens } = params;
    const [primaryQueryToken] = queryTokens;

    if (!primaryQueryToken) return 0;

    if (this.tokenMatches(pathTokens[0] ?? '', primaryQueryToken)) return 80;
    if (this.tokenMatches(textTokens[0] ?? '', primaryQueryToken)) return 60;

    const pathTokenIndex = pathTokens.findIndex((token) =>
      this.tokenMatches(token, primaryQueryToken),
    );
    const textTokenIndex = textTokens.findIndex((token) =>
      this.tokenMatches(token, primaryQueryToken),
    );

    if (pathTokenIndex > 0 && pathTokenIndex <= 3) return 25;
    if (textTokenIndex > 0 && textTokenIndex <= 3) return 20;

    return 0;
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
