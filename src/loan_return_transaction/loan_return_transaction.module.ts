import { Module } from '@nestjs/common';
import { LoanReturnTransactionService } from './loan_return_transaction.service';
import { LoanReturnTransactionController } from './loan_return_transaction.controller';

@Module({
  providers: [LoanReturnTransactionService],
  controllers: [LoanReturnTransactionController],
  exports: [LoanReturnTransactionService],
})
export class LoanReturnTransactionModule {}
