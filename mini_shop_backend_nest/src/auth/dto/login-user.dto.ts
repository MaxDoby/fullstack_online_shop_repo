import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Minimum amount of characters: 3.' })
  public readonly identifier!: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Minimum amount of characters: 8.' })
  public readonly password!: string;
}
