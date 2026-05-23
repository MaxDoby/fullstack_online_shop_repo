import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UploadProductImageParamsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly productId!: number;
}
