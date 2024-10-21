import { Transform } from 'class-transformer';
import { IsNumber, Max } from 'class-validator';

export class paginationDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  page: number = 1;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Max(100)
  take: number = 30;
}
