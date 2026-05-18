import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Username or email used to authenticate the user.',
    example: 'testauth@example.com',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Minimum amount of characters: 3.' })
  public readonly identifier!: string;

  @ApiProperty({
    description: 'Plain text password used to authenticate the user.',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Minimum amount of characters: 8.' })
  public readonly password!: string;
}
