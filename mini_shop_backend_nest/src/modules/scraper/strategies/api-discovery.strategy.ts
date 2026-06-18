import { Injectable } from '@nestjs/common';
import type {
  ProductUrlExtractionParams,
  ProductUrlExtractionStrategy,
} from './scraper-strategy.interface';
import { hasProductPathSignal } from '../utils/scraper-common.utils';

@Injectable()
export class ApiDiscoveryStrategy implements ProductUrlExtractionStrategy {
  public extractProductUrls(params: ProductUrlExtractionParams): string[] {
    const baseUrl = new URL(params.baseUrl);
    const urls = new Set<string>();
    const urlLikeValues =
      params.html.match(/https?:\/\/[^"'\\\s<>]+|\/[^"'\\\s<>]+/g) ?? [];

    for (const value of urlLikeValues) {
      const normalizedUrl = this.normalizeUrl(value, baseUrl);

      if (normalizedUrl) urls.add(normalizedUrl);
    }

    return [...urls];
  }

  private normalizeUrl(value: string, baseUrl: URL): string | null {
    try {
      const url = new URL(value, baseUrl);

      if (url.origin !== baseUrl.origin) return null;
      if (!hasProductPathSignal(url.pathname)) return null;

      return url.href.split('#')[0];
    } catch {
      return null;
    }
  }
}
