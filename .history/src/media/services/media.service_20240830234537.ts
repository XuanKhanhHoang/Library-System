import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {
  constructor(private prismaService: PrismaService) {}
}