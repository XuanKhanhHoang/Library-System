import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateLoan {
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  reader_id: number;
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  @IsIn([3, 6, 12, 24])
  loan_term: number;
  loan_list_document: loan_list_document[];
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  loan_request_id: number;
}
class loan_list_document {
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  quantity: number;
  @IsNotEmpty()
  isbn: string;
  @IsOptional()
  @IsNotEmpty()
  note?: string;
}
