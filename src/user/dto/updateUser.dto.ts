import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  @IsNotEmpty()
  name?: string;
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  birth_date?: Date;
  @IsOptional()
  @IsPhoneNumber('VN')
  phone_number?: string;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value != 'false')
  gender?: boolean;
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  id_job_title?: number;
  @Transform(({ value }) => Number.parseInt(value))
  id_user: number;
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  id_major?: number;
}
