import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateReaderDTO {
  @IsOptional()
  @IsNotEmpty()
  name: string | undefined;
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  birth_date: Date | undefined;
  @IsOptional()
  @IsPhoneNumber('VN')
  phone_number: string | undefined;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  gender: boolean;
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  id_job_title: number | undefined;
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  id_reader: number | undefined;
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  id_major: number | undefined;
}
