import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsBooleanString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ValidPhoneNumber } from 'src/share/decorators/ValidPhoneNumber.decorator';
import { ListCanBeSortDTO } from 'src/share/dto/base.dto';

export class GetUserListDTO extends ListCanBeSortDTO {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value != 'false')
  is_punishing?: boolean;
  @IsOptional()
  @IsNotEmpty()
  name?: string;
  @IsOptional()
  @IsNotEmpty()
  phone_number?: string;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value != 'false')
  gender?: boolean;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  user_id?: number;
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value != 'false')
  is_valid?: boolean;
}
