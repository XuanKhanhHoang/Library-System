import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty } from 'class-validator';

export class ListID {
  @IsNotEmpty()
  @IsArray()
  @Transform(({ value }) => {
    return Array.isArray(value)
      ? value.map((item) => parseInt(item, 10)).filter((item) => !isNaN(item))
      : isNaN(parseInt(value, 10))
        ? undefined
        : [parseInt(value, 10)];
  })
  id: number[];
}
