import { ApiProperty } from '@nestjs/swagger';

export class NewsItemResponseDto {
  @ApiProperty({
    description: 'News title displayed in the frontend ticker.',
    example: 'New AI chip announced for laptops.',
  })
  public readonly title!: string;

  @ApiProperty({
    description: 'Original news article URL.',
    example: 'https://example.com/article',
  })
  public readonly url!: string;

  @ApiProperty({
    description: 'News source name.',
    example: 'Tech News',
  })
  public readonly source!: string;
}
