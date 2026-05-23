import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindImageParamsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly imageId!: number;
}
