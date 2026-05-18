import {
  IsString,
  IsNumber,
  MinLength,
  IsPositive,
  MaxLength,
  IsNotEmpty,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'New product title displayed in the catalog.',
    example: 'Apple MacBook Pro 14 Inch Space Grey',
    minLength: 3,
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty()
  @MinLength(3, { message: 'Title must have at least 3 char.' })
  public readonly title?: string;

  @ApiPropertyOptional({
    description: 'New short product description displayed on the product card.',
    example: 'Updated premium laptop description.',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string.' })
  @IsNotEmpty()
  @MaxLength(200, { message: 'Maximum number of characters: 200.' })
  public readonly description?: string;

  @ApiPropertyOptional({
    description: 'New product price.',
    example: 1899.99,
    minimum: 0.01,
  })
  @IsOptional()
  @IsNumber({})
  @IsPositive()
  @IsNotEmpty()
  public readonly price?: number;

  @ApiPropertyOptional({
    description: 'New available product quantity in stock.',
    example: 20,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({})
  @Min(0)
  @IsNotEmpty()
  public readonly stock?: number;

  @ApiPropertyOptional({
    description:
      'Existing category name used to reconnect the product to a category.',
    example: 'Laptops',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Category must be a string.' })
  @MaxLength(20, { message: 'Maximum number of characters: 20.' })
  @IsNotEmpty()
  public readonly category?: string;

  @ApiPropertyOptional({
    description: 'New product thumbnail image path or URL.',
    example: '/images/products/apple-macbook-pro-14-inch-space-grey.webp',
  })
  @IsOptional()
  @IsString({ message: 'Invalid type of thumbnail.' })
  @IsNotEmpty()
  public readonly thumbnail?: string;
}
