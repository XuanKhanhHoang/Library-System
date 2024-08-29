import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class GetReaderListDTO {
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(1)
  page: number | undefined;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  reader_per_page: number | undefined;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  is_punishing: boolean | undefined;
  @IsOptional()
  name: string | undefined;
  @IsOptional()
  @IsBoolean()
  gender: boolean | undefined;
  @IsOptional()
  @IsNotEmpty()
  sort_by_col: string | undefined;
  @IsOptional()
  @IsNotEmpty()
  @IsIn(['asc', 'desc'])
  sort_type: 'asc' | 'desc' | undefined;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  major_id: number | undefined;
}
