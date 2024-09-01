import { Transform } from 'class-transformer';
import { IsOptional, IsNumber, Min, IsNotEmpty } from 'class-validator';

export class UpdateDocumentDTO {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  document_id?: number;

  @IsOptional()
  @IsNotEmpty()
  document_name?: string;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(new Date().getFullYear())
  published_year?: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(1)
  quantity?: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  major_id?: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  author_id?: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  publisher_id?: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  category_id?: number;
  @IsOptional()
  @IsOptional()
  description?: string;
}
export class UpdateDocumentFullDTO extends UpdateDocumentDTO {
  file?: Express.Multer.File;
}
