import { ApiProperty } from '@nestjs/swagger';

export class DeleteProductResponseDto {
  @ApiProperty({
    description: 'Delete operation result message.',
    example: 'Product deleted successfully.',
  })
  public readonly message!: string;

  @ApiProperty({
    description: 'Deleted or removed product title.',
    example: 'iPhone 15 Pro',
  })
  public readonly product!: string;
}
