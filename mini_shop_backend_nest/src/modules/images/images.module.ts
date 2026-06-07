import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { StorageModule } from '../../core/storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { ImagesRepository } from './images.repository';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService, ImagesRepository],
  imports: [StorageModule, AuthModule],
})
export class ImagesModule {}
