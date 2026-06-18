import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class StartScrapeJobDto {
  @ApiProperty({
    description: 'Website domain used as scraper source identifier.',
    example: 'example-shop.com',
  })
  @IsString()
  @IsNotEmpty()
  public readonly sourceWebsite!: string;

  @ApiProperty({
    description: 'Base URL of the source website.',
    example: 'https://example-shop.com',
  })
  @IsUrl()
  @IsNotEmpty()
  public readonly sourceBaseUrl!: string;

  @ApiProperty({
    description: 'Internal category id where imported products will be saved.',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  public readonly targetCategoryId!: number;

  @ApiPropertyOptional({
    description:
      'Search query used by the scraper. The admin should first verify this query manually on the source website.',
    example: 'telefon samsung s21',
  })
  @IsString()
  @IsNotEmpty()
  public readonly searchText!: string;

  @ApiPropertyOptional({
    description:
      'Real search URL copied from the source website after a manual search. Used to auto-detect the search URL template.',
    example: 'https://example-shop.com/search?query=iphone',
  })
  @IsOptional()
  @IsUrl()
  public readonly exampleSearchUrl?: string;

  @ApiPropertyOptional({
    description:
      'The exact search term used when copying exampleSearchUrl. Example: if the copied URL was created after searching "iphone", pass "iphone".',
    example: 'iphone',
  })
  @IsOptional()
  @IsString()
  public readonly exampleSearchTerm?: string;

  @ApiPropertyOptional({
    description: 'Minimum product price filter.',
    example: 1111,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  public readonly minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum product price filter.',
    example: 9999,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  public readonly maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of products to import in one job.',
    example: 50,
    minimum: 1,
    maximum: 500,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  public readonly limit?: number;
}
