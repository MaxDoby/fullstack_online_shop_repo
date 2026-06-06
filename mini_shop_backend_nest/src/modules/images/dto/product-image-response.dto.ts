import { ApiProperty } from '@nestjs/swagger';

export class ProductImageResponseDto {
  @ApiProperty({
    description: 'Unique product image identifier.',
    example: 1,
  })
  public readonly id!: number;

  @ApiProperty({
    description: 'Product identifier associated with this image.',
    example: 25,
  })
  public readonly productId!: number;

  @ApiProperty({
    description: 'Image key/path inside object storage.',
    example: 'products/25/1779275901363-Iphone17.jpg',
  })
  public readonly storageKey!: string;

  @ApiProperty({
    description: 'Original uploaded image file name.',
    example: 'Iphone17.jpg',
  })
  public readonly originalName!: string;

  @ApiProperty({
    description: 'Image MIME type.',
    example: 'image/jpeg',
  })
  public readonly mimeType!: string;

  @ApiProperty({
    description: 'Image file size in bytes.',
    example: 8778,
  })
  public readonly size!: number;

  @ApiProperty({
    description: 'Original image width in pixels.',
    example: 650,
  })
  public readonly width!: number;

  @ApiProperty({
    description: 'Original image height in pixels.',
    example: 366,
  })
  public readonly height!: number;

  @ApiProperty({
    description: 'Marks whether this image is the primary product image.',
    example: true,
  })
  public readonly isPrimary!: boolean;

  @ApiProperty({
    description: 'Image creation date.',
    example: '2026-06-06T10:00:00.000Z',
  })
  public readonly createdAt!: Date;
}
