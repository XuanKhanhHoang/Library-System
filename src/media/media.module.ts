import { Global, Module } from '@nestjs/common';
import { MediaController } from './controller/media.controller';
import { MediaService } from './services/media.service';

@Global()
@Module({
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
