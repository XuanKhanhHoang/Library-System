import { Module } from '@nestjs/common';
import { LoanRequestController } from './loan_request.controller';
import { LoanRequestService } from './loan_request.service';

@Module({
  controllers: [LoanRequestController],
  providers: [LoanRequestService],
  exports: [LoanRequestService],
})
export class LoanRequestModule {}
