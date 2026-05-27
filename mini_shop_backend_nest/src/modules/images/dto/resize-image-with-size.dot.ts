import { IsInt, Min, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class ResizeImageWithSizeParamsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public readonly imageId!: number;

  @IsString()
  @Matches(/^\d+x\d+$/, {
    message: 'Size must be in the format WIDTHxHEIGHT, e.g. 500x300',
  })
  public readonly size!: string;
}
