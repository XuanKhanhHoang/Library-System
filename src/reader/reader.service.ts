import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetReaderListDTO } from './dto/getReaderList.dto';

@Injectable()
export class ReaderService {
  constructor(private prismaService: PrismaService) {}

  async GetReaderList({
    page = 1,
    reader_per_page: perPage = 6,
    is_punishing: isPunishing,
    name,
    gender,
    major_id: majorId,
    sort_by_col: sortByCol,
    sort_type: sortType = 'asc',
  }: GetReaderListDTO) {
    const prismaModels = Prisma.dmmf.datamodel.models;
    const model = prismaModels.find((model) => model.name === 'Reader');
    const columnExists = model
      ? model.fields.some((field) => field.name === sortByCol)
      : false;
    if (!columnExists) throw new BadRequestException("Collumn isn't exist");

    let readers = await this.prismaService.reader.findMany({
      skip: perPage * (page - 1),
      where: {
        name: name,
        gender: gender,
        id_major: majorId,
        loan_return_transaction: {
          every: {
            punishment: {
              is_handled: isPunishing != undefined ? !isPunishing : undefined,
            },
          },
        },
      },
      orderBy: {
        [sortByCol]: sortType,
      },
    });
    return {
      total_page: readers.length / perPage,
      data: readers,
    };
  }

  async GetReader(readerId: number, userId: number, isManager: boolean) {
    let reader = await this.prismaService.reader.findFirst({
      where: {
        id_reader: readerId,
      },
    });
    if (!reader) throw new NotFoundException();
    if (reader.id_user != userId && !isManager) throw new ForbiddenException();
    return reader;
  }
}
