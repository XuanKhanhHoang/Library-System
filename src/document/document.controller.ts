import { Controller, Get } from '@nestjs/common';
import { DocumentService } from './document.service';

@Controller('document')
export class DocumentController {
  constructor(private documentService: DocumentService) {}
  @Get('get_preview_documents')
  async GetPreviewDocument() {
    return this.documentService;
  }
}
