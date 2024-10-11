import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { query } from 'express';
import { GetDocumentsDTO } from './dto/getDocumnets.dto';
import {
  CreateDocumentDTO,
  CreateVariantDTO,
} from './dto/createDocumentAndVariant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorators/public.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { RequiredRoles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RequestObject } from 'src/auth/dto/request.dto';
import { UpdateDocumentDTO } from './dto/updateDocumentAndVariant.dto';

@Controller('document')
@UseGuards(AuthGuard, RoleGuard)
export class DocumentController {
  constructor(private documentService: DocumentService) {}
  @Public()
  @Get('get_preview_documents')
  async GetPreviewDocument(@Query() query: GetDocumentsDTO) {
    return this.documentService.GetDocuments(query);
  }
  @Public()
  @Get('get_document')
  async GetDocument(@Query('document_id', ParseIntPipe) document_id: number) {
    return this.documentService.GetDocument(document_id);
  }
  @Public()
  @Get('get_variant')
  async GetVariants(@Query('isbn') isbn: string) {
    return this.documentService.GetVariant(isbn);
  }
  // @Public()
  // @Get('get_variants_by_document_id')
  // async GetVariantsByDocumentId(@Query('id') : number) {
  //   return this.documentService.GetVariantsByDocumentId();
  // }
  @RequiredRoles(Role.Manager)
  @Post('create_document')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(201)
  async CreateDocument(
    @Body() data: CreateDocumentDTO,
    @Req() req: RequestObject,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 3000 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    const { user } = req;
    return this.documentService.CreateDocument(user.id_user, data, file);
  }
  @RequiredRoles(Role.Manager)
  @Post('create_variant')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(201)
  async CreateVariant(
    @Body() data: CreateVariantDTO,
    @Req() req: RequestObject,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 3000 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    const { user } = req;
    return this.documentService.CreateVariant(data, user.id_user, file);
  }
  @RequiredRoles(Role.Manager)
  @Put('update_document')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(200)
  async UpdateDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 3000 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
    @Body() data: UpdateDocumentDTO,
  ) {
    return this.documentService.UpdateDocument(data, file);
  }
  @RequiredRoles(Role.Manager)
  @Delete('delete_documents')
  @HttpCode(204)
  async DeleteDocuments(@Query() query) {
    const value = query.id;
    const id = Array.isArray(value)
      ? value.map((item) => parseInt(item, 10)).filter((item) => !isNaN(item))
      : isNaN(parseInt(value, 10))
        ? undefined
        : [parseInt(value, 10)];
    if (!id) throw new BadRequestException();
    return this.documentService.DeleteDocument(id);
  }
  //TODO Delete Document
}
