import { Injectable, Logger } from '@nestjs/common';
import { chromium, type Browser } from 'playwright';
import type { RawScrapedProduct } from '../interfaces/raw-scraped-product.interface';
import { parsePriceText, toSearchTokens } from '../utils/scraper-common.utils';

const browserTimeoutMs = 15000;
const renderedContentWaitMs = 1500;
const maxImages = 8;

interface RenderedProductData {
  title: string | null;
  description: string | null;
  priceTexts: string[];
  imageUrls: string[];
  categoryPath: string[];
}

@Injectable()
export class PlaywrightProductExtractor {
  private readonly logger = new Logger(PlaywrightProductExtractor.name);

  public async extract(sourceUrl: string): Promise<RawScrapedProduct | null> {
    let browser: Browser | undefined;

    try {
      browser = await chromium.launch({
        headless: true,
      });

      const page = await browser.newPage({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 MiniShopScraper/1.0',
        viewport: {
          width: 1366,
          height: 768,
        },
      });

      await page.goto(sourceUrl, {
        waitUntil: 'domcontentloaded',
        timeout: browserTimeoutMs,
      });
      await page
        .waitForLoadState('networkidle', {
          timeout: browserTimeoutMs,
        })
        .catch(() => undefined);
      await page.waitForTimeout(renderedContentWaitMs);

      const data = await page.evaluate(
        ({ maxImages }) => {
          const normalizeText = (value: string | null | undefined) => {
            const normalized = value?.replace(/\s+/g, ' ').trim();

            return normalized && normalized.length > 0 ? normalized : null;
          };
          const title =
            normalizeText(document.querySelector('h1')?.textContent) ??
            normalizeText(document.title);
          const bodyText = normalizeText(document.body.innerText) ?? '';
          const priceElementTexts = Array.from(
            document.querySelectorAll(
              '[class*="price" i], [id*="price" i], [data-price], [aria-label*="price" i]',
            ),
          )
            .map((element) => normalizeText(element.textContent))
            .filter((value): value is string => Boolean(value));
          const priceMatches = Array.from(
            bodyText.matchAll(/(\d[\d\s.,]*)\s*(lei|mdl|ron|eur|€)/gi),
          ).map((match) => match[0]);
          const genericPriceMatches = Array.from(
            bodyText.matchAll(
              /(?:[$£€]\s*\d[\d\s.,]*|\d[\d\s.,]*\s*(?:lei|mdl|ron|eur|gbp|usd))/gi,
            ),
          ).map((match) => match[0]);
          const breadcrumbs = Array.from(
            document.querySelectorAll(
              '[aria-label*="breadcrumb" i] a, nav a, [class*="breadcrumb" i] a',
            ),
          )
            .map((element) => normalizeText(element.textContent))
            .filter((value): value is string => Boolean(value))
            .slice(0, 8);
          const titleTokens =
            title
              ?.toLowerCase()
              .split(/[^a-z0-9]+/i)
              .filter((token) => token.length >= 3) ?? [];
          const images = Array.from(document.images)
            .map((image) => ({
              src: image.currentSrc || image.src,
              alt: image.alt,
            }))
            .filter((image) => {
              if (!image.src || image.src.startsWith('data:')) return false;

              const alt = image.alt.toLowerCase();

              return titleTokens.some((token) => alt.includes(token));
            })
            .map((image) => image.src)
            .filter((src, index, list) => list.indexOf(src) === index)
            .slice(0, maxImages);

          return {
            title,
            description:
              normalizeText(
                document
                  .querySelector('meta[name="description"]')
                  ?.getAttribute('content'),
              ) ?? title,
            priceTexts: [
              ...priceElementTexts,
              ...genericPriceMatches,
              ...priceMatches,
            ],
            imageUrls: images,
            categoryPath:
              breadcrumbs.length > 0 ? breadcrumbs : ['Uncategorized'],
          };
        },
        {
          maxImages,
        },
      );

      return this.toRawProduct(sourceUrl, data);
    } catch (error) {
      this.logger.warn(
        `Playwright product extraction failed for ${sourceUrl}. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return null;
    } finally {
      await browser?.close();
    }
  }

  private toRawProduct(
    sourceUrl: string,
    data: RenderedProductData,
  ): RawScrapedProduct | null {
    if (!data.title || data.imageUrls.length === 0) {
      return null;
    }

    const priceText = data.priceTexts.find((value) => parsePriceText(value));
    const price = priceText ? parsePriceText(priceText) : undefined;

    return {
      title: data.title,
      sourceUrl,
      sourceWebsite: new URL(sourceUrl).hostname,
      price: price ?? 0,
      priceText,
      manufacturerName: this.extractManufacturer(data.title),
      categoryPath: data.categoryPath,
      description: data.description ?? data.title,
      imageUrls: data.imageUrls,
    };
  }

  private extractManufacturer(title: string): string | undefined {
    return toSearchTokens(title)[1]?.toUpperCase();
  }
}
