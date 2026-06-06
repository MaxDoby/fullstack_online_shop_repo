import { ApiProperty } from '@nestjs/swagger';

export class CurrentUserResponseDto {
  @ApiProperty({
    description: 'Authenticated user identifier stored in JWT payload.',
    example: 3,
  })
  public readonly sub!: number;

  @ApiProperty({
    description: 'Authenticated username.',
    example: 'testuser',
  })
  public readonly username!: string;

  @ApiProperty({
    description: 'Authenticated user email.',
    example: 'test@example.com',
  })
  public readonly email!: string;

  @ApiProperty({
    description: 'Authenticated user role.',
    example: 'ADMIN',
  })
  public readonly role!: string;
}
