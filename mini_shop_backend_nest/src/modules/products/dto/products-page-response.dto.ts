import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from '../../../common/dto/page-meta.dto';
import { ProductResponseDto } from './product-response.dto';

export class ProductsPageResponseDto {
  @ApiProperty({
    description: 'Products returned for the current page.',
    type: [ProductResponseDto],
  })
  public readonly items!: ProductResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata.',
    type: PageMetaDto,
  })
  public readonly meta!: PageMetaDto;
}
