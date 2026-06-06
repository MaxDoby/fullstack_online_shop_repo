import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty({
    description: 'Unique order item identifier.',
    example: 1,
  })
  public readonly id!: number;

  @ApiProperty({
    description: 'Product identifier included in the order.',
    example: 25,
  })
  public readonly productId!: number;

  @ApiProperty({
    description: 'Product title at the moment of response.',
    example: 'Smartphone Apple iPhone 15',
  })
  public readonly productTitle!: string;

  @ApiProperty({
    description: 'Product thumbnail URL or image path.',
    example: '/images/product/12/300x300',
  })
  public readonly productThumbnail!: string;

  @ApiProperty({
    description: 'Quantity ordered for this product.',
    example: 2,
  })
  public readonly quantity!: number;

  @ApiProperty({
    description: 'Product price saved at the moment of purchase.',
    example: 12999,
  })
  public readonly priceAtPurchase!: number;
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'Unique order identifier.',
    example: 1,
  })
  public readonly id!: number;

  @ApiProperty({
    description: 'Identifier of the user who created the order.',
    example: 3,
  })
  public readonly userId!: number;

  @ApiProperty({
    description: 'Total order cost calculated from all order items.',
    example: 25998,
  })
  public readonly totalCost!: number;

  @ApiProperty({
    description: 'Current order status.',
    example: 'PENDING',
  })
  public readonly status!: string;

  @ApiProperty({
    description: 'Order creation date.',
    example: '2026-06-06T10:00:00.000Z',
  })
  public readonly createdAt!: Date;

  @ApiProperty({
    description: 'Products included in this order.',
    type: [OrderItemResponseDto],
  })
  public readonly orderItems!: OrderItemResponseDto[];
}
