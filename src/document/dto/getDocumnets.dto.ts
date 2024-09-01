import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class GetDocumentsDTO {
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(1)
  page: number | undefined;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  document_per_page: number | undefined;
  @IsOptional()
  @IsNotEmpty()
  name: string | undefined;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  major_id: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  publisher_id: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  category_id: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  author_id: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(0)
  quantity: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(0)
  min_quantity: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(0)
  max_quantity: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(1950)
  @Max(new Date().getFullYear())
  published_year: number;
}
