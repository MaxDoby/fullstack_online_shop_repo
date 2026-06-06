import { ApiProperty } from '@nestjs/swagger';

export class DeleteProductImageResponseDto {
  @ApiProperty({
    description: 'Delete success message.',
    example: 'This image was successfully deleted.',
  })
  public readonly message!: string;

  @ApiProperty({
    description: 'Deleted image identifier.',
    example: 1,
  })
  public readonly imageId!: number;
}
