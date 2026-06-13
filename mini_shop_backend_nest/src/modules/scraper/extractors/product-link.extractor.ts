import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';

@Injectable()
export class ProductLinkExtractor {
  public extractProductLinks(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const links = $('a[href]')
      .toArray()
      .map((element) => {
        const href = $(element).attr('href');

        return href ? this.toAbsoluteUrl(href, baseUrl) : null;
      })
      .filter((url): url is string => {
        if (!url) return false;

        return this.isInternalUrl(url, baseUrl);
      });

    return [...new Set(links)];
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
