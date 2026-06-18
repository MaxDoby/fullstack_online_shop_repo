import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScrapeJobTargetCategoryDto {
  @ApiProperty({
    description:
      'Internal category id selected by admin for imported products.',
    example: 1,
  })
  public readonly id!: number;

  @ApiProperty({
    description:
      'Internal category name selected by admin for imported products.',
    example: 'Audio',
  })
  public readonly name!: string;
}

export class ScrapeJobResponseDto {
  @ApiProperty({
    description: 'Unique scraper job identifier.',
    example: 1,
  })
  public readonly id!: number;

  @ApiProperty({
    description: 'Source website name.',
    example: 'example-shop.com',
  })
  public readonly sourceWebsite!: string;

  @ApiProperty({
    description: 'Source website base URL.',
    example: 'https://example-shop.com',
  })
  public readonly sourceBaseUrl!: string;

  @ApiPropertyOptional({
    description: 'Internal target category selected by admin.',
    type: ScrapeJobTargetCategoryDto,
    nullable: true,
  })
  public readonly targetCategory!: ScrapeJobTargetCategoryDto | null;

  @ApiPropertyOptional({
    description: 'Requested manufacturer filter.',
    example: 'Apple',
    nullable: true,
  })
  public readonly manufacturer!: string | null;

  @ApiPropertyOptional({
    description: 'Requested product model filter.',
    example: 'iPhone 15',
    nullable: true,
  })
  public readonly model!: string | null;

  @ApiPropertyOptional({
    description: 'Requested description/text filter.',
    example: 'smartphone iPhone 15 Pro Max',
    nullable: true,
  })
  public readonly description!: string | null;

  @ApiPropertyOptional({
    description: 'Generic search text.',
    example: 'iPhone',
    nullable: true,
  })
  public readonly searchText!: string | null;

  @ApiPropertyOptional({
    description: 'Minimum accepted product price.',
    example: 1000,
    nullable: true,
  })
  public readonly minPrice!: number | null;

  @ApiPropertyOptional({
    description: 'Maximum accepted product price.',
    example: 50000,
    nullable: true,
  })
  public readonly maxPrice!: number | null;

  @ApiProperty({
    description: 'Scraper job status.',
    example: 'COMPLETED',
  })
  public readonly status!: string;

  @ApiProperty({
    description: 'Total products found by scraper.',
    example: 10,
  })
  public readonly totalFound!: number;

  @ApiProperty({
    description: 'Total products imported as new records.',
    example: 4,
  })
  public readonly totalImported!: number;

  @ApiProperty({
    description: 'Total existing products updated.',
    example: 6,
  })
  public readonly totalUpdated!: number;

  @ApiProperty({
    description: 'Total products failed during import.',
    example: 0,
  })
  public readonly totalFailed!: number;

  @ApiPropertyOptional({
    description: 'Error message if job failed or partially failed.',
    example: 'No matching products found.',
    nullable: true,
  })
  public readonly errorMessage!: string | null;

  @ApiProperty({
    description: 'Job creation date.',
    example: '2026-06-06T10:00:00.000Z',
  })
  public readonly createdAt!: Date;

  @ApiProperty({
    description: 'Job last update date.',
    example: '2026-06-06T10:01:00.000Z',
  })
  public readonly updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Job finish date.',
    example: '2026-06-06T10:02:00.000Z',
    nullable: true,
  })
  public readonly finishedAt!: Date | null;
}
