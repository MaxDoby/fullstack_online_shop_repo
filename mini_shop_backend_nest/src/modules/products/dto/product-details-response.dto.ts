import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ProductCategoryResponseDto,
  ProductImageResponseDto,
} from './product-response.dto';

export class ProductManufacturerResponseDto {
  @ApiProperty({
    description: 'Manufacturer ID.',
    example: 1,
  })
  public readonly id!: number;

  @ApiProperty({
    description: 'Manufacturer name.',
    example: 'Apple',
  })
  public readonly name!: string;

  @ApiProperty({
    description: 'Manufacturer slug.',
    example: 'apple',
  })
  public readonly slug!: string;
}

export class ProductSpecificationResponseDto {
  @ApiProperty({
    description: 'Specification ID.',
    example: 1,
  })
  public readonly id!: number;

  @ApiProperty({
    description: 'Specification name.',
    example: 'Display',
  })
  public readonly name!: string;

  @ApiProperty({
    description: 'Specification value.',
    example: '6.1 inch',
  })
  public readonly value!: string;

  @ApiPropertyOptional({
    description: 'Specification unit.',
    example: 'inch',
  })
  public readonly unit?: string | null;
}

export class ProductSpecificationGroupResponseDto {
  @ApiProperty({
    description: 'Specification group ID.',
    example: 1,
  })
  public readonly id!: number;

  @ApiProperty({
    description: 'Specification group name.',
    example: 'Display',
  })
  public readonly name!: string;

  @ApiProperty({
    description: 'Display order of the specification group.',
    example: 1,
  })
  public readonly order!: number;

  @ApiProperty({
    description: 'Specifications inside this group.',
    type: [ProductSpecificationResponseDto],
  })
  public readonly specifications!: ProductSpecificationResponseDto[];
}

export class ProductVariantResponseDto {
  @ApiProperty({
    description: 'Variant ID.',
    example: 1,
  })
  public readonly id!: number;

  @ApiProperty({
    description: 'Variant name.',
    example: 'Color',
  })
  public readonly name!: string;

  @ApiProperty({
    description: 'Variant value.',
    example: 'Black',
  })
  public readonly value!: string;
}

export class ProductSourceResponseDto {
  @ApiProperty({
    description: 'Product source ID.',
    example: 1,
  })
  public readonly id!: number;

  @ApiProperty({
    description: 'Source website.',
    example: 'ultra.md',
  })
  public readonly sourceWebsite!: string;

  @ApiProperty({
    description: 'Original product URL from the source website.',
    example: 'https://ultra.md/product/example',
  })
  public readonly sourceUrl!: string;
}

export class ProductDetailsResponseDto {
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

  @ApiPropertyOptional({
    description: 'Product manufacturer.',
    type: ProductManufacturerResponseDto,
  })
  public readonly manufacturer?: ProductManufacturerResponseDto | null;

  @ApiProperty({
    description: 'Product images.',
    type: [ProductImageResponseDto],
  })
  public readonly productImages!: ProductImageResponseDto[];

  @ApiProperty({
    description: 'Product specification groups.',
    type: [ProductSpecificationGroupResponseDto],
  })
  public readonly specificationGroups!: ProductSpecificationGroupResponseDto[];

  @ApiProperty({
    description: 'Product variants.',
    type: [ProductVariantResponseDto],
  })
  public readonly variants!: ProductVariantResponseDto[];

  @ApiProperty({
    description: 'Product external sources.',
    type: [ProductSourceResponseDto],
  })
  public readonly sources!: ProductSourceResponseDto[];
}
