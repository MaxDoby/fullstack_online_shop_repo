import { IsString, MinLength, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Minimum amount of characters: 3.' })
  public readonly username!: string;
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  public readonly email!: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Minimum amount of characters: 8.' })
  public readonly password!: string;
  @IsString()
  @IsNotEmpty()
  public readonly firstName!: string;
  @IsString()
  @IsNotEmpty()
  public readonly lastName!: string;
}
