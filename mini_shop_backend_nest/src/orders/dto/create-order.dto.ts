import {
  IsNumber,
  IsPositive,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  public readonly productId!: number;
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  public readonly quantity!: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  public readonly items!: CreateOrderItemDto[];
}
