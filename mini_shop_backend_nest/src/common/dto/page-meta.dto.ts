import { ApiProperty } from '@nestjs/swagger';

export class PageMetaDto {
  @ApiProperty({
    description: 'Total number of records matching the current filters.',
    example: 42,
    minimum: 0,
  })
  public readonly total: number;

  @ApiProperty({
    description: 'Current page number.',
    example: 1,
    minimum: 1,
  })
  public readonly page: number;

  @ApiProperty({
    description: 'Number of records returned per page.',
    example: 8,
    minimum: 1,
  })
  public readonly limit: number;

  @ApiProperty({
    description: 'Total number of pages available.',
    example: 6,
    minimum: 0,
  })
  public readonly totalPages: number;

  @ApiProperty({
    description: 'Indicates whether another page exists after the current one.',
    example: true,
  })
  public readonly hasNextPage: boolean;

  @ApiProperty({
    description: 'Indicates whether a page exists before the current one.',
    example: false,
  })
  public readonly hasPreviousPage: boolean;
  constructor(total: number, page: number, limit: number) {
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}
