import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ResizeImageParamsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly imageId!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2000)
  public readonly width!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2000)
  public readonly height!: number;
}
