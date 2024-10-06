import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { DocumentModule } from './document/document.module';
import { ShareModule } from './share/share.module';
import { MediaModule } from './media/media.module';
import { UserModule } from './user/user.module';
import { HandleSimpleDataModule } from './handle-simple-data/handle-simple-data.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    AuthModule,
    UserModule,
    DocumentModule,
    ShareModule,
    HandleSimpleDataModule,
    // MediaModule,
  ],
})
export class AppModule {}
