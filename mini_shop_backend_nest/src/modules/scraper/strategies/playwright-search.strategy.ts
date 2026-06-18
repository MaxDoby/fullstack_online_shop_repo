import { Injectable, Logger } from '@nestjs/common';
import { chromium, type Browser, type Page, type Response } from 'playwright';
import { toSearchTokens } from '../utils/scraper-common.utils';

interface PlaywrightSearchParams {
  baseUrl: string;
  query: string;
  searchUrl?: string;
}

const browserTimeoutMs = 15000;
const renderedContentWaitMs = 2500;
const maxExtractedUrls = 80;

@Injectable()
export class PlaywrightSearchStrategy {
  private readonly logger = new Logger(PlaywrightSearchStrategy.name);

  public async extractProductUrls(
    params: PlaywrightSearchParams,
  ): Promise<string[]> {
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
      const networkUrls = this.collectNetworkProductUrls(page, params);

      const urlsFromSearchPage = params.searchUrl
        ? await this.extractFromSearchPage(page, params.searchUrl, params)
        : [];

      if (urlsFromSearchPage.length > 0) {
        return this.uniqueUrls([...urlsFromSearchPage, ...networkUrls]);
      }

      const urlsFromUiSearch = await this.extractFromUiSearch(page, params);

      return this.uniqueUrls([...urlsFromUiSearch, ...networkUrls]);
    } catch (error) {
      this.logger.warn(
        `Playwright fallback failed. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return [];
    } finally {
      await browser?.close();
    }
  }

  public async discoverSearchResultUrl(
    params: Pick<PlaywrightSearchParams, 'baseUrl' | 'query'>,
  ): Promise<string | null> {
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

      await page.goto(params.baseUrl, {
        waitUntil: 'domcontentloaded',
        timeout: browserTimeoutMs,
      });

      const searchInput = await this.findSearchInput(page);

      if (!searchInput) return null;

      const initialUrl = page.url().split('#')[0];

      await searchInput.fill('');
      await searchInput.pressSequentially(params.query, {
        delay: 30,
      });
      await page.waitForTimeout(renderedContentWaitMs);

      const autocompleteUrl = this.changedUrl(initialUrl, page.url());

      if (autocompleteUrl) return autocompleteUrl;

      await Promise.all([
        page
          .waitForURL((url) => url.href.split('#')[0] !== initialUrl, {
            timeout: 5000,
          })
          .catch(() => undefined),
        searchInput.press('Enter'),
      ]);
      await this.waitForRenderedContent(page);

      const enteredUrl = this.changedUrl(initialUrl, page.url());

      if (enteredUrl) return enteredUrl;

      await searchInput.evaluate((input) => {
        if (input instanceof HTMLInputElement) {
          input.form?.requestSubmit();
        }
      });
      await page
        .waitForURL((url) => url.href.split('#')[0] !== initialUrl, {
          timeout: 5000,
        })
        .catch(() => undefined);
      await this.waitForRenderedContent(page);

      return this.changedUrl(initialUrl, page.url());
    } catch (error) {
      this.logger.warn(
        `Playwright search URL discovery failed. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return null;
    } finally {
      await browser?.close();
    }
  }

