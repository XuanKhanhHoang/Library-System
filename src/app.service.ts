import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class AppService {
  constructor(private prismaService: PrismaService) {}
  async getHello(): Promise<any> {
    await this.prismaService.test.create({
      data: {
        a: '1',
        b: 1,
      },
    });
    await this.prismaService.test.update({
      where: {
        a: '1',
      },
      data: {
        b: 4,
      },
    });
    // await this.prismaService.test.delete({
    //   where: {
    //     a: '1',
    //   },
    // });
    return this.prismaService.test.findMany({});
  }
}
