import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ListCanBeSortDTO, PaginationDto } from 'src/share/dto/base.dto';

export class GetReaderListDTO extends ListCanBeSortDTO {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => Boolean(value))
  is_punishing: boolean | undefined;
  @IsOptional()
  name: string | undefined;
  @IsOptional()
  @IsBoolean()
  gender: boolean | undefined;
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number.parseInt(value))
  major_id: number | undefined;
}
