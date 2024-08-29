import {
  BadRequestException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  ParseBoolPipe,
  ParseIntPipe,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { ReaderService } from './reader.service';
import { RequiredRoles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestObject } from 'src/auth/dto/request.dto';
import { GetReaderListDTO } from './dto/getReaderList.dto';

@UseGuards(AuthGuard)
@Controller('reader')
export class ReaderController {
  constructor(private ReaderService: ReaderService) {}
  @Get('get_readers')
  @RequiredRoles(Role.Manager)
  GetReaderList(@Query() query: GetReaderListDTO) {
    return this.ReaderService.GetReaderList(query);
  }
  @RequiredRoles(Role.User)
  @Get('get_reader')
  GetReader(
    @Request() req: RequestObject,
    @Query('reader_id', ParseIntPipe) readerId,
  ) {
    let { id_user, is_librian } = req.user;
    return this.ReaderService.GetReader(readerId, id_user, is_librian);
  }

  @RequiredRoles(Role.User)
  @Put('update_reader')
  UpdateReader(
    @Request() req: RequestObject,
    @Query('reader_id', ParseIntPipe) readerId,
  ) {
    let { id_user, is_librian } = req.user;
    return this.ReaderService;
  }
  @RequiredRoles(Role.User)
  @Put('set_invalid_user')
  SetValidUser(
    @Request() req: RequestObject,
    @Query('reader_id', ParseIntPipe) readerId,
  ) {
    let { id_user, is_librian } = req.user;
    if (id_user != id_user && !is_librian) throw new ForbiddenException();
    return this.ReaderService;
  }
}
