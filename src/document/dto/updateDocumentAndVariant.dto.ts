import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateDocumentDTO {
  @IsOptional()
  @IsNotEmpty()
  document_name: string;
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  major_id: number;
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  author_id: number;
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  publisher_id: number;
  @IsOptional()
  @IsNotEmpty()
  description?: string;
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    return Array.isArray(value)
      ? value.map((item) => parseInt(item, 10)).filter((item) => !isNaN(item))
      : isNaN(parseInt(value, 10))
        ? undefined
        : [parseInt(value, 10)];
  })
  variants_be_delete: number[];
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    return Array.isArray(value)
      ? value.map((item) => parseInt(item, 10)).filter((item) => !isNaN(item))
      : isNaN(parseInt(value, 10))
        ? undefined
        : [parseInt(value, 10)];
  })
  categories: number[];
}

export class updateVariantDTO {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  document_id: number;
  @IsNotEmpty()
  isbn: string;
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  quantity: number;
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  published_date: Date;
  @IsOptional()
  @IsNotEmpty()
  name: string;
}
