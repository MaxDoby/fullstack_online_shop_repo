import { Injectable } from '@nestjs/common';
import type { StartScrapeJobDto } from '../dto/start-scrape-job.dto';
import type { RawScrapedProduct } from '../interfaces/raw-scraped-product.interface';

@Injectable()
export class ProductValidationPipeline {
  public matchesFilters(
    product: RawScrapedProduct,
    params: StartScrapeJobDto,
  ): boolean {
    void params;

    return (
      this.hasUsableTitle(product) &&
      this.hasUsableImages(product) &&
      !this.hasBlockedNonProductTitle(product.title) &&
      !this.isBlockedNonProductUrl(product.sourceUrl)
    );
  }

  private hasUsableTitle(product: RawScrapedProduct): boolean {
    return product.title.trim().length >= 3;
  }

  private hasUsableImages(product: RawScrapedProduct): boolean {
    return (product.imageUrls ?? []).length > 0;
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
