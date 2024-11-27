import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { HandleSimpleDataService } from './handle-simple-data.service';

@Controller('handle-simple-data')
export class HandleSimpleDataController {
  constructor(private service: HandleSimpleDataService) {}
  @Get('get_categories')
  getCategory(@Query() qr) {
    return this.service.GetCategories();
  }
  @Post()
  createCategory(@Body('name') cateName: string) {
    if (!cateName.trim()) throw new BadRequestException();
    this.service.CreateCategory(cateName);
  }
  @Get('get_majors')
  getMajor(@Query() qr) {
    return this.service.GetMajors();
  }
  @Post()
  createMajor(@Body('name') name: string) {
    if (!name.trim()) throw new BadRequestException();
    this.service.CreateMajor(name);
  }
  @Get('get_job_titles')
  getJobTitle(@Query() qr) {
    return this.service.GetJobTitles();
  }
  @Post()
  createJobTitle(@Body('name') name: string) {
    if (!name.trim()) throw new BadRequestException();
    this.service.CreateJobTitle(name);
  }
  @Get('get_suppliers')
  getSuppliers(@Query() qr) {
    return this.service.GetSuppliers();
  }
  @Post()
  createSupplier(@Body('name') name: string) {
    if (!name.trim()) throw new BadRequestException();
    this.service.CreateSupplier(name);
  }
  @Get('get_authors')
  getAuthors(@Query() qr) {
    return this.service.GetAuthors();
  }
  @Post()
  createAuthor(@Body('name') name: string) {
    if (!name.trim()) throw new BadRequestException();
    this.service.CreateAuthor(name);
  }
  @Get('get_publishers')
  getPublishers(@Query() qr) {
    return this.service.GetPublishers();
  }
  @Post()
  createPublisher(@Body('name') name: string) {
    if (!name.trim()) throw new BadRequestException();
    this.service.CreatePublisher(name);
  }
}
