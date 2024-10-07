import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetDocumentsDTO } from './dto/getDocumnets.dto';
import { ValidationService } from 'src/share/validation/validation.service';
import {
  CreateDocumentDTO,
  CreateDocumentFullDTO,
  CreateVariantDTO,
} from './dto/createDocumentAndVariant.dto';
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
    document_id,
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
        document_id: document_id,
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
  async GetDocument(did: number) {
    let dc = await this.prismaService.document.findUnique({
      where: {
        document_id: did,
      },
      include: {
        author: true,
        publisher: true,
        document_ref_category: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
    });
    if (!dc) throw new NotFoundException();
    return dc;
  }
  async GetVariant(isbn: string) {
    let v = await this.prismaService.document_variant.findUnique({
      where: {
        isbn: isbn,
      },
      include: {
        image: true,
      },
    });
    if (!v) throw new NotFoundException();
    return v;
  }
  async CreateDocument(data: CreateDocumentDTO, image?: Express.Multer.File) {
    try {
      return await this.prismaService.$transaction(
        async (service: PrismaService) => {
          let check = data.categories.map((val) => {
            return this.validationService.IsCategoryIdExist(val).then((res) => {
              if (!res) throw new NotFoundException();
              return res;
            });
          });
          await Promise.all(check);

          let { document_id } = await service.document.create({
            data: {
              document_name: data.document_name,
              description: data.description,
              id_author: data.author_id,
              id_publisher: data.publisher_id,
            },
            select: {
              document_id: true,
            },
          });
          let d_ref_c = data.categories.map((val) => ({
            document_id,
            category_id: val,
          }));
          let vrs = data.variants.map((val) => ({
            isbn: val.isbn,
            document_id: document_id,
            quantity: val.quantity,
            published_date: val.published_date,
            name: val.name,
          }));
          await Promise.all([
            service.document_ref_category.createMany({
              data: d_ref_c,
            }),
            service.document_variant.createMany({
              data: vrs,
            }),
          ]);
          return {
            status: 'success',
            message: `document with id is ${document_id} is created`,
          };
        },
      );
    } catch (error) {
      throw error;
    }
  }
  async CreateVariant(data: CreateVariantDTO, image?: Express.Multer.File) {
    if (
      (await this.validationService.IsDocumentIdExist(data.document_id)) ==
      false
    )
      throw new NotFoundException();
    await this.prismaService.document_variant.create({
      data: {
        isbn: data.isbn,
        published_date: data.published_date,
        quantity: data.quantity,
        document_id: data.document_id,
        name: data.name,
      },
      select: {
        document_id: true,
      },
    });
    return {
      status: 'success',
      message: `variant with isbn is ${data.isbn} is created`,
    };
  }
  async UpdateDocument(data: CreateDocumentDTO, image?: Express.Multer.File) {
    try {
      return await this.prismaService.$transaction(
        async (service: PrismaService) => {
          let check = data.categories.map((val) => {
            return this.validationService.IsCategoryIdExist(val).then((res) => {
              if (!res) throw new NotFoundException();
              return res;
            });
          });
          await Promise.all(check);

          let { document_id } = await service.document.create({
            data: {
              document_name: data.document_name,
              description: data.description,
              id_author: data.author_id,
              id_publisher: data.publisher_id,
            },
            select: {
              document_id: true,
            },
          });
          let d_ref_c = data.categories.map((val) => ({
            document_id,
            category_id: val,
          }));
          let vrs = data.variants.map((val) => ({
            isbn: val.isbn,
            document_id: document_id,
            quantity: val.quantity,
            published_date: val.published_date,
          }));
          await Promise.all([
            service.document_ref_category.createMany({
              data: d_ref_c,
            }),
            // service.document_variant.createMany({
            //   data: vrs,
            // }),
          ]);
          return {
            status: 'success',
            message: `document with id is ${document_id} is created`,
          };
        },
      );
    } catch (error) {
      throw error;
    }
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
