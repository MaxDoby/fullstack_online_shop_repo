import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { type AxiosInstance } from 'axios';
import https from 'https';

interface ScraperBinaryResponse {
  body: Buffer;
  contentType: string;
  size: number;
}

const requestTimeoutMs = 15000;
const requestDelayMs = 500;
const retryAttempts = 2;

@Injectable()
export class ScraperHttpClient {
  private readonly client: AxiosInstance;
  private readonly insecureImageHosts: Set<string>;
  private readonly insecureHttpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  public constructor(configService: ConfigService) {
    this.insecureImageHosts = new Set(
      (configService.get<string>('SCRAPER_INSECURE_IMAGE_HOSTS') ?? '')
        .split(',')
        .map((host) => host.trim())
        .filter(Boolean),
    );

    this.client = axios.create({
      timeout: requestTimeoutMs,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 MiniShopScraper/1.0',
      },
    });
  }

  public async getText(url: string): Promise<string> {
    return this.withRetry(async () => {
      const response = await this.client.get<string>(url, {
        responseType: 'text',
        validateStatus: (status) => status < 500,
        headers: {
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      return response.data;
    });
  }

  public async getBuffer(url: string): Promise<ScraperBinaryResponse> {
    return this.withRetry(async () => {
      const response = await this.client.get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
        httpsAgent: this.getImageHttpsAgent(url),
        headers: {
          Accept: 'image/*,*/*;q=0.8',
        },
      });

      const body = Buffer.from(response.data);
      const rawContentType = response.headers['content-type'];
      const contentType =
        typeof rawContentType === 'string' ? rawContentType : '';

      return {
        body,
        contentType,
        size: body.length,
      };
    });
  }

  private async waitBeforeRequest(): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, requestDelayMs);
    });
  }

  private getImageHttpsAgent(url: string): https.Agent | undefined {
    const hostName = new URL(url).hostname;

    return this.insecureImageHosts.has(hostName)
      ? this.insecureHttpsAgent
      : undefined;
  }

  private async withRetry<T>(request: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= retryAttempts; attempt += 1) {
      try {
        await this.waitBeforeRequest();
        return await request();
      } catch (error) {
        lastError = error;

        if (attempt === retryAttempts) break;
      }
    }

    if (lastError instanceof Error) throw lastError;

    throw new Error('Unknown scraper request error.');
  }
}
