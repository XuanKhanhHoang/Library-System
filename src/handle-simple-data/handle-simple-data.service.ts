import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
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
  async GetJobTitles() {
    return await this.prismaService.category.findMany({
      where: {},
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
}
