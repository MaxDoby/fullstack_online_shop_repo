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
