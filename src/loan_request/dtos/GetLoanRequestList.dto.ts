import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ListCanBeSortDTO } from 'src/share/dto/base.dto';

export class GetUserLoanRequestList extends ListCanBeSortDTO {
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => {
    let a = new Date(decodeURIComponent(value));
    a.setHours(0, 0, 0);
    return a;
  })
  min_date?: Date;
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => {
    let a = new Date(decodeURIComponent(value));
    a.setHours(23, 59, 59);
    return a;
  })
  max_date?: Date;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  status_id?: number;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  loan_request_id?: number;
}
export class GetLoanRequestList extends GetUserLoanRequestList {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  user_id?: number;
  @IsOptional()
  @IsNotEmpty()
  name?: string;
}
