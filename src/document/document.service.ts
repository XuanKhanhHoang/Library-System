import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetDocumentsDTO } from './dto/getDocumnets.dto';
import { ValidationService } from 'src/share/validation/validation.service';

@Injectable()
export class DocumentService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}
  async GetDocuments({
    category_id,
    document_per_page = 6,
    major_id,
    name,
    page = 1,
    publisher_id,
    quantity,
    max_quantity,
    min_quantity,
    published_year,
    author_id,
  }: GetDocumentsDTO) {
    if (
      (category_id != undefined &&
        !(await this.validationService.IsCategoryIdExist(category_id))) ||
      (major_id != undefined &&
        !(await this.validationService.IsMajorIdExist(major_id))) ||
      (publisher_id != undefined &&
        !(await this.validationService.IsPublisherIdExist(publisher_id))) ||
      (author_id != undefined &&
        !(await this.validationService.IsAuthorIdExist(author_id)))
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
    });
  }
}
