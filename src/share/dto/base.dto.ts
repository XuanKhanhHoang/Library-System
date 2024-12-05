import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  Min,
} from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(1)
  page?: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  limit?: number;
}
export class ListCanBeSortDTO extends PaginationDto {
  @IsOptional()
  @IsNotEmpty()
  sort_by_col?: string;
  @IsOptional()
  @IsNotEmpty()
  @IsIn(['asc', 'desc'])
  sort_type?: 'asc' | 'desc';
}
