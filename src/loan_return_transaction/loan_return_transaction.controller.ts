import {
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
import { GetLoanReturnTransactions } from './dtos/GetLoanReturnTransaction.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { RequiredRoles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RequestObject } from 'src/auth/dto/request.dto';
import { CreateLoan } from './dtos/CreateLoan.dto';
import { CreateReturn } from './dtos/CreateReturn.dto';
@Controller('loan-return-transaction')
@UseGuards(AuthGuard, RoleGuard)
export class LoanReturnTransactionController {
  constructor(private service: LoanReturnTransactionService) {}
  @Get('get_list')
  @RequiredRoles(Role.Manager)
  async GetList(@Query() query: GetLoanReturnTransactions) {
    return this.service.GetList(query);
  }
  @Get('get_item')
  @RequiredRoles(Role.Manager)
  async GetItem(@Query('id', new ParseIntPipe()) id: number) {
    return this.service.GetItem(id);
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
