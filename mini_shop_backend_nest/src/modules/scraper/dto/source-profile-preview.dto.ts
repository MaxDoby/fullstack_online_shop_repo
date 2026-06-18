import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class SourceProfilePreviewRequestDto {
  @ApiProperty({
    description: 'Base URL of the source website.',
    example: 'https://example.com',
  })
  @IsUrl()
  @IsNotEmpty()
  public readonly sourceBaseUrl!: string;

  @ApiProperty({
    description:
      'Real search URL copied from the source website after a manual search.',
    example: 'https://example.com/search?query=iphone',
  })
  @IsUrl()
  @IsNotEmpty()
  public readonly exampleSearchUrl!: string;

  @ApiProperty({
    description: 'Exact search term used to create exampleSearchUrl.',
    example: 'iphone',
  })
  @IsString()
  @IsNotEmpty()
  public readonly exampleSearchTerm!: string;
}

export class SourceProfilePreviewResponseDto {
  @ApiProperty({
    description: 'Detected search URL template.',
    example: 'https://example.com/search?query={{query}}',
  })
  public readonly searchUrlTemplate!: string;

  @ApiProperty({
    description: 'Confidence score from 0 to 100.',
    example: 75,
  })
  public readonly confidenceScore!: number;

  @ApiPropertyOptional({
    description: 'Detected product link selector, if it can be inferred.',
    example: '.product-card a[href]',
  })
  public readonly productLinkSelector?: string;

  @ApiProperty({
    description: 'First product URL candidates detected from the search page.',
    example: ['https://example.com/product/iphone-16'],
  })
  public readonly productUrlCandidates!: string[];
}
