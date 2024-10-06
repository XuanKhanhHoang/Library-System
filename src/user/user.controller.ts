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
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { UserService } from './user.service';
import { RequiredRoles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestObject } from 'src/auth/dto/request.dto';
import { GetUserListDTO } from './dto/getUserList.dto';
import { UpdateUserDTO } from './dto/updateUser.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CreateUserDTO } from './dto/createUser.dto';

@UseGuards(AuthGuard, RoleGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('manager/create_user')
  @RequiredRoles(Role.Manager)
  @UseInterceptors(FileInterceptor('avatar'))
  CreateUser(
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
    @Body() body: CreateUserDTO,
  ) {
    return this.userService.CreateUser(file, body);
  }

  @Get('manager/get_users')
  @RequiredRoles(Role.Manager)
  GetUserList(@Query() query: GetUserListDTO) {
    console.log(query);
    return this.userService.GetUserList(query);
  }

  @RequiredRoles(Role.User)
  @Get('get_user')
  GetReaderManager(
    @Request() req: RequestObject,
    @Query('user_id', ParseIntPipe) userId,
  ) {
    let { id_user, is_librian } = req.user;
    if (id_user != userId && !is_librian) throw new ForbiddenException();
    return this.userService.GetUser(userId, is_librian);
  }
  @RequiredRoles(Role.User)
  @Put('update_user')
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
    @Body() body: UpdateUserDTO,
    @Request() req: RequestObject,
  ) {
    let { id_user, is_librian } = req.user;
    if (id_user != body.id_user && !is_librian) throw new ForbiddenException();
    return this.userService.UpdateUser(file, body);
  }

  // @RequiredRoles(Role.Manager)
  // @Delete('manager/delete_permanent_reader')
  // DeletePermanentReader(
  //   @Request() req: RequestObject,
  //   @Query('reader_id', ParseIntPipe) readerId,
  // ) {
  //   this.ReaderService.DeletePermanentReader(readerId);
  // }
}
