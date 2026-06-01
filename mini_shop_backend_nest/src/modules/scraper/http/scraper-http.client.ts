import { Injectable } from '@nestjs/common';

@Injectable()
export class ScraperHttpClient {
  public async getText(url: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; MiniShopScraper/1.0; +https://example.com)',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}. Status: ${response.status}`);
      }

      return response.text();
    } finally {
      clearTimeout(timeout);
    }
  }
}
