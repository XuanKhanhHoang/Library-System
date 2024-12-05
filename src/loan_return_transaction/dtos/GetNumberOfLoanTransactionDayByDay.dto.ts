import { Transform } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class GetNumberOfLoanTransactionDayByDayDTO {
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
}
