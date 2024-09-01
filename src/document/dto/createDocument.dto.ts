import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateDocumentDTO {
  @IsNotEmpty()
  document_name: string;
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(new Date().getFullYear())
  published_year: number;
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  @Min(1)
  quantity: number;
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  major_id: number;
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  author_id: number;
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  publisher_id: number;
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  category_id: number;
  @IsOptional()
  @IsNotEmpty()
  description?: string;
}
export class CreateDocumentFullDTO extends CreateDocumentDTO {
  file?: Express.Multer.File;
}
