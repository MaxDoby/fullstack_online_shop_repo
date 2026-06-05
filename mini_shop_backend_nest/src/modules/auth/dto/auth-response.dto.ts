import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({
    description: 'User ID.',
    example: 1,
  })
  public readonly id!: number;

  @ApiProperty({
    description: 'Username.',
    example: 'maxim',
  })
  public readonly username!: string;

  @ApiProperty({
    description: 'User email.',
    example: 'maxim@example.com',
  })
  public readonly email!: string;

  @ApiProperty({
    description: 'User first name.',
    example: 'Maxim',
  })
  public readonly firstName!: string;

  @ApiProperty({
    description: 'User last name.',
    example: 'Dobinda',
  })
  public readonly lastName!: string;

  @ApiProperty({
    description: 'User role.',
    example: 'USER',
  })
  public readonly role!: string;

  @ApiProperty({
    description: 'User creation date.',
    example: '2026-06-05T10:00:00.000Z',
  })
  public readonly createdAt!: Date;

  @ApiProperty({
    description: 'User last update date.',
    example: '2026-06-05T10:00:00.000Z',
  })
  public readonly updatedAt!: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Authenticated user data.',
    type: AuthUserResponseDto,
  })
  public readonly user!: AuthUserResponseDto;

  @ApiProperty({
    description: 'JWT access token.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  public readonly accessToken!: string;
}
