import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

class loan_list_document {
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  quantity: number;
  @IsNotEmpty()
  isbn: string;
}
class punishment {
  @IsNotEmpty()
  reason: string;
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  cost: number;
}
export class CreateReturn {
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  transaction_id: number;
  @IsNotEmpty()
  @IsArray()
  return_list: loan_list_document[];
  @IsOptional()
  punishment?: punishment;
  @IsDate()
  @Transform(({ value }) => {
    return new Date(decodeURIComponent(value));
  })
  return_date: Date;
}
