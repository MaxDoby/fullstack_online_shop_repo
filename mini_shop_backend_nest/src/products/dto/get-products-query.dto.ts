import {
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GetProductsQueryDto {
  @IsOptional()
  @IsString()
  public readonly search?: string;
  @IsOptional()
  @IsString()
  public readonly category?: string;
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  public readonly page?: number;
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  public readonly limit?: number;
  @IsOptional()
  @IsIn(['title', 'price', 'stock', 'id'])
  public readonly sortBy?: 'title' | 'price' | 'stock' | 'id';
  @IsOptional()
  @IsIn(['asc', 'desc'])
  public readonly sortOrder?: 'asc' | 'desc';
}
