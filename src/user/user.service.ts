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
import { GoogleDriveService } from 'src/google_drive/google_drive.service';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private ggDriveService: GoogleDriveService,
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
  async UpdateUser(data: UpdateUserDTO) {
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

    if (data.pass_word != undefined) {
      let pwd = await bcrypt.hash(
        data.pass_word,
        Number(process.env.HASH_ROUND),
      );
      data.pass_word = pwd;
    }
    await this.prismaService.user.update({
      where: {
        id_user: data.id_user,
      },
      data: {
        ...data,
      },
    });
    return {
      status: 'success',
      message: 'update success for reader_id ' + data.id_user,
      id_user: data.id_user,
    };
  }
  async CreateUser(data: CreateUserDTO) {
    let user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            user_name: data.user_name,
          },
          {
            phone_number: data.phone_number,
          },
          {
            email: data.email,
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

    let { id_user } = await this.prismaService.user.create({
      data: {
        ...data,
        pass_word: pwd,
        avatar: null,
      },
      select: {
        id_user: true,
      },
    });
    return {
      status: 'success',
      message: 'create success for user_id ' + id_user,
      id_user,
    };
  }
  async DisableUser(id: number[]) {
    await this.prismaService.user.updateMany({
      where: {
        id_user: {
          in: id,
        },
      },
      data: {
        is_valid: false,
      },
    });
    return { message: 'successfull', status: 'success' };
  }
  async DeleteUser(readerId: number) {
    await this.prismaService.user.delete({
      where: {
        id_user: readerId,
        is_librian: false,
      },
    });
    return { message: 'delete successfully', status: 'success' };
  }
  async GetNumberUserOfType() {
    let sql = `select count(*) as quantity,job_title_name from( select id_job_title from users where is_valid = true )u join jobs_titles jt ON u.id_job_title =jt.id_job_title group  by job_title_name `;
    let results = (await this.prismaService.$queryRawUnsafe(sql)) as {
      quantity: BigInt;
      job_title_name: string;
    }[];

    let serializedResults = results.map((row) => ({
      ...row,
      quantity: Number(row.quantity),
    }));
    return serializedResults;
  }
  async UploadAvatar(file: Express.Multer.File, user_id: number) {
    let avatar = await this.ggDriveService
      .uploadFile(file, user_id + '_avatar')
      .catch((e) => {
        return null;
      });
    if (!avatar) return null;
    await this.prismaService.user.update({
      data: {
        avatar,
      },
      where: {
        id_user: user_id,
      },
    });
    return 1;
  }
  async ChangePassword(newPassword: string, user_id: number) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id_user: user_id,
        is_librian: false,
        is_valid: true,
      },
      select: {
        id_user: true,
      },
    });
    if (!user) throw new NotFoundException('user not found');
    let hashedPassword = await bcrypt.hash(
      newPassword,
      Number(process.env.HASH_ROUND),
    );
    await this.prismaService.user.update({
      where: {
        id_user: user_id,
      },
      data: {
        pass_word: hashedPassword,
      },
    });
    return {
      status: 'success',
    };
  }
  async GetMarkedDocuments(id_user: number, justId = false) {
    return this.prismaService.marked_document.findMany({
      where: {
        id_reader: id_user,
      },
      select: justId
        ? { document_id: true }
        : {
            document: {
              select: {
                document_name: true,
                document_id: true,
                image: true,
                author: true,
                description: true,
                publisher: true,
              },
            },
          },
    });
  }
  async RemoveMarkedDocument(id_reader: number, document_id: number) {
    const res = await this.prismaService.marked_document.findFirst({
      where: {
        document_id,
        id_reader,
      },
      select: {
        id: true,
      },
    });
    if ((!res || !res.id) == undefined) throw new NotFoundException();
    await this.prismaService.marked_document.delete({
      where: {
        id: res.id,
      },
    });
    return;
  }
  async AddMarkedDocument(id_reader: number, document_id: number) {
    if (
      (await this.prismaService.marked_document.findFirst({
        where: {
          document_id,
          id_reader,
        },
      })) != undefined
    )
      throw new ConflictException();
    await this.prismaService.marked_document.create({
      data: {
        document_id,
        id_reader,
      },
    });
    return {
      status: 'success',
    };
  }
}
