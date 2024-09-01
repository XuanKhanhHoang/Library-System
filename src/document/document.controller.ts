import { Controller, Get, Query } from '@nestjs/common';
import { DocumentService } from './document.service';
import { query } from 'express';
import { GetDocumentsDTO } from './dto/getDocumnets.dto';

@Controller('document')
export class DocumentController {
  constructor(private documentService: DocumentService) {}
  @Get('get_preview_documents')
  async GetPreviewDocument(@Query() query: GetDocumentsDTO) {
    return this.documentService.GetDocuments(query);
  }
}
