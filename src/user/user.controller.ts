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
  Req,
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
import { GoogleDriveService } from 'src/google_drive/google_drive.service';

@UseGuards(AuthGuard, RoleGuard)
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private ggDriveService: GoogleDriveService,
  ) {}

  @Post('manager/create_user')
  @RequiredRoles(Role.Manager)
  @UseInterceptors(FileInterceptor('avatar'))
  async CreateUser(
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
    const res = await this.userService.CreateUser(body);
    if (res.status == 'success') {
      const upRes = await this.userService.UploadAvatar(file, res.id_user);
      if (upRes != null)
        return {
          status: 'success',
          message: 'user created successfully and avatar updated',
        };
      return {
        status: 'not-complete success',
        message: "user created successfully and avatar isn't updated",
      };
    }
  }

  @Get('manager/get_users')
  @RequiredRoles(Role.Manager)
  GetUserList(@Query() query: GetUserListDTO) {
    return this.userService.GetUserList(query);
  }
  @Get('get_number_user_of_type')
  @RequiredRoles(Role.Manager)
  GetNumberUserOfType() {
    return this.userService.GetNumberUserOfType();
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
  async UpdateReaderManager(
    @Body() body: UpdateUserDTO,
    @Request() req: RequestObject,
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
    let { id_user, is_librian } = req.user;
    if (id_user != body.id_user && !is_librian) throw new ForbiddenException();
    const res = await this.userService.UpdateUser(body);
    if (!file)
      return {
        status: 'success',
        message: 'user updated successfully',
      };
    if (res.status == 'success') {
      const upRes = await this.userService.UploadAvatar(file, res.id_user);
      if (upRes != null)
        return {
          status: 'success',
          message: 'user updated successfully and avatar updated',
        };
      return {
        status: 'not-complete success',
        message: "user updated successfully and avatar isn't updated",
      };
    }
  }

  @RequiredRoles(Role.Manager)
  @Put('disable_user')
  @HttpCode(204)
  async DisableUser(@Query() query) {
    const value = query.id;
    const id = Array.isArray(value)
      ? value.map((item) => parseInt(item, 10)).filter((item) => !isNaN(item))
      : isNaN(parseInt(value, 10))
        ? undefined
        : [parseInt(value, 10)];
    if (!id) throw new BadRequestException();
    return this.userService.DisableUser(id);
  }
  @RequiredRoles(Role.Manager)
  @Delete('delete_user')
  @HttpCode(204)
  async DeleteUser(@Query() query) {
    const value = query.id;
    const id = Number(value);
    if (!value || (value && !value.id && isNaN(id)))
      throw new BadRequestException();
    return this.userService.DeleteUser(id);
  }
  @Post('change_password')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async ChangePassword(
    @Req() req: RequestObject,
    @Body('new_password') newPassword: string,
  ) {
    const { user } = req;
    if (newPassword.length < 6 || !newPassword)
      throw new BadRequestException('new password is invalid');
    return this.userService.ChangePassword(newPassword, user.id_user);
  }
}
