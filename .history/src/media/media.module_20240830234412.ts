import { Global, Module } from '@nestjs/common';
import { MediaController } from './controller/media.controller';

@Global()
@Module({
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