  private async extractFromSearchPage(
    page: Page,
    searchUrl: string,
    params: PlaywrightSearchParams,
  ): Promise<string[]> {
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: browserTimeoutMs,
    });
    await this.waitForRenderedContent(page);

    return this.extractFromRenderedPage(page, params);
  }

  private async extractFromUiSearch(
    page: Page,
    params: PlaywrightSearchParams,
  ): Promise<string[]> {
    await page.goto(params.baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: browserTimeoutMs,
    });

    const searchInput = await this.findSearchInput(page);

    if (!searchInput) {
      return [];
    }

    await searchInput.click();
    await searchInput.pressSequentially(params.query, {
      delay: 30,
    });
    await page.waitForTimeout(renderedContentWaitMs);

    const urlsFromAutocomplete = await this.extractFromRenderedPage(
      page,
      params,
    );

    if (urlsFromAutocomplete.length > 0) return urlsFromAutocomplete;

    await searchInput.press('Enter');

    await this.waitForRenderedContent(page);

    return this.extractFromRenderedPage(page, params);
  }

  private async extractFromRenderedPage(
    page: Page,
    params: PlaywrightSearchParams,
  ): Promise<string[]> {
    const urlsFromBrowser = await page.evaluate(
      ({ baseUrl, query }) => {
        const queryTokens = query
          .toLowerCase()
          .split(/[^a-z0-9]+/i)
          .filter(Boolean);
        const blockedPathSignals = [
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
          '/cautare',
          '/privacy',
          '/terms',
        ];
        return Array.from(
          document.querySelectorAll<HTMLAnchorElement>('a[href]'),
        )
          .map((anchor) => {
            const url = new URL(anchor.href, baseUrl);
            const normalizedPath = url.pathname.toLowerCase();
            const normalizedCurrentUrl = window.location.href.split('#')[0];
            const normalizedCandidateUrl = url.href.split('#')[0];
            const isRootUrl = normalizedPath === '/' || normalizedPath === '';
            const isCurrentPage =
              normalizedCandidateUrl === normalizedCurrentUrl;
            const isBlockedPath = blockedPathSignals.some((signal) =>
              normalizedPath.includes(signal),
            );

            if (
              url.origin !== new URL(baseUrl).origin ||
              isBlockedPath ||
              isRootUrl ||
              isCurrentPage
            ) {
              return null;
            }

            const card = anchor.closest(
              'article, li, [class*="product"], [class*="card"], [class*="item"], [data-product]',
            );
            const text = [
              anchor.textContent,
              anchor.querySelector('img')?.getAttribute('alt'),
              card?.textContent,
            ]
              .join(' ')
              .toLowerCase();
            const hasQuerySignal = queryTokens.some((token) =>
              text.includes(token),
            );
            const hasPriceSignal = /\d[\d\s.,]*(lei|mdl|ron|eur|€|\$)/i.test(
              text,
            );

            return hasQuerySignal || hasPriceSignal
              ? normalizedCandidateUrl
              : null;
          })
          .filter((url): url is string => Boolean(url));
      },
      {
        baseUrl: params.baseUrl,
        query: params.query,
      },
    );

    return this.uniqueUrls(urlsFromBrowser);
  }

  private collectNetworkProductUrls(
    page: Page,
    params: PlaywrightSearchParams,
  ): Set<string> {
    const urls = new Set<string>();
    const baseUrl = new URL(params.baseUrl);
    const queryTokens = toSearchTokens(params.query);

    page.on('response', (response) => {
      void this.extractUrlsFromNetworkResponse(
        response,
        baseUrl,
        queryTokens,
        urls,
      );
    });

    return urls;
  }

  private async extractUrlsFromNetworkResponse(
    response: Response,
    baseUrl: URL,
    queryTokens: string[],
    urls: Set<string>,
  ): Promise<void> {
    const contentType = response.headers()['content-type'] ?? '';

    if (!contentType.includes('application/json')) return;

    try {
      const data: unknown = await response.json();
      const values = this.flattenStringValues(data);

      for (const value of values) {
        const url = this.toInternalUrl(value, baseUrl);

        if (!url) continue;

        const textMatchesQuery = queryTokens.some((token) =>
          value.toLowerCase().includes(token),
        );

        if (textMatchesQuery) {
          urls.add(url.href.split('#')[0]);
        }
      }
    } catch {
      return;
    }
  }

  private flattenStringValues(value: unknown): string[] {
    if (typeof value === 'string') return [value];

    if (Array.isArray(value)) {
      return value.flatMap((item) => this.flattenStringValues(item));
    }

    if (typeof value === 'object' && value !== null) {
      return Object.values(value).flatMap((item) =>
        this.flattenStringValues(item),
      );
    }

    return [];
  }

  private toInternalUrl(value: string, baseUrl: URL): URL | null {
    try {
      const url = new URL(value, baseUrl);

      return url.origin === baseUrl.origin ? url : null;
    } catch {
      return null;
    }
  }

  private async waitForRenderedContent(page: Page): Promise<void> {
    await page
      .waitForLoadState('networkidle', {
        timeout: browserTimeoutMs,
      })
      .catch(() => undefined);
    await page.waitForTimeout(renderedContentWaitMs);
  }

  private uniqueUrls(urls: Iterable<string>): string[] {
    return [...new Set(urls)].slice(0, maxExtractedUrls);
  }

  private async findSearchInput(page: Page) {
    const searchInputs = page.locator(
      [
        'input[type="search"]',
        'input[name*="search"]',
        'input[name*="query"]',
        'input[name*="keyword"]',
        'input[name="q"]',
        'input[type="text"]',
      ].join(', '),
    );
    const inputCount = await searchInputs.count();

    for (let index = 0; index < inputCount; index += 1) {
      const searchInput = searchInputs.nth(index);
      const isVisible = await searchInput
        .isVisible({
          timeout: 1000,
        })
        .catch(() => false);

      if (isVisible) return searchInput;
    }

    return null;
  }

  private changedUrl(initialUrl: string, currentUrl: string): string | null {
    const normalizedCurrentUrl = currentUrl.split('#')[0];

    return normalizedCurrentUrl !== initialUrl ? normalizedCurrentUrl : null;
  }
}
