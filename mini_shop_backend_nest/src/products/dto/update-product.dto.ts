import {
  IsString,
  IsNumber,
  MinLength,
  IsPositive,
  MaxLength,
  IsNotEmpty,
  Min,
  IsOptional,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty()
  @MinLength(3, { message: 'Title must have at least 3 char.' })
  public readonly title?: string;
  @IsOptional()
  @IsString({ message: 'Description must be a string.' })
  @IsNotEmpty()
  @MaxLength(200, { message: 'Maximum number of characters: 200.' })
  public readonly description?: string;
  @IsOptional()
  @IsNumber({})
  @IsPositive()
  @IsNotEmpty()
  public readonly price?: number;
  @IsOptional()
  @IsNumber({})
  @Min(0)
  @IsNotEmpty()
  public readonly stock?: number;
  @IsOptional()
  @IsString({ message: 'Category must be a string.' })
  @MaxLength(20, { message: 'Maximum number of characters: 20.' })
  @IsNotEmpty()
  public readonly category?: string;
  @IsOptional()
  @IsString({ message: 'Invalid type of thumbnail.' })
  @IsNotEmpty()
  public readonly thumbnail?: string;
}
