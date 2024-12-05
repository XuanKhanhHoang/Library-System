import {
  BadRequestException,
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LoanReturnTransactionService } from './loan_return_transaction.service';
import {
  GetLoanReturnTransactions,
  GetUserLoanReturnTransactions,
} from './dtos/GetLoanReturnTransaction.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { RequiredRoles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RequestObject } from 'src/auth/dto/request.dto';
import { CreateLoan } from './dtos/CreateLoan.dto';
import { CreateReturn } from './dtos/CreateReturn.dto';
import { GetNumberOfLoanTransactionDayByDayDTO } from './dtos/GetNumberOfLoanTransactionDayByDay.dto';
@Controller('loan-return-transaction')
@UseGuards(AuthGuard, RoleGuard)
export class LoanReturnTransactionController {
  constructor(private service: LoanReturnTransactionService) {}
  @Get('get_list')
  @RequiredRoles(Role.Manager)
  async GetList(@Query() query: GetLoanReturnTransactions) {
    return this.service.GetList(query);
  }
  //** Now user call to here to get loan list belong this user*/
  //* RequiredQuery: GetUserLoanReturnTransactions */
  @Get('get_user_list')
  @RequiredRoles(Role.User)
  async GetUserList(
    @Req() req: RequestObject,
    @Query() query: GetUserLoanReturnTransactions,
  ) {
    const { user } = req;
    return this.service.GetList({ ...query, user_id: user.id_user });
  }
  //** Now user is accessible to call this point to get an transaction information  */
  //* RequiredQuery: id */
  @Get('get_item')
  @RequiredRoles(Role.User)
  async GetItem(
    @Req() req: RequestObject,
    @Query('id', new ParseIntPipe()) id: number,
  ) {
    return this.service.GetItem(id, req.user);
  }
  @Get('get_number_of_loan_transaction_day_by_day')
  @RequiredRoles(Role.Manager)
  async GetNumberOfLoanTransactionDayByDay(
    @Query() data: GetNumberOfLoanTransactionDayByDayDTO,
  ) {
    if (data.max_date < data.min_date) throw new BadRequestException();
    return this.service.GetNumberOfLoanTransactionDayByDay(data);
  }
  @Post('create_item')
  @RequiredRoles(Role.Manager)
  async CreateItem(@Body() data: CreateLoan, @Req() req: RequestObject) {
    const { user } = req;
    return this.service.CreateLoan(data, user.id_user);
  }
  @Post('create_return')
  @RequiredRoles(Role.Manager)
  async CreateReturn(@Body() data: CreateReturn) {
    return this.service.CreateReturn(data);
  }
}
