import {
  BadRequestException,
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { GetLoanRequestList } from './dtos/GetLoanRequestList.dto';
import { LoanRequestService } from './loan_request.service';
import { ListID } from './dtos/ListId.dto';

@Controller('loan-request')
@UseGuards(AuthGuard, RoleGuard)
export class LoanRequestController {
  constructor(private service: LoanRequestService) {}
  @Get('get_list')
  GetList(@Query() query: GetLoanRequestList) {
    const { max_date, min_date } = query;
    if (max_date < min_date) throw new BadRequestException();
    return this.service.GetList(query);
  }
  @Get('get_item')
  GetItem(@Query('id', new ParseIntPipe()) id: number) {
    return this.service.GetItem(id);
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
  Accept(@Body() body: ListID) {
    if (body.id.length == 0) throw new BadRequestException();
    return this.service.UpdateStatus(body.id, true);
  }
  @Put('refuse')
  Refuse(@Body() body: ListID) {
    if (body.id.length == 0) throw new BadRequestException();
    return this.service.UpdateStatus(body.id, false);
  }
}
