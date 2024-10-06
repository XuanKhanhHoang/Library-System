import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDTO } from './dto/updateUser.dto';
import { ValidationService } from 'src/share/validation/validation.service';
import { GetUserListDTO } from './dto/getUserList.dto';
import { CreateUserDTO } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async GetUserList({
    page = 1,
    limit: perPage = 6,
    is_punishing: isPunishing,
    name,
    gender,
    sort_by_col: sortByCol,
    sort_type: sortType = 'asc',
    is_valid,
    phone_number,
    user_id,
  }: GetUserListDTO) {
    console.log('gd ', gender);
    if (
      (sortByCol != undefined &&
        !this.validationService.IsColumnExist('user', sortByCol)) ||
      (user_id && !(await this.validationService.IsUserIdExist(user_id)))
    )
      throw new NotFoundException("Column isn't exist or user_id not found");
    let count = await this.prismaService.user.count({
      where: {
        name:
          name != undefined
            ? {
                mode: 'insensitive',
                contains: name,
              }
            : undefined,
        gender: gender,
        is_valid: is_valid,
        is_librian: false,
        phone_number:
          phone_number != undefined
            ? {
                mode: 'insensitive',
                contains: phone_number,
              }
            : undefined,
        id_user: user_id,
        loan_return_transaction: {
          every: {
            punishment: {
              is_handled: isPunishing != undefined ? !isPunishing : undefined,
            },
          },
        },
      },
    });
    let readers = await this.prismaService.user.findMany({
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
        is_valid: is_valid,
        is_librian: false,
        phone_number:
          phone_number != undefined
            ? {
                mode: 'insensitive',
                contains: phone_number,
              }
            : undefined,
        id_user: user_id,
        loan_return_transaction: {
          every: {
            punishment: {
              is_handled: isPunishing != undefined ? !isPunishing : undefined,
            },
          },
        },
      },
      orderBy: sortByCol
        ? {
            [sortByCol]: sortType || 'asc',
          }
        : undefined,
      take: perPage,
    });
    return {
      total_page: Math.ceil(count / perPage),
      data: readers,
    };
  }

  async GetUser(userId: number, isManager: boolean) {
    let reader = await this.prismaService.user.findUnique({
      where: {
        id_user: userId,
      },
      include: {
        job_title: true,
        major: true,
      },
    });
    if (!reader) throw new NotFoundException();
    return reader;
  }
  async UpdateUser(file: Express.Multer.File, data: UpdateUserDTO) {
    let user = await this.prismaService.user.findUnique({
      where: {
        id_user: data.id_user,
      },
      select: {
        id_user: true,
      },
    });
    if (!user) throw new NotFoundException();

    const { id_job_title, id_major } = data;
    let valid = await Promise.all([
      this.prismaService.major
        .findUnique({
          where: {
            id_major: id_major,
          },
        })
        .then((res) => res != undefined),
      this.prismaService.job_title
        .findUnique({
          where: {
            id_job_title: id_job_title,
          },
        })
        .then((res) => res != undefined),
    ]);
    if (!valid[0] && !valid[1])
      throw new BadRequestException('id_major or job_title invalid');

    let avatar: string;
    if (file != undefined) {
      //TODO: Upload Avatar
    }
    await this.prismaService.user.update({
      where: {
        id_user: data.id_user,
      },
      data: {
        ...data,
        avatar: file != undefined ? avatar : undefined,
      },
    });
    return {
      status: 'success',
      message: 'update success for reader_id ' + data.id_user,
    };
  }
  async CreateUser(file: Express.Multer.File, data: CreateUserDTO) {
    let user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            user_name: data.user_name,
          },
          {
            phone_number: data.phone_number,
          },
        ],
      },
      select: {
        id_user: true,
      },
    });
    if (user) throw new ConflictException();
    const { id_job_title, id_major } = data;
    let valid = await Promise.all([
      this.prismaService.major
        .findUnique({
          where: {
            id_major: id_major,
          },
        })
        .then((res) => res != undefined),
      this.prismaService.job_title
        .findUnique({
          where: {
            id_job_title: id_job_title,
          },
        })
        .then((res) => res != undefined),
    ]);
    if (!(valid[0] && valid[1]))
      throw new BadRequestException('id_major or id_job_title invalid');
    let pwd = await bcrypt.hash(data.pass_word, Number(process.env.HASH_ROUND));
    let avatar: string;
    if (file != undefined) {
      //TODO: Upload Avatar
    }

    let { id_user } = await this.prismaService.user.create({
      data: {
        ...data,
        pass_word: pwd,
        avatar: file != undefined ? avatar : undefined,
      },
      select: {
        id_user: true,
      },
    });
    return {
      status: 'success',
      message: 'create success for user_id ' + id_user,
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
