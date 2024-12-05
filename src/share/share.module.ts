import { Global, Module } from '@nestjs/common';
import { ValidationService } from './validation/validation.service';

@Global()
@Module({
  providers: [ValidationService],
  exports: [ValidationService],
})
export class ShareModule {}
