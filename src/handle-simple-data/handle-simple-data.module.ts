import { Module } from '@nestjs/common';
import { HandleSimpleDataController } from './handle-simple-data.controller';
import { HandleSimpleDataService } from './handle-simple-data.service';

@Module({
  controllers: [HandleSimpleDataController],
  providers: [HandleSimpleDataService]
})
export class HandleSimpleDataModule {}
