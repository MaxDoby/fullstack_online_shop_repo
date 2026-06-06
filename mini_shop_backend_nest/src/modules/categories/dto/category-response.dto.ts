import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Unique category identifier.',
    example: 1,
  })
  public readonly id!: number;

  @ApiProperty({
    description: 'Category display name.',
    example: 'Phones',
  })
  public readonly name!: string;
}
