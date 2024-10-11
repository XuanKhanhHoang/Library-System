import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetLoanRequestList } from './dtos/GetLoanRequestList.dto';
import { ValidationService } from 'src/share/validation/validation.service';

@Injectable()
export class LoanRequestService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}
  async GetList({
    loan_request_id,
    max_date,
    min_date,
    name,
    status_id,
    user_id,
    limit = 6,
    page = 1,
    sort_by_col,
    sort_type,
  }: GetLoanRequestList) {
    if (sort_by_col != undefined && sort_by_col == 'user_id')
      sort_by_col = 'id_reader';
    if (
      (sort_by_col != undefined &&
        sort_by_col != 'create_at' &&
        sort_by_col != 'name' &&
        sort_by_col != 'user_id') ||
      (user_id && !(await this.validationService.IsUserIdExist(user_id)))
    )
      throw new NotFoundException("Column isn't exist or user_id not found");
    let count = await this.prismaService.loan_request.count({
      where: {
        create_at: {
          gte: min_date,
          lte: max_date,
        },
        id_loan_request: loan_request_id,
        id_reader: user_id,
        status_id: status_id,
        user:
          name != undefined
            ? {
                name: {
                  mode: 'insensitive',
                  contains: name,
                },
              }
            : undefined,
      },
    });
    let readers = await this.prismaService.loan_request.findMany({
      skip: limit * (page - 1),
      where: {
        create_at: {
          gte: min_date,
          lte: max_date,
        },
        id_loan_request: loan_request_id,
        id_reader: user_id,
        status_id: status_id,
        user:
          name != undefined
            ? {
                name: {
                  mode: 'insensitive',
                  contains: name,
                },
              }
            : undefined,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        status: true,
        loan_request_list_documents: {
          select: {
            document: {
              select: {
                document_name: true,
              },
            },
          },
        },
      },
      orderBy: sort_by_col
        ? sort_by_col != 'name'
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
  async GetItem(id: number) {
    let a = await this.prismaService.loan_request.findUnique({
      where: {
        id_loan_request: id,
      },
      include: {
        user: {
          select: {
            name: true,
            job_title: {
              select: {
                job_title_name: true,
              },
            },
          },
        },
        status: true,
        loan_request_list_documents: {
          select: {
            document: {
              select: {
                document_name: true,
                document_id: true,
              },
            },
            quantity: true,
          },
        },
      },
    });
    if (a == undefined) throw new NotFoundException();
    return a;
  }
  async CheckRequestIsHandled(id: number) {
    let a = await this.prismaService.loan_request.findUnique({
      where: {
        id_loan_request: id,
      },
      select: {
        id_loan_request: true,
        transaction_id: true,
        status_id: true,
      },
    });
    if (a == undefined) throw new NotFoundException();
    if (a.status_id != 3) throw new ConflictException();
    const { id_loan_request, transaction_id } = a;
    return {
      is_loaned: transaction_id != undefined,
    };
  }
  async GetItemIncludeVariants(id: number) {
    let a = await this.prismaService.loan_request.findUnique({
      where: {
        id_loan_request: id,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        loan_request_list_documents: {
          select: {
            document: {
              select: {
                document_name: true,
                document_id: true,
                variants: {
                  select: {
                    isbn: true,
                    name: true,
                    quantity: true,
                  },
                },
              },
            },
            quantity: true,
          },
        },
      },
    });
    if (a == undefined) throw new NotFoundException();
    return a;
  }
  async UpdateStatus(id: number[], isAccept: boolean) {
    await this.prismaService.loan_request.updateMany({
      where: {
        id_loan_request: {
          in: id,
        },
      },
      data: {
        status_id: isAccept ? 3 : 2,
      },
    });
    return {
      status: 'success',
    };
  }
}
