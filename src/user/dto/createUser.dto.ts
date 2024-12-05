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

export class CreateUserDTO {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  user_name: string;
  @IsNotEmpty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  birth_date: Date;
  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phone_number: string;
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value != 'false')
  gender: boolean;
  @IsNotEmpty()
  @Transform(({ value }) => Number.parseInt(value))
  id_job_title: number;
  @IsNotEmpty()
  @Transform(({ value }) => Number.parseInt(value))
  id_major: number;
  @IsNotEmpty()
  @MinLength(6)
  pass_word: string;
}
