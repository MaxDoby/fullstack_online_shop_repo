import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { createHash } from 'crypto';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { StorageService } from '../../../core/storage/storage.service';
import { ScraperHttpClient } from '../http/scraper-http.client';
import type { NormalizedProductImage } from '../interfaces/normalized-product.interface';

@Injectable()
export class ProductImageScrapeImporter {
  public constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly scraperHttpClient: ScraperHttpClient,
  ) {}

  public async importProductImages(
    productId: number,
    images: NormalizedProductImage[],
  ): Promise<{ imported: number; failed: number }> {
    if (images.length === 0) return { imported: 0, failed: 0 };

    let imported = 0;
    let failed = 0;

    for (const image of images) {
      try {
        await this.importSingleProductImage(productId, image, imported === 0);
        imported += 1;
      } catch (error) {
        console.error(
          'Scraped image import failed:',
          error instanceof Error ? error.message : error,
        );
        failed += 1;
        continue;
      }
    }

    return { imported, failed };
  }

  private async importSingleProductImage(
    productId: number,
    image: NormalizedProductImage,
    isPrimary: boolean,
  ): Promise<void> {
    const imageHash = createHash('sha256').update(image.url).digest('hex');
    const storageKey = `product/${productId}/scraped-${imageHash}`;

    const existingImage = await this.prisma.productImage.findFirst({
      where: {
        productId,
        storageKey,
      },
    });

    if (existingImage) return;

    const imageFile = await this.scraperHttpClient.getBuffer(image.url);
    const metadata = await sharp(imageFile.body).metadata();

    if (!metadata.width || !metadata.height || !metadata.format) {
      throw new BadRequestException('Invalid scraped image metadata.');
    }

    const mimeType = imageFile.contentType.startsWith('image/')
      ? imageFile.contentType
      : `image/${metadata.format}`;

    await this.storageService.uploadFile(storageKey, imageFile.body, mimeType);

    await this.prisma.productImage.create({
      data: {
        productId,
        storageKey,
        originalName: image.originalName ?? `scraped-${imageHash}`,
        mimeType,
        size: imageFile.size,
        width: metadata.width,
        height: metadata.height,
        isPrimary,
      },
    });
  }
}
