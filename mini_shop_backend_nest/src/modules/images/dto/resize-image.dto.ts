import { IsInt, Min, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class ResizeImageParamsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly imageId!: number;

  @IsString()
  @Matches(/^500x300$/)
  public readonly size!: string;
}
