import { Transform } from 'class-transformer';
import { IsArray, IsDate, IsNumber, Min } from 'class-validator';

export class CreateLoanRequest {
  @IsDate()
  @Transform(({ value }) => {
    return new Date(decodeURIComponent(value));
  })
  create_at: Date;
  @IsDate()
  @Transform(({ value }) => {
    return new Date(decodeURIComponent(value));
  })
  expected_date: Date;
  @IsArray()
  @Transform(({ value }) => {
    return JSON.parse(value);
  })
  documents: ListDocument[];
}
class ListDocument {
  @IsNumber()
  document_id: number;
  @IsNumber()
  @Min(1)
  quantity: number;
}
