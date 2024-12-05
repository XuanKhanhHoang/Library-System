import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationService } from 'src/share/validation/validation.service';

@Injectable()
export class HandleSimpleDataService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}
  async GetCategories() {
    return await this.prismaService.category.findMany({
      where: {},
    });
  }
  async GetCategory(category_id: number) {
    return await this.prismaService.category.findMany({
      where: { id_category: category_id },
    });
  }
  async CreateCategory(name: string) {
    return await this.prismaService.category.create({
      data: {
        category_name: name,
      },
    });
  }
  async GetMajors() {
    return await this.prismaService.category.findMany({
      where: {},
    });
  }
  async GetMajor(category_id: number) {
    return await this.prismaService.major.findUnique({
      where: { id_major: category_id },
    });
  }
  async CreateMajor(name: string) {
    return await this.prismaService.major.create({
      data: {
        major_name: name,
      },
    });
  }
  async CreateAuthor(name: string) {
    return await this.prismaService.author.create({
      data: {
        author_name: name,
      },
    });
  }
  async CreateSupplier(name: string) {
    return await this.prismaService.supplier.create({
      data: {
        supplier_name: name,
      },
    });
  }
  async GetJobTitles() {
    return await this.prismaService.category.findMany({
      where: {},
    });
  }
  async CreatePublisher(name: string) {
    return await this.prismaService.publisher.create({
      data: {
        publisher_name: name,
      },
    });
  }
  async GetJobTitle(category_id: number) {
    return await this.prismaService.category.findMany({
      where: { id_category: category_id },
    });
  }
  async CreateJobTitle(name: string) {
    return await this.prismaService.job_title.create({
      data: {
        job_title_name: name,
      },
    });
  }
  async GetSuppliers() {
    return await this.prismaService.supplier.findMany({
      where: {},
    });
  }

  async GetAuthors() {
    return await this.prismaService.author.findMany({
      where: {},
    });
  }
  async GetPublishers() {
    return await this.prismaService.publisher.findMany({
      where: {},
    });
  }
}
