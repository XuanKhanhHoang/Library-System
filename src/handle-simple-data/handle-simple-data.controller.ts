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
}
