import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  MinLength,
} from 'class-validator';

export class UpdateUserDTO {
  @IsNotEmpty()
  name: string;
  @IsDate()
  @Transform(({ value }) => new Date(value))
  birth_date: Date;
  @IsPhoneNumber('VN')
  phone_number: string;
  @IsEmail()
  email: string;
  @IsBoolean()
  @Transform(({ value }) => value != 'false')
  gender: boolean;
  @IsBoolean()
  @Transform(({ value }) => value != 'false')
  is_valid: boolean;
  @Transform(({ value }) => Number.parseInt(value))
  id_job_title: number;
  @Transform(({ value }) => Number.parseInt(value))
  id_user: number;
  @Transform(({ value }) => Number.parseInt(value))
  id_major: number;
  @IsOptional()
  @IsNotEmpty()
  @MinLength(6)
  pass_word?: string;
}
