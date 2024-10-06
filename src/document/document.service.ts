import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetDocumentsDTO } from './dto/getDocumnets.dto';
import { ValidationService } from 'src/share/validation/validation.service';
import { CreateDocumentFullDTO } from './dto/createDocument.dto';
import { UpdateDocumentFullDTO } from './dto/updateDocument.dto';

@Injectable()
export class DocumentService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}
  async GetDocuments({
    category_ids,
    limit: document_per_page = 6,
    page = 1,
    publisher_id,
    author_id,
    sort_by_col,
    sort_type,
    published_date,
    category_name,
    author_name,
    isbn,
    name,
    publisher_name,
  }: GetDocumentsDTO) {
    let valid = true;
    try {
      await Promise.all([
        (async () => {
          if (publisher_id == undefined) return true;
          return await this.validationService.IsPublisherIdExist(publisher_id);
        })(),
        (async () => {
          if (author_id == undefined) return true;
          return await this.validationService.IsAuthorIdExist(author_id);
        })(),
      ]);
    } catch (e) {
      valid = false;
    }
    if (
      !valid ||
      (sort_by_col == undefined && sort_type != undefined) ||
      (sort_by_col != undefined &&
        !this.validationService.IsColumnExist('document', sort_by_col))
    )
      throw new NotFoundException();
    let documents = await this.prismaService.document.findMany({
      skip: (page - 1) * document_per_page,
      where: {
        document_ref_category: {
          some: {
            category_id: {
              in: category_ids,
            },
            category: {
              category_name: {
                contains: category_name,
                mode: 'insensitive',
              },
            },
          },
        },
        id_publisher: publisher_id,
        id_author: author_id,
        document_name: {
          contains: name,
          mode: 'insensitive',
        },
        ISBN: {
          contains: isbn,
          mode: 'insensitive',
        },
        author: {
          author_name: {
            contains: author_name,
            mode: 'insensitive',
          },
        },
        publisher: {
          publisher_name: {
            contains: publisher_name,
            mode: 'insensitive',
          },
        },
      },
      include: {
        author: true,
        publisher: true,
        document_ref_category: {
          include: {
            category: true,
          },
        },
      },
      orderBy: sort_by_col
        ? {
            [sort_by_col]: sort_type || 'asc',
          }
        : undefined,
    });
    return {
      data: documents,
      total_page: Math.ceil(documents.length / document_per_page),
    };
  }
  // async CreateDocument({
  //   author_id,
  //   category_id,
  //   document_name,
  //   file,
  //   major_id,
  //   published_year,
  //   publisher_id,
  //   quantity,
  //   description,
  // }: CreateDocumentFullDTO) {
  //   try {
  //     await Promise.all([
  //       this.validationService.IsCategoryIdExist(category_id),
  //       this.validationService.IsMajorIdExist(major_id),
  //       this.validationService.IsPublisherIdExist(publisher_id),
  //       this.validationService.IsAuthorIdExist(author_id),
  //     ]);
  //   } catch (e) {
  //     throw new NotFoundException();
  //   }
  //   let image: string;
  //   if (file != undefined) {
  //     //TODO Upload Image
  //   }
  //   let { id_document } = await this.prismaService.document.create({
  //     data: {
  //       document_name,
  //       quantity,
  //       description,
  //       published_year,
  //       id_author: author_id,
  //       id_category: category_id,
  //       id_publisher: publisher_id,
  //       id_major: major_id,
  //     },
  //     select: {
  //       id_document: true,
  //     },
  //   });

  //   return {
  //     status: 'success',
  //     document_id: id_document,
  //   };
  // }
  // async UpdateDocument({
  //   author_id,
  //   category_id,
  //   document_name,
  //   file,
  //   major_id,
  //   published_year,
  //   publisher_id,
  //   quantity,
  //   description,
  //   document_id,
  // }: UpdateDocumentFullDTO) {
  //   try {
  //     await Promise.all([
  //       this.validationService.IsCategoryIdExist(category_id),
  //       this.validationService.IsMajorIdExist(major_id),
  //       this.validationService.IsPublisherIdExist(publisher_id),
  //       this.validationService.IsAuthorIdExist(author_id),
  //       this.prismaService.document.findUniqueOrThrow({
  //         where: {
  //           id_document: document_id,
  //         },
  //       }),
  //     ]);
  //   } catch (e) {
  //     throw new NotFoundException();
  //   }
  //   let image: string;
  //   if (file != undefined) {
  //     //TODO Upload Image
  //   }
  //   let { id_document } = await this.prismaService.document.update({
  //     where: {
  //       id_document: document_id,
  //     },
  //     data: {
  //       document_name,
  //       quantity,
  //       description,
  //       published_year,
  //       id_author: author_id,
  //       id_category: category_id,
  //       id_publisher: publisher_id,
  //       id_major: major_id,
  //     },
  //     select: {
  //       id_document: true,
  //     },
  //   });

  //   return {
  //     status: 'success',
  //     document_id: id_document,
  //   };
  // }
  // async GetDocument(document_id: number) {
  //   let document = await this.prismaService.document.findUnique({
  //     where: {
  //       id_document: document_id,
  //     },
  //     include: {
  //       author: true,
  //       category: true,
  //       major: true,
  //       publisher: true,
  //     },
  //   });
  //   if (!document) throw new NotFoundException();
  //   return document;
  // }
}
