import { Global, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Global()
@Injectable()
export class ValidationService {
  constructor(private prismaService: PrismaService) {}
  IsColumnExist(modelName: string, collumn: string) {
    const prismaModels = Prisma.dmmf.datamodel.models;
    const model = prismaModels.find((model) => model.name === modelName);
    const columnExists = model
      ? model.fields.some((field) => field.name === collumn)
      : false;
    return columnExists;
  }
  async IsMajorIdExist(majorId: number) {
    return (
      (await this.prismaService.major.findUnique({
        where: {
          id_major: majorId,
        },
      })) != undefined
    );
  }
  async IsCategoryIdExist(categoryId: number) {
    return (
      (await this.prismaService.category.findUnique({
        where: {
          id_category: categoryId,
        },
      })) != undefined
    );
  }
  async IsPublisherIdExist(publisherId: number) {
    return (
      (await this.prismaService.publisher.findUnique({
        where: {
          id_publisher: publisherId,
        },
      })) != undefined
    );
  }
  async IsAuthorIdExist(authorId: number) {
    return (
      (await this.prismaService.author.findUnique({
        where: {
          id_author: authorId,
        },
      })) != undefined
    );
  }
  async IsUserIdExist(userId: number) {
    return (
      (await this.prismaService.user.findUnique({
        where: {
          id_user: userId,
        },
      })) != undefined
    );
  }
  async IsDocumentIdExist(id: number) {
    return (
      (await this.prismaService.document.findUnique({
        where: {
          document_id: id,
        },
      })) != undefined
    );
  }
}
