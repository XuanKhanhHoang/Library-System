import { Module } from '@nestjs/common';
import { ReaderController } from './reader.controller';
import { ReaderService } from './reader.service';
import { PrismaService } from 'nestjs-prisma';

@Module({
  imports: [PrismaService]
  controllers: [ReaderController],
  providers: [ReaderService],
})
export class ReaderModule {}
