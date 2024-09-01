import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetReaderListDTO } from './dto/getReaderList.dto';
import { UpdateReaderDTO } from './dto/updateReader.dto';
import { ValidationService } from 'src/share/validation/validation.service';

@Injectable()
export class ReaderService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

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
    if (
      !this.validationService.IsCollumnExist('reader', sortByCol) ||
      !(await this.validationService.IsMajorIdExist(majorId))
    )
      throw new NotFoundException(
        "Collumn isn't exist or Major Id isn't exist",
      );
    let readers = await this.prismaService.reader.findMany({
      skip: perPage * (page - 1),
      where: {
        name:
          name != undefined
            ? {
                mode: 'insensitive',
                contains: name,
              }
            : undefined,
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
  async UpdateReader(
    userId: number,
    isManager: boolean,
    file: Express.Multer.File,
    data: UpdateReaderDTO,
  ) {
    let reader = await this.prismaService.reader.findFirst({
      where: {
        id_reader: data.id_reader,
      },
      select: {
        id_user: true,
      },
    });
    if (!reader) throw new NotFoundException();
    if (reader.id_user != userId && !isManager) throw new ForbiddenException();

    const { id_job_title, id_major } = data;
    let valid = await Promise.all([
      this.prismaService.major
        .findFirst({
          where: {
            id_major: id_major,
          },
        })
        .then((res) => res != undefined),
      this.prismaService.job_title
        .findFirst({
          where: {
            id_job_title: id_job_title,
          },
        })
        .then((res) => res != undefined),
    ]);
    if (valid[0] && valid[1]) throw new BadRequestException();

    let avatar: string;
    if (file != undefined) {
      //TODO: Upload Avatar
    }
    await this.prismaService.reader.update({
      where: {
        id_reader: data.id_reader,
      },
      data: {
        ...data,
        avatar: file != undefined ? avatar : undefined,
      },
    });
    return {
      status: 'success',
      message: 'update success for reader_id ' + data.id_reader,
    };
  }
  async DeletePermanentReader(readerId: number) {
    return { status: 'developing' };
    // this.prismaService.reader.delete({
    //   where:{
    //     id_reader:readerId,
    //   },
    // })
  }
}
