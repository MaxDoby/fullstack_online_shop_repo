import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { StorageModule } from '../../core/storage/storage.module';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
  imports: [StorageModule],
})
export class ImagesModule {}
