import { ApiProperty } from '@nestjs/swagger';

export class ProductCategoryResponseDto {
  @ApiProperty({
    description: 'Category ID.',
    example: 1,
  })
  public readonly id!: number;

  @ApiProperty({
    description: 'Category name.',
    example: 'smartphones',
  })
  public readonly name!: string;
}

export class ProductImageResponseDto {
  @ApiProperty({
    description: 'Product image ID.',
    example: 1,
  })
  public readonly id!: number;
}

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product ID.',
    example: 1,
  })
  public readonly id!: number;

  @ApiProperty({
    description: 'Product title.',
    example: 'iPhone 15 Pro',
  })
  public readonly title!: string;

  @ApiProperty({
    description: 'Product description.',
    example: 'Apple smartphone with high performance chipset.',
  })
  public readonly description!: string;

  @ApiProperty({
    description: 'Product price.',
    example: 999.99,
  })
  public readonly price!: number;

  @ApiProperty({
    description: 'Available product stock.',
    example: 25,
  })
  public readonly stock!: number;

  @ApiProperty({
    description: 'Product thumbnail URL.',
    example: 'https://example.com/image.jpg',
  })
  public readonly thumbnail!: string;

  @ApiProperty({
    description: 'Product category.',
    type: ProductCategoryResponseDto,
  })
  public readonly category!: ProductCategoryResponseDto;

  @ApiProperty({
    description: 'Product images attached to this product.',
    type: [ProductImageResponseDto],
  })
  public readonly productImages!: ProductImageResponseDto[];
}
