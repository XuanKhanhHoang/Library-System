import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ValidationService {
  constructor(private prismaService: PrismaService) {}
  IsCollumnExist(modelName: string, collumn: string) {
    const prismaModels = Prisma.dmmf.datamodel.models;
    const model = prismaModels.find((model) => model.name === modelName);
    const columnExists = model
      ? model.fields.some((field) => field.name === collumn)
      : false;
    return columnExists;
  }
  async IsMajorIdExist(majorId: number) {
    return (
      (await this.prismaService.major.findUniqueOrThrow({
        where: {
          id_major: majorId,
        },
      })) != undefined
    );
  }
  async IsCategoryIdExist(categoryId: number) {
    return (
      (await this.prismaService.category.findUniqueOrThrow({
        where: {
          id_category: categoryId,
        },
      })) != undefined
    );
  }
  async IsPublisherIdExist(publisherId: number) {
    return (
      (await this.prismaService.publisher.findUniqueOrThrow({
        where: {
          id_publisher: publisherId,
        },
      })) != undefined
    );
  }
  async IsAuthorIdExist(authorId: number) {
    return (
      (await this.prismaService.author.findUniqueOrThrow({
        where: {
          id_author: authorId,
        },
      })) != undefined
    );
  }
}
