import { Injectable } from '@nestjs/common';
import type { StartScrapeJobDto } from '../dto/start-scrape-job.dto';
import type { RawScrapedProduct } from '../interfaces/raw-scraped-product.interface';
import {
  hasProductPathSignal,
  toSearchTokens,
} from '../utils/scraper-common.utils';

const minimumProductImagesCount = 3;

@Injectable()
export class ProductValidationPipeline {
  public matchesFilters(
    product: RawScrapedProduct,
    params: StartScrapeJobDto,
  ): boolean {
    return (
      this.hasUsableTitle(product) &&
      this.hasUsableImages(product) &&
      this.matchesSearchText(product, params.searchText) &&
      this.hasProductSourceUrl(product.sourceUrl) &&
      !this.hasBlockedNonProductTitle(product.title) &&
      !this.isBlockedNonProductUrl(product.sourceUrl)
    );
  }

  private hasUsableTitle(product: RawScrapedProduct): boolean {
    return product.title.trim().length >= 3;
  }

  private hasUsableImages(product: RawScrapedProduct): boolean {
    return (product.imageUrls ?? []).length >= minimumProductImagesCount;
  }

  private matchesSearchText(
    product: RawScrapedProduct,
    searchText: string,
  ): boolean {
    const queryTokens = toSearchTokens(searchText).filter(
      (token) => token.length >= 3,
    );

    if (queryTokens.length === 0) return true;

    const productTokens = toSearchTokens(
      [
        product.title,
        product.description,
        product.sourceUrl,
        product.categoryPath?.join(' '),
      ]
        .filter(Boolean)
        .join(' '),
    );

    const matchedTokensCount = queryTokens.filter((queryToken) =>
      productTokens.some((productToken) => productToken.includes(queryToken)),
    ).length;

    if (queryTokens.length === 2) {
      const [, specificQueryToken] = queryTokens;

      return productTokens.some((productToken) =>
        productToken.includes(specificQueryToken),
      );
    }

    const requiredMatchesCount = queryTokens.length >= 3 ? 2 : 1;

    return matchedTokensCount >= requiredMatchesCount;
  }

  private hasProductSourceUrl(sourceUrl: string): boolean {
    try {
      return hasProductPathSignal(new URL(sourceUrl).pathname);
    } catch {
      return false;
    }
  }

  private hasBlockedNonProductTitle(title: string): boolean {
    const normalizedTitle = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    return [
      'awards and reviews',
      'category',
      'deals',
      'filter',
      'livrare',
      'pagina solicitata nu a fost gasita',
      'pick-up',
      'search results',
    ].some((blockedTitle) => normalizedTitle.includes(blockedTitle));
  }

  private isBlockedNonProductUrl(sourceUrl: string): boolean {
    try {
      const url = new URL(sourceUrl);
      const path = url.pathname.toLowerCase();

      if (path === '/' || path === '') return true;

      return [
        '/account',
        '/about',
        '/award',
        '/blog',
        '/cart',
        '/catalogsearch',
        '/category',
        '/categories',
        '/cauta',
        '/cautare',
        '/checkout',
        '/compare',
        '/contacts',
        '/delivery',
        '/faq',
        '/filter',
        '/help',
        '/livrare',
        '/login',
        '/news',
        '/payment',
        '/privacy',
        '/promo',
        '/register',
        '/return',
        '/review',
        '/search',
        '/support',
        '/terms',
        '/why',
        '/wishlist',
      ].some((blockedPath) => path.includes(blockedPath));
    } catch {
      return true;
    }
  }
}
