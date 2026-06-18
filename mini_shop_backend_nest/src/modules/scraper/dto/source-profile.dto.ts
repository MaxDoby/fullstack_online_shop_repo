import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class SaveSourceProfileDto {
  @ApiPropertyOptional({
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
    description:
      'Optional real search URL copied from the source website after a manual search. If omitted, the backend tries to discover it with Playwright.',
    example: 'https://example-shop.com/search?query=iphone+14',
  })
  @IsOptional()
  @IsUrl()
  public readonly exampleSearchUrl?: string;

  @ApiProperty({
    description: 'Exact search term used to create exampleSearchUrl.',
    example: 'iphone 14',
  })
  @IsString()
  @IsNotEmpty()
  public readonly exampleSearchTerm!: string;

  @ApiPropertyOptional({
    description: 'Whether this source profile can be used by scraper jobs.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  public readonly isActive?: boolean;
}

export class SourceProfileResponseDto {
  @ApiProperty({ example: 1 })
  public readonly id!: number;

  @ApiProperty({ example: 'example-shop.com' })
  public readonly sourceWebsite!: string;

  @ApiProperty({ example: 'https://example-shop.com' })
  public readonly sourceBaseUrl!: string;

  @ApiProperty({ example: 'https://example-shop.com/search?query=iphone+14' })
  public readonly exampleSearchUrl!: string;

  @ApiProperty({ example: 'iphone 14' })
  public readonly exampleSearchTerm!: string;

  @ApiProperty({ example: 'https://example-shop.com/search?query={{query}}' })
  public readonly searchUrlTemplate!: string;

  @ApiPropertyOptional({ example: '.p-2 a.d-block' })
  public readonly productLinkSelector?: string;

  @ApiProperty({
    example: ['https://example-shop.com/apple-iphone-14.html'],
  })
  public readonly productUrlCandidates!: string[];

  @ApiProperty({ example: 90 })
  public readonly confidenceScore!: number;

  @ApiProperty({ example: true })
  public readonly isActive!: boolean;

  @ApiProperty({ example: '2026-06-15T10:00:00.000Z' })
  public readonly createdAt!: Date;

  @ApiProperty({ example: '2026-06-15T10:00:00.000Z' })
  public readonly updatedAt!: Date;
}
