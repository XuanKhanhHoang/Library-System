import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/share/validation/validation.service';
import { GetLoanReturnTransactions } from './dtos/GetLoanReturnTransaction.dto';
import { CreateLoan } from './dtos/CreateLoan.dto';
import { addMonths } from 'src/utils/date';
import { CreateReturn } from './dtos/CreateReturn.dto';

@Injectable()
export class LoanReturnTransactionService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}
  async GetList({
    document_name,
    id,
    is_punished,
    is_returned,
    librarian_id,
    limit = 6,
    max_date,
    min_date,
    page = 1,
    sort_by_col,
    sort_type,
    user_id,
    reader_name,
  }: GetLoanReturnTransactions) {
    if (
      sort_by_col != undefined &&
      sort_by_col != 'user_name' &&
      !this.validationService.IsColumnExist(
        'loan_return_transaction',
        sort_by_col,
      )
    )
      throw new BadRequestException("Column isn't exist");
    if (user_id && !(await this.validationService.IsUserIdExist(user_id)))
      throw new NotFoundException();
    let count = await this.prismaService.loan_return_transaction.count({
      where: {
        create_at: {
          gte: min_date,
          lte: max_date,
        },
        id_librarian: librarian_id,
        id_loan_return: id,
        id_reader: user_id,
        return_date:
          is_returned != undefined
            ? is_returned
              ? {
                  not: null,
                }
              : null
            : undefined,
        user: {
          name: reader_name,
        },
        loan_list_document: {
          some: {
            variant: {
              document: {
                document_name: document_name,
              },
            },
          },
        },
        id_punish:
          is_punished != undefined
            ? is_punished == true
              ? null
              : {
                  not: null,
                }
            : undefined,
      },
    });
    let readers = await this.prismaService.loan_return_transaction.findMany({
      skip: limit * (page - 1),
      where: {
        create_at: {
          gte: min_date,
          lte: max_date,
        },
        id_librarian: librarian_id,
        id_loan_return: id,
        id_reader: user_id,
        return_date:
          is_returned != undefined
            ? is_returned
              ? {
                  not: null,
                }
              : null
            : undefined,
        user: {
          name:
            reader_name != undefined
              ? {
                  mode: 'insensitive',
                  contains: reader_name,
                }
              : undefined,
        },
        loan_list_document: {
          some: {
            variant: {
              document: {
                document_name:
                  document_name != undefined
                    ? {
                        mode: 'insensitive',
                        contains: document_name,
                      }
                    : undefined,
              },
            },
          },
        },
        id_punish:
          is_punished != undefined
            ? is_punished == true
              ? null
              : {
                  not: null,
                }
            : undefined,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        loan_list_document: {
          select: {
            variant: {
              select: {
                document: {
                  select: {
                    document_name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: sort_by_col
        ? sort_by_col != 'user_name'
          ? { [sort_by_col]: sort_type || 'asc' }
          : {
              user: {
                name: sort_type || 'asc',
              },
            }
        : undefined,
      take: limit,
    });
    return {
      total_page: Math.ceil(count / limit),
      data: readers,
    };
  }
  async GetItem(
    id: number,
    user_call: { id_user: number; is_librian: boolean },
  ) {
    if (!user_call.is_librian) {
      const { id_reader } =
        await this.prismaService.loan_return_transaction.findUnique({
          where: { id_loan_return: id },
          select: {
            id_reader: true,
          },
        });
      if (id != id_reader) throw new ForbiddenException();
    }
    return this.prismaService.loan_return_transaction.findUnique({
      where: { id_loan_return: id },
      include: {
        librian: {
          select: {
            name: true,
            id_user: true,
          },
        },
        loan_list_document: {
          select: {
            variant: {
              select: {
                document: {
                  select: {
                    document_name: true,
                  },
                },
                isbn: true,
              },
            },
            quantity: true,
            note: true,
          },
        },
        user: {
          select: {
            name: true,
            id_user: true,
          },
        },
        punishment: true,
      },
    });
  }
  async CreateLoan(data: CreateLoan, id_librarian: number) {
    return await this.prismaService.$transaction(
      async (service: PrismaService) => {
        let a = await service.loan_request.findUnique({
          where: {
            id_loan_request: data.loan_request_id,
          },
          select: {
            id_loan_request: true,
            transaction_id: true,
          },
        });
        if (!a || a.transaction_id != undefined)
          throw new BadRequestException();
        let { id_loan_return } = await service.loan_return_transaction.create({
          data: {
            due_date: addMonths(data.loan_term),
            id_librarian: id_librarian,
            create_at: new Date(),
            id_reader: data.reader_id,
          },
          select: {
            id_loan_return: true,
          },
        });

        const checksAndUpdate = data.loan_list_document.map(async (item) => {
          const fItem = await service.document_variant.findUnique({
            where: { isbn: item.isbn },
          });
          if (fItem && item.quantity > fItem.quantity) {
            throw new BadRequestException();
          }
          await service.document_variant.update({
            where: { isbn: item.isbn },
            data: {
              quantity: fItem.quantity - item.quantity,
            },
          });
        });
        try {
          await Promise.all([
            ...checksAndUpdate,
            service.loan_request.update({
              where: {
                id_loan_request: data.loan_request_id,
              },
              data: {
                transaction_id: id_loan_return,
              },
            }),
          ]);
        } catch (e) {
          throw e;
        }

        await service.loan_list_document.createMany({
          data: data.loan_list_document.map((item) => ({
            isbn: item.isbn,
            note: item.note,
            quantity: item.quantity,
            id_loan_return,
          })),
        });
        return {
          status: 'success',
          message: 'created',
        };
      },
    );
  }
  async CreateReturn(data: CreateReturn) {
    return await this.prismaService.$transaction(
      async (service: PrismaService) => {
        let id_punish: number | undefined = undefined;
        if (data.punishment) {
          id_punish = (
            await service.punishment.create({
              data: {
                cost: data.punishment.cost,
                reason: data.punishment.reason,
                is_handled: true,
              },
              select: {
                id_punish: true,
              },
            })
          ).id_punish;
        }
        await service.loan_return_transaction.update({
          data: {
            return_date: data.return_date,
            id_punish: id_punish,
          },
          where: {
            id_loan_return: data.transaction_id,
          },
          select: { id_loan_return: true },
        });

        const checksAndUpdate = data.return_list.map(async (item) => {
          const fItem = await service.document_variant.findUnique({
            where: { isbn: item.isbn },
          });
          if (fItem && item.quantity > fItem.quantity) {
            throw new BadRequestException();
          }
          await service.document_variant.update({
            where: { isbn: item.isbn },
            data: {
              quantity: fItem.quantity + item.quantity,
            },
          });
        });
        try {
          await Promise.all(checksAndUpdate);
        } catch (e) {
          throw e;
        }

        return {
          status: 'success',
          message: 'updated',
        };
      },
    );
  }
  async GetNumberOfLoanTransactionDayByDay({
    max_date,
    min_date,
  }: {
    min_date?: Date;
    max_date?: Date;
  }) {
    min_date = min_date || new Date('1/1/2010');
    max_date = max_date || new Date();

    let sql = `select  sum(quantity) as quantity,create_at from (select id_loan_return,create_at from loan_return_transactions where create_at <= '${max_date.toISOString()}' and create_at >= '${min_date.toISOString()}') lrt  join loan_list_documents lld  on lrt.id_loan_return  =lld.id_loan_return group by create_at `;
    let results = (await this.prismaService.$queryRawUnsafe(sql)) as {
      quantity: BigInt;
      create_at: string;
    }[];

    let serializedResults = results.map((row) => ({
      ...row,
      quantity: Number(row.quantity),
    }));
    return serializedResults;
  }
}
