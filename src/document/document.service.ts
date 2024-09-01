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
    category_id,
    limit: document_per_page = 6,
    major_id,
    name,
    page = 1,
    publisher_id,
    quantity,
    max_quantity,
    min_quantity,
    published_year,
    author_id,
    sort_by_col,
    sort_type,
  }: GetDocumentsDTO) {
    let valid = true;
    try {
      await Promise.all([
        (async () => {
          if (category_id == undefined) return true;
          return await this.validationService.IsCategoryIdExist(category_id);
        })(),
        (async () => {
          if (major_id == undefined) return true;
          return await this.validationService.IsMajorIdExist(major_id);
        })(),
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
        this.validationService.IsCollumnExist('document', sort_by_col))
    )
      throw new NotFoundException();
    if (
      (quantity != undefined &&
        (max_quantity != undefined || min_quantity != undefined)) ||
      min_quantity > max_quantity
    )
      throw new BadRequestException();
    let documents = await this.prismaService.document.findMany({
      skip: (page - 1) * document_per_page,
      where: {
        document_name:
          name != undefined
            ? {
                contains: name,
                mode: 'insensitive',
              }
            : undefined,
        id_category: category_id,
        id_major: major_id,
        id_publisher: publisher_id,
        published_year: published_year,
        id_author: author_id,
        quantity:
          quantity != undefined
            ? { equals: quantity }
            : {
                gte: min_quantity,
                lte: max_quantity,
              },
      },
      include: {
        author: true,
      },
      orderBy:
        sort_by_col != undefined
          ? {
              [sort_by_col]: sort_type || 'asc',
            }
          : undefined,
    });
    return {
      data: documents,
      total_page: documents.length / document_per_page,
    };
  }
  async CreateDocument({
    author_id,
    category_id,
    document_name,
    file,
    major_id,
    published_year,
    publisher_id,
    quantity,
    description,
  }: CreateDocumentFullDTO) {
    try {
      await Promise.all([
        this.validationService.IsCategoryIdExist(category_id),
        this.validationService.IsMajorIdExist(major_id),
        this.validationService.IsPublisherIdExist(publisher_id),
        this.validationService.IsAuthorIdExist(author_id),
      ]);
    } catch (e) {
      throw new NotFoundException();
    }
    let image: string;
    if (file != undefined) {
      //TODO Upload Image
    }
    let { id_document } = await this.prismaService.document.create({
      data: {
        image,
        document_name,
        quantity,
        description,
        published_year,
        id_author: author_id,
        id_category: category_id,
        id_publisher: publisher_id,
        id_major: major_id,
      },
      select: {
        id_document: true,
      },
    });

    return {
      status: 'success',
      document_id: id_document,
    };
  }
  async UpdateDocument({
    author_id,
    category_id,
    document_name,
    file,
    major_id,
    published_year,
    publisher_id,
    quantity,
    description,
    document_id,
  }: UpdateDocumentFullDTO) {
    try {
      await Promise.all([
        this.validationService.IsCategoryIdExist(category_id),
        this.validationService.IsMajorIdExist(major_id),
        this.validationService.IsPublisherIdExist(publisher_id),
        this.validationService.IsAuthorIdExist(author_id),
        this.prismaService.document.findUniqueOrThrow({
          where: {
            id_document: document_id,
          },
        }),
      ]);
    } catch (e) {
      throw new NotFoundException();
    }
    let image: string;
    if (file != undefined) {
      //TODO Upload Image
    }
    let { id_document } = await this.prismaService.document.update({
      where: {
        id_document: document_id,
      },
      data: {
        image,
        document_name,
        quantity,
        description,
        published_year,
        id_author: author_id,
        id_category: category_id,
        id_publisher: publisher_id,
        id_major: major_id,
      },
      select: {
        id_document: true,
      },
    });

    return {
      status: 'success',
      document_id: id_document,
    };
  }
  async GetDocument(document_id: number) {
    let document = await this.prismaService.document.findUnique({
      where: {
        id_document: document_id,
      },
      include: {
        author: true,
        category: true,
        major: true,
        publisher: true,
      },
    });
    if (!document) throw new NotFoundException();
    return document;
  }
}
