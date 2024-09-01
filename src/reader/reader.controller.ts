import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  ForbiddenException,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  ParseBoolPipe,
  ParseFilePipe,
  ParseIntPipe,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { ReaderService } from './reader.service';
import { RequiredRoles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestObject } from 'src/auth/dto/request.dto';
import { GetReaderListDTO } from './dto/getReaderList.dto';
import { UpdateReaderDTO } from './dto/updateReader.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleGuard } from 'src/auth/guards/role.guard';

@UseGuards(AuthGuard, RoleGuard)
@Controller('reader')
export class ReaderController {
  constructor(private ReaderService: ReaderService) {}

  // @Get('manager/create_reader')
  // @RequiredRoles(Role.Manager)
  // CreateReaderList(@Query() query: GetReaderListDTO) {
  //   return this.ReaderService.GetReaderList(query);
  // }

  @Get('manager/get_readers')
  @RequiredRoles(Role.Manager)
  GetReaderList(@Query() query: GetReaderListDTO) {
    return this.ReaderService.GetReaderList(query);
  }

  @RequiredRoles(Role.Manager)
  @Get('manager/get_reader')
  GetReaderManager(
    @Request() req: RequestObject,
    @Query('reader_id', ParseIntPipe) readerId,
  ) {
    let { id_user } = req.user;
    return this.ReaderService.GetReader(readerId, id_user, true);
  }
  @RequiredRoles(Role.User)
  @Get('get_reader')
  GetReader(
    @Request() req: RequestObject,
    @Query('reader_id', ParseIntPipe) readerId,
  ) {
    let { id_user } = req.user;
    return this.ReaderService.GetReader(readerId, id_user, false);
  }
  @RequiredRoles(Role.Manager)
  @Put('manager/update_reader')
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(200)
  UpdateReaderManager(
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
    @Body() body: UpdateReaderDTO,
    @Request() req: RequestObject,
  ) {
    let { id_user } = req.user;
    return this.ReaderService.UpdateReader(id_user, true, file, body);
  }
  @RequiredRoles(Role.User)
  @Put('update_reader')
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(200)
  UpdateReader(
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
    @Body() body: UpdateReaderDTO,
    @Request() req: RequestObject,
  ) {
    let { id_user } = req.user;
    return this.ReaderService.UpdateReader(id_user, false, file, body);
  }

  @RequiredRoles(Role.Manager)
  @Delete('manager/delete_permanent_reader')
  DeletePermanentReader(
    @Request() req: RequestObject,
    @Query('reader_id', ParseIntPipe) readerId,
  ) {
    this.ReaderService.DeletePermanentReader(readerId);
  }
}
