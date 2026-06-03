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
    example: 'ultra.md',
  })
  @IsString()
  @IsNotEmpty()
  public readonly sourceWebsite!: string;

  @ApiProperty({
    description: 'Base URL of the source website.',
    example: 'https://ultra.md',
  })
  @IsUrl()
  @IsNotEmpty()
  public readonly sourceBaseUrl!: string;

  @ApiPropertyOptional({
    description: 'Optional manufacturer filter used by the scraper.',
    example: 'Xiaomi',
  })
  @IsOptional()
  @IsString()
  public readonly manufacturer?: string;

  @ApiPropertyOptional({
    description: 'Product type filter used by the scraper.',
    example: 'smartphone',
  })
  @IsOptional()
  @IsString()
  public readonly productType?: string;

  @ApiPropertyOptional({
    description: 'Optional product model filter used by the scraper.',
    example: 'iPhone 16 Pro Max',
  })
  @IsOptional()
  @IsString()
  public readonly model?: string;

  @ApiPropertyOptional({
    description: 'Search text filter used by the scraper.',
    example: 'Xiaomi 15 Ultra',
  })
  @IsOptional()
  @IsString()
  public readonly searchText?: string;

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
