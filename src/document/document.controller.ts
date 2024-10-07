import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { query } from 'express';
import { GetDocumentsDTO } from './dto/getDocumnets.dto';
import { CreateDocumentDTO } from './dto/createDocument.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorators/public.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { UpdateDocumentDTO } from './dto/updateDocument.dto';
import { RequiredRoles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';

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
  // @RequiredRoles(Role.Manager)
  // @Post('manager/create_document')
  // @UseInterceptors(FileInterceptor('image'))
  // @HttpCode(201)
  // async CreateDocument(
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new MaxFileSizeValidator({ maxSize: 3000 }),
  //         new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
  //       ],
  //       fileIsRequired: false,
  //     }),
  //   )
  //   file: Express.Multer.File,
  //   @Body() data: CreateDocumentDTO,
  // ) {
  //   return this.documentService.CreateDocument({ ...data, file });
  // }
  // @RequiredRoles(Role.Manager)
  // @Put('manager/update_document')
  // @UseInterceptors(FileInterceptor('image'))
  // @HttpCode(200)
  // async UpdateDocument(
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new MaxFileSizeValidator({ maxSize: 3000 }),
  //         new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }),
  //       ],
  //       fileIsRequired: false,
  //     }),
  //   )
  //   file: Express.Multer.File,
  //   @Body() data: UpdateDocumentDTO,
  // ) {
  //   return this.documentService.UpdateDocument({ ...data, file });
  // }
  //TODO Delete Document
}
