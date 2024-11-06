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
  UploadedFiles,
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
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
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

  @Public()
  @Get('get_number_document_of_category')
  async GetVariantsByDocumentId() {
    return this.documentService.GetNumberDocumentOfCategory();
  }
  @RequiredRoles(Role.Manager)
  @Post('create_document')
  @UseInterceptors(FilesInterceptor('images'))
  @HttpCode(201)
  async CreateDocument(
    @Body() data: CreateDocumentDTO,
    @Req() req: RequestObject,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 3000 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    files?: Express.Multer.File[],
  ) {
    const { user } = req;
    const documentResult = await this.documentService.CreateDocument(
      user.id_user,
      data,
    );
    if (documentResult.status === 'success') {
      const imgStatus = await this.documentService.UploadImages(
        documentResult.document_id,
        files,
      );
      if (imgStatus.status == 'success')
        return {
          status: 'success',
          message: `Images uploaded and created successfully for document ID ${documentResult.document_id}`,
        };
      else
        return {
          status: 'success',
          message: `Document with ID ${documentResult.document_id} is created but failed to upload some image`,
        };
    }
  }
  @RequiredRoles(Role.Manager)
  @Post('create_variant')
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
  @UseInterceptors(FilesInterceptor('images'))
  @HttpCode(200)
  async UpdateDocument(
    @Body() data: UpdateDocumentDTO,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 3000 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    files?: Express.Multer.File[],
  ) {
    const documentResult = await this.documentService.UpdateDocument(data);
    if (documentResult.status === 'success') {
      const imgStatus = await this.documentService.UploadImages(
        data.document_id,
        files,
      );
      if (imgStatus.status == 'success')
        return {
          status: 'success',
          message: `Images uploaded and update successfully for document ID ${data.document_id}`,
        };
      else
        return {
          status: 'success',
          message: `Document with ID ${data.document_id} is update but failed to upload some images`,
        };
    }
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
