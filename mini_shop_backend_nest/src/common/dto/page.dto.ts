import { PageMetaDto } from './page-meta.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PageDto<T> {
  @ApiProperty({
    description: 'List of records returned for the current page.',
    isArray: true,
  })
  public readonly items: T[];

  @ApiProperty({
    description: 'Pagination metadata for the current response.',
    type: PageMetaDto,
  })
  public readonly meta: PageMetaDto;

  constructor(items: T[], meta: PageMetaDto) {
    this.items = items;
    this.meta = meta;
  }
}
