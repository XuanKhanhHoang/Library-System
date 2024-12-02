import {
  BadRequestException,
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import {
  GetLoanRequestList,
  GetUserLoanRequestList,
} from './dtos/GetLoanRequestList.dto';
import { LoanRequestService } from './loan_request.service';
import { ListID } from './dtos/ListId.dto';
import { RequiredRoles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RequestObject } from 'src/auth/dto/request.dto';
import { CreateLoanRequest } from './dtos/CreateLoanRequest.dto';

@Controller('loan-request')
@UseGuards(AuthGuard, RoleGuard)
export class LoanRequestController {
  constructor(private service: LoanRequestService) {}

  @Get('get_list')
  @RequiredRoles(Role.Manager)
  GetList(@Query() query: GetLoanRequestList) {
    const { max_date, min_date } = query;
    if (max_date < min_date) throw new BadRequestException();
    return this.service.GetList(query);
  }
  //** Now user call to here to get loan request list belong this user*/
  //* RequiredQuery: GetUserLoanRequestList */
  @Get('get_user_list')
  @RequiredRoles(Role.User)
  GetUserList(
    @Query() query: GetUserLoanRequestList,
    @Req() req: RequestObject,
  ) {
    const { max_date, min_date } = query;
    if (max_date < min_date) throw new BadRequestException();
    return this.service.GetList({ ...query, user_id: req.user.id_user });
  }
  @RequiredRoles(Role.Manager)
  @Get('get_item')
  GetItem(@Query('id', new ParseIntPipe()) id: number) {
    return this.service.GetItem(id);
  }
  //** Now user is accessible to call this point to get an transaction information  */
  //* RequiredQuery: id */
  @RequiredRoles(Role.User)
  @Get('get_user_item')
  GetUserItem(
    @Query('id', new ParseIntPipe()) id: number,
    @Req() req: RequestObject,
  ) {
    return this.service.GetItem(id, req.user.id_user);
  }
  @Get('check_request_is_handled')
  CheckRequestIsHandled(@Query('id', new ParseIntPipe()) id: number) {
    return this.service.CheckRequestIsHandled(id);
  }
  @Get('get_item_include_variants_of_document')
  async GetItemIncludeVariants(@Query('id', new ParseIntPipe()) id: number) {
    return this.service.GetItemIncludeVariants(id);
  }
  @Put('accept')
  @RequiredRoles(Role.Manager)
  Accept(@Body() body: ListID, @Req() req: RequestObject) {
    const { user } = req;
    if (body.id.length == 0) throw new BadRequestException();
    return this.service.UpdateStatus(body.id, true, user);
  }
  @Put('refuse')
  @RequiredRoles(Role.User)
  Refuse(@Body() body: ListID, @Req() req: RequestObject) {
    const { user } = req;
    if (body.id.length == 0) throw new BadRequestException();
    return this.service.UpdateStatus(body.id, false, user);
  }
  //** Now user is accessible to call this point to create a request  */
  //* RequiredQuery: CreateLoanRequest */
  //*! NOTE:
  //*! Date must be a ENCODE_URI(Date)
  //*! Documents must be a json stringified format
  @Post('create_loan_request')
  @RequiredRoles(Role.User)
  async CreateLoanRequest(
    @Body() body: CreateLoanRequest,
    @Req() req: RequestObject,
  ) {
    if (body.expected_date < body.create_at) throw new BadRequestException();
    return this.service.CreateLoanRequest(body, req.user.id_user);
  }
}
