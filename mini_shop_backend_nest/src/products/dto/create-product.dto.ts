import {
  IsString,
  IsNumber,
  MinLength,
  IsPositive,
  IsNotEmpty,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty()
  @MinLength(3, { message: 'title must have at least 3 char.' })
  public readonly title!: string;
  @IsString({ message: 'Description must be a string.' })
  @IsNotEmpty()
  @MaxLength(200, { message: 'Maximum number of characters: 200.' })
  public readonly description!: string;
  @IsNumber({})
  @IsPositive()
  @IsNotEmpty()
  public readonly price!: number;
  @IsNumber({})
  @Min(0)
  @IsNotEmpty()
  public readonly stock!: number;
  @IsString({ message: 'Category must be a string.' })
  @MaxLength(20, { message: 'Maximum number of characters: 20.' })
  @IsNotEmpty()
  public readonly category!: string;
  @IsString({ message: 'Invalid type of thumbnail.' })
  @IsNotEmpty()
  public readonly thumbnail!: string;
}
