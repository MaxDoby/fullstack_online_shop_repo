import type {
  RawScrapedProduct,
  RawScrapedSpecificationGroup,
} from '../../interfaces/raw-scraped-product.interface';
import type { StartScrapeJobDto } from '../../dto/start-scrape-job.dto';
import {
  matchesUltraRequestedCategory,
  matchesUltraRequestedProduct,
} from './ultra-category.matcher';

interface UltraJsonLdProduct {
  '@type': string;
  name?: string;
  description?: string;
  sku?: string;
  mpn?: string;
  image?: string[];
  brand?: {
    name?: string;
  };
  offers?: {
    price?: string;
  };
}

interface UltraJsonLdBreadcrumbList {
  '@type': string;
  itemListElement?: UltraJsonLdBreadcrumbItem[];
}

interface UltraJsonLdBreadcrumbItem {
  name?: string;
}

export function parseUltraProductPage(
  html: string,
  productUrl: string,
  params: StartScrapeJobDto,
  sourceWebsite: string,
): RawScrapedProduct | null {
  if (!html.includes('<html')) {
    throw new Error('Ultra product page response is not valid HTML.');
  }

  const categoryPath = extractCategoryPathFromJsonLd(html);

  if (!matchesUltraRequestedCategory(categoryPath, params.productType)) {
    return null;
  }

  const productJsonLd = extractProductJsonLd(html);

  if (
    !matchesUltraRequestedProduct(
      productJsonLd.name ?? '',
      categoryPath,
      params.productType,
    )
  ) {
    return null;
  }

  const specificationGroups = extractSpecificationGroups(html);

  return {
    title: productJsonLd.name ?? 'Untitled Ultra product',
    sourceWebsite,
    sourceUrl: productUrl,
    priceText: productJsonLd.offers?.price,
    manufacturerName: productJsonLd.brand?.name,
    categoryPath: params.productType ? [params.productType] : categoryPath,
    description: productJsonLd.description,
    imageUrls: productJsonLd.image ?? [],
    externalId: productJsonLd.sku,
    externalProductCode: productJsonLd.mpn,
    externalArticle: productJsonLd.sku,
    variants: [],
    specificationGroups,
  };
}

export function isMissingUltraProductJsonLdError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message === 'Ultra product page does not contain Product JSON-LD.'
  );
}

function extractProductJsonLd(html: string): UltraJsonLdProduct {
  for (const parsed of parseJsonLdScripts<UltraJsonLdProduct>(html)) {
    if (parsed['@type'] === 'Product') return parsed;
  }

  throw new Error('Ultra product page does not contain Product JSON-LD.');
}

function extractCategoryPathFromJsonLd(html: string): string[] {
  for (const parsed of parseJsonLdScripts<UltraJsonLdBreadcrumbList>(html)) {
    if (parsed['@type'] === 'BreadcrumbList') {
      const breadcrumbNames = (parsed.itemListElement ?? [])
        .map((item) => item.name)
        .filter((name): name is string => Boolean(name));

      return breadcrumbNames.slice(0, -1);
    }
  }

  return ['Ultra product'];
}

function parseJsonLdScripts<T>(html: string): T[] {
  const jsonLdMatches = [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
  ];

  return jsonLdMatches.map((match) => JSON.parse(match[1]) as T);
}

function extractSpecificationGroups(
  html: string,
): RawScrapedSpecificationGroup[] {
  const specCardMatches = [
    ...html.matchAll(/<section class="spec-card card">([\s\S]*?)<\/section>/g),
  ];

  return specCardMatches
    .map((cardMatch) => {
      const cardHtml = cardMatch[1];
      const title = extractFirstTextByClass(cardHtml, 'spec-card__title');
      const rowMatches = [
        ...cardHtml.matchAll(/<div class="spec-card__row">([\s\S]*?)<\/div>/g),
      ];

      return {
        name: title || 'Specifications',
        specifications: rowMatches
          .map((rowMatch) => {
            const rowHtml = rowMatch[1];
            const name = extractFirstTextByClass(rowHtml, 'spec-card__key');
            const value = extractFirstTextByClass(rowHtml, 'spec-card__value');

            if (!name || !value) return null;

            return { name, value };
          })
          .filter((item): item is { name: string; value: string } =>
            Boolean(item),
          ),
      };
    })
    .filter((group) => group.specifications.length > 0);
}

function extractFirstTextByClass(html: string, className: string): string {
  const match = html.match(
    new RegExp(
      `<[^>]*class="[^"]*${className}[^"]*"[^>]*>([\\s\\S]*?)<\\/[^>]+>`,
    ),
  );

  return match ? cleanText(match[1]) : '';
}

function cleanText(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
