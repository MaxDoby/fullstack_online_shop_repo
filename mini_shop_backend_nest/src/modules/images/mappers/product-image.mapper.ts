import type { ProductImageResponseDto } from '../dto/product-image-response.dto';

type ProductImageEntity = {
  id: number;
  productId: number;
  storageKey: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  isPrimary: boolean;
  createdAt: Date;
};

export class ProductImageMapper {
  public static toResponse(image: ProductImageEntity): ProductImageResponseDto {
    return {
      id: image.id,
      productId: image.productId,
      storageKey: image.storageKey,
      originalName: image.originalName,
      mimeType: image.mimeType,
      size: image.size,
      width: image.width,
      height: image.height,
      isPrimary: image.isPrimary,
      createdAt: image.createdAt,
    };
  }

  public static toResponseList(
    images: ProductImageEntity[],
  ): ProductImageResponseDto[] {
    return images.map((image) => this.toResponse(image));
  }
}
