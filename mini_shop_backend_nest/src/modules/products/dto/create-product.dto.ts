import {
  IsString,
  IsNumber,
  MinLength,
  IsPositive,
  IsNotEmpty,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product title displayed in the catalog.',
    example: 'Apple MacBook Pro 14 Inch Space Grey',
    minLength: 3,
  })
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty()
  @MinLength(3, { message: 'title must have at least 3 char.' })
  public readonly title!: string;

  @ApiProperty({
    description: 'Short product description displayed on the product card.',
    example:
      'Laptop premium pentru lucru serios, editare si productivitate de zi cu zi.',
    maxLength: 200,
  })
  @IsString({ message: 'Description must be a string.' })
  @IsNotEmpty()
  @MaxLength(200, { message: 'Maximum number of characters: 200.' })
  public readonly description!: string;

  @ApiProperty({
    description: 'Product price.',
    example: 1999.99,
    minimum: 0.01,
  })
  @IsNumber({})
  @IsPositive()
  @IsNotEmpty()
  public readonly price!: number;

  @ApiProperty({
    description: 'Available product quantity in stock.',
    example: 24,
    minimum: 0,
  })
  @IsNumber({})
  @Min(0)
  @IsNotEmpty()
  public readonly stock!: number;

  @ApiProperty({
    description:
      'Existing category name used to connect the product to a category.',
    example: 'Laptops',
    maxLength: 20,
  })
  @IsString({ message: 'Category must be a string.' })
  @MaxLength(20, { message: 'Maximum number of characters: 20.' })
  @IsNotEmpty()
  public readonly category!: string;

  @ApiProperty({
    description: 'Product thumbnail image path or URL.',
    example: '/images/products/apple-macbook-pro-14-inch-space-grey.webp',
  })
  @IsString({ message: 'Invalid type of thumbnail.' })
  @IsNotEmpty()
  public readonly thumbnail!: string;
}
