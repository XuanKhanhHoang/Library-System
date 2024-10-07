import { Controller, Get, Query } from '@nestjs/common';
import { HandleSimpleDataService } from './handle-simple-data.service';

@Controller('handle-simple-data')
export class HandleSimpleDataController {
  constructor(private service: HandleSimpleDataService) {}
  @Get('get_categories')
  getCategory(@Query() qr) {
    return this.service.GetCategories();
  }
  @Get('get_majors')
  getMajor(@Query() qr) {
    return this.service.GetMajors();
  }
  @Get('get_job_titles')
  getJobTitle(@Query() qr) {
    return this.service.GetJobTitles();
  }
  @Get('get_suppliers')
  getSuppliers(@Query() qr) {
    return this.service.GetSuppliers();
  }
  @Get('get_authors')
  getAuthors(@Query() qr) {
    return this.service.GetAuthors();
  }
  @Get('get_publishers')
  getPublishers(@Query() qr) {
    return this.service.GetPublishers();
  }
}
