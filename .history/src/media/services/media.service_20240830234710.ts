import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class MediaService {
  constructor(private prismaService: PrismaService) {}
}
