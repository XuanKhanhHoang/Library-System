import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetDocumentsDTO } from './dto/getDocumnets.dto';
import { ValidationService } from 'src/share/validation/validation.service';
import {
  CreateDocumentDTO,
  CreateVariantDTO,
} from './dto/createDocumentAndVariant.dto';
import { UpdateDocumentDTO } from './dto/updateDocumentAndVariant.dto';
import { GoogleDriveService } from 'src/google_drive/google_drive.service';

@Injectable()
export class DocumentService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
    private ggDriveService: GoogleDriveService,
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
    let count = await this.prismaService.document.count({
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
    });
    let documents = await this.prismaService.document.findMany({
      skip: (page - 1) * document_per_page,
      take: document_per_page,
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
        image: {
          take: 1,
        },
      },
      orderBy: sort_by_col
        ? {
            [sort_by_col]: sort_type || 'asc',
          }
        : undefined,
    });
    return {
      data: documents.map((item) => ({
        ...item,
        image: item?.image[0]?.image,
      })),
      total_page: Math.ceil(count / document_per_page),
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
        image: true,
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
    });
    if (!v) throw new NotFoundException();
    return v;
  }
  async CreateDocument(id_user: number, data: CreateDocumentDTO) {
    try {
      return await this.prismaService.$transaction(
        async (service: PrismaService) => {
          // Validate categories
          const check = data.categories.map((val) => {
            return this.validationService.IsCategoryIdExist(val).then((res) => {
              if (!res) throw new NotFoundException();
              return res;
            });
          });
          await Promise.all(check);

          // Create document and purchase records
          const [document_id, purchase_id] = await Promise.all([
            service.document
              .create({
                data: {
                  document_name: data.document_name,
                  description: data.description,
                  id_author: data.author_id,
                  id_publisher: data.publisher_id,
                },
                select: { document_id: true },
              })
              .then((res) => res.document_id),
            service.document_purchase
              .create({
                data: {
                  id_supplier: data.supplier_id,
                  purchase_date: data.purchase_date,
                  id_librarian: id_user,
                },
                select: { id_purchase: true },
              })
              .then((res) => res.id_purchase),
          ]);

          // Prepare data for related tables
          const d_ref_c = data.categories.map((val) => ({
            document_id,
            category_id: val,
          }));
          const vrs = data.variants.map((val) => ({
            isbn: val.isbn,
            document_id: document_id,
            quantity: val.quantity,
            published_date: val.published_date,
            name: val.name,
          }));

          // Create related records
          const [, purchaseItems] = await Promise.all([
            service.document_ref_category.createMany({ data: d_ref_c }),
            service.document_variant
              .createManyAndReturn({
                data: vrs,
                select: { isbn: true },
              })
              .then((res) =>
                res.map((item) => ({
                  purchase_id,
                  isbn: item.isbn,
                  quantity: data.variants.find((it) => it.isbn == item.isbn)
                    .quantity,
                  price: data.variants.find((it) => it.isbn == item.isbn).price,
                })),
              ),
          ]);

          // Create purchase list
          await service.document_puchase_list.createMany({
            data: purchaseItems,
          });

          return {
            status: 'success',
            message: `Document with ID ${document_id} is created`,
            document_id,
          };
        },
      );
    } catch (error) {
      throw error;
    }
  }
  async UploadImages(document_id: number, images?: Express.Multer.File[]) {
    try {
      const uploadImage = images.map((item, index) => {
        return this.ggDriveService
          .uploadFile(item, document_id + 'n' + index)
          .catch((error) => {
            console.error(
              `Failed to upload image: ${item.originalname}`,
              error,
            );
            return null; // Return null for failed uploads
          });
      });

      const imagesLink = await Promise.all(uploadImage);
      const validImagesLink = imagesLink.filter((link) => link !== null);

      const saveImagesLink = validImagesLink.map((item) => ({
        doc_id: document_id,
        image: item,
      }));

      await this.prismaService.$transaction(async (service: PrismaService) => {
        service.document_image.deleteMany({
          where: {
            doc_id: document_id,
          },
        });
        await service.document_image.createMany({ data: saveImagesLink });
      });

      return {
        status: 'success',
        message: `Images uploaded successfully for document ID ${document_id}`,
      };
    } catch (error) {
      throw error;
    }
  }

  async CreateVariant(
    data: CreateVariantDTO,
    id_user: number,
    image?: Express.Multer.File,
  ) {
    if (
      (await this.validationService.IsDocumentIdExist(data.document_id)) ==
      false
    )
      throw new NotFoundException();
    try {
      return await this.prismaService.$transaction(
        async (service: PrismaService) => {
          let purchase_id = await service.document_purchase
            .create({
              data: {
                id_supplier: data.supplier_id,
                purchase_date: data.purchase_date,
                id_librarian: id_user,
              },
              select: {
                id_purchase: true,
              },
            })
            .then((res) => res.id_purchase);
          await Promise.all([
            service.document_variant.create({
              data: {
                isbn: data.isbn,
                published_date: data.published_date,
                quantity: data.quantity,
                document_id: data.document_id,
                name: data.name,
              },
            }),
            service.document_puchase_list.create({
              data: {
                price: data.price,
                quantity: data.quantity,
                isbn: data.isbn,
                purchase_id: purchase_id,
              },
            }),
          ]);
          return {
            status: 'success',
            message: `variant with isbn is ${data.isbn} is created`,
          };
        },
      );
    } catch (error) {
      throw error;
    }
  }
  async UpdateDocument(data: UpdateDocumentDTO, image?: Express.Multer.File) {
    try {
      return await this.prismaService.$transaction(
        async (service: PrismaService) => {
          const { document_id } = data;
          let check = data.categories.map((val) => {
            return this.validationService.IsCategoryIdExist(val).then((res) => {
              if (!res) throw new NotFoundException();
              return res;
            });
          });

          await Promise.all(check);

          await service.document.update({
            where: {
              document_id: data.document_id,
            },
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
          let d_ref_c = data.categories.map((val) => {
            return service.document_ref_category.update({
              where: {
                document_id_category_id: {
                  document_id,
                  category_id: val,
                },
              },
              data: {
                category_id: val,
              },
            });
          });
          let vrs = data.variants.map((val) => {
            return service.document_variant.upsert({
              where: {
                isbn: val.isbn,
              },
              update: {
                isbn: val.isbn,
                quantity: val.quantity,
                published_date: val.published_date,
                name: val.name,
              },
              create: {
                isbn: val.isbn,
                quantity: val.quantity,
                published_date: val.published_date,
                name: val.name,
                document_id,
              },
              select: {
                isbn: true,
              },
            });
          });
          let vrsDel = service.document_variant.deleteMany({
            where: {
              document_id,
              isbn: { notIn: data.variants.map((val) => val.isbn) },
            },
          });
          let d_ref_cDel = service.document_ref_category.deleteMany({
            where: {
              document_id,
              category_id: { notIn: data.categories.map((val) => val) },
            },
          });
          let a = await Promise.all([...d_ref_c, ...vrs, vrsDel, d_ref_cDel]);
          return {
            status: 'success',
            message: `document with id is ${document_id} is updated`,
          };
        },
      );
    } catch (error) {
      throw error;
    }
  }
  async DeleteDocument(id: number[]) {
    await this.prismaService.document.deleteMany({
      where: {
        document_id: {
          in: id,
        },
      },
    });
    return { message: 'delete successfully', status: 'success' };
  }
  async GetNumberDocumentOfCategory() {
    let sql = `select count(document_id)  AS doc_count,category_id,c.category_name from document_ref_category crf join categories c on crf.category_id=c.id_category group by category_id ,category_name `;
    let results = (await this.prismaService.$queryRawUnsafe(sql)) as {
      doc_count: BigInt;
      category_id: number;
      category_name: string;
    }[];

    let serializedResults = results.map((row) => ({
      ...row,
      doc_count: Number(row.doc_count),
    }));
    return serializedResults;
  }
}

('from category ');
