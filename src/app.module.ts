import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { ReaderModule } from './reader/reader.module';
import { DocumentModule } from './document/document.module';
import { ShareModule } from './share/share.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    AuthModule,
    ReaderModule,
    DocumentModule,
    ShareModule,
  ],
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: AuthGuard,
  //   },
  //   {
  //     provide: APP_GUARD,
  //     useClass: RoleGuard,
  //   },
  // ],
})
export class AppModule {}
