import { IsString, MinLength, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique username assigned to the user.',
    example: 'testauth',
    minLength: 3,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Minimum amount of characters: 3.' })
  public readonly username!: string;

  @ApiProperty({
    description: 'Unique email address assigned to the user.',
    example: 'testauth@example.com',
    format: 'email',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  public readonly email!: string;

  @ApiProperty({
    description: 'Plain text password received before hashing.',
    example: 'password123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Minimum amount of characters: 8.' })
  public readonly password!: string;

  @ApiProperty({ description: 'User first name.', example: 'Test' })
  @IsString()
  @IsNotEmpty()
  public readonly firstName!: string;

  @ApiProperty({ description: 'User last name.', example: 'Auth' })
  @IsString()
  @IsNotEmpty()
  public readonly lastName!: string;
}
