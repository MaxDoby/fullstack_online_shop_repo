import {
  IsNumber,
  IsPositive,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Product identifier included in the order.',
    example: 1,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  public readonly productId!: number;

  @ApiProperty({
    description: 'Quantity requested for this product.',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  public readonly quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'List of products and quantities included in the order.',
    type: [CreateOrderItemDto],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  public readonly items!: CreateOrderItemDto[];
}
