import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  MaxDate,
  Min,
  MinDate,
} from 'class-validator';
import { ListCanBeSortDTO, PaginationDto } from 'src/share/dto/base.dto';

export class GetDocumentsDTO extends ListCanBeSortDTO {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  document_id?: number;
  @IsOptional()
  @IsNotEmpty()
  name?: string;
  @IsOptional()
  @IsNotEmpty()
  publisher_name?: string;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  publisher_id?: number;
  @IsOptional()
  @IsNotEmpty()
  author_name?: string;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  author_id?: number;
  @IsOptional()
  @Transform(({ value }) => {
    return Array.isArray(value)
      ? value.map((item) => parseInt(item, 10)).filter((item) => !isNaN(item))
      : isNaN(parseInt(value, 10))
        ? undefined
        : [parseInt(value, 10)];
  })
  category_ids?: number[];
  @IsOptional()
  @IsNotEmpty()
  category_name?: string;
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @MinDate(new Date(1960, 1, 1))
  @MaxDate(new Date())
  published_date: number;
}
export class GetPreviewWithIds {
  @Transform(({ value }) => {
    return Array.isArray(value)
      ? value.map((item) => parseInt(item, 10)).filter((item) => !isNaN(item))
      : isNaN(parseInt(value, 10))
        ? undefined
        : [parseInt(value, 10)];
  })
  ids?: number[];
}
