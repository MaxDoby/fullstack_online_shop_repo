import { IsString, IsNumber, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'title must be a string.' })
  @MinLength(3, { message: 'title must have at least 3 char.' })
  title!: string;
  @IsString({ message: 'title must be a string.' })
  description!: string;
  @IsNumber({})
  price!: number;
  @IsNumber({})
  stock!: number;
  @IsString({ message: 'title must be a string.' })
  category!: string;
  @IsString({ message: 'title must be a string.' })
  thumbnail!: string;
}

export class UpdateProductDto {
  @IsString({ message: 'title must be a string.' })
  @MinLength(3, { message: 'title must have at least 3 char.' })
  title?: string;
  @IsString({ message: 'title must be a string.' })
  description?: string;
  @IsNumber({})
  price?: number;
  @IsNumber({})
  stock?: number;
  @IsString({ message: 'title must be a string.' })
  category?: string;
  @IsString({ message: 'title must be a string.' })
  thumbnail?: string;
}
