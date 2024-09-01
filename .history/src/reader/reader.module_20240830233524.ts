import { Module } from '@nestjs/common';
import { ReaderController } from './reader.controller';
import { ReaderService } from './reader.service';
import { PrismaService } from 'nestjs-prisma';

@Module({
  controllers: [ReaderController],
  providers: [ReaderService, PrismaService],
})
export class ReaderModule {}
