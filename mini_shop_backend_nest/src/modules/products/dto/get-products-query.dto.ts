import { IsString, IsOptional, IsIn } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetProductsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Search text used to filter products by title or description.',
    example: 'laptop',
  })
  @IsOptional()
  @IsString()
  public readonly search?: string;

  @ApiPropertyOptional({
    description: 'Category name used to filter products.',
    example: 'Laptops',
  })
  @IsOptional()
  @IsString()
  public readonly category?: string;

  @ApiPropertyOptional({
    description: 'Product field used for sorting.',
    example: 'price',
    enum: ['title', 'price', 'stock', 'id'],
  })
  @IsOptional()
  @IsIn(['title', 'price', 'stock', 'id'])
  public readonly sortBy?: 'title' | 'price' | 'stock' | 'id';

  @ApiPropertyOptional({
    description: 'Sort direction for the selected product field.',
    example: 'asc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  public readonly sortOrder?: 'asc' | 'desc';
}
