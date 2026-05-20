import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('/products/:productId')
  @UseInterceptors(FileInterceptor('file'))
  uploadProductImage(
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imagesService.uploadProductImage(productId, file);
  }

  @Get(':imageId')
  async findProductImage(
    @Param('imageId', ParseIntPipe) imageId: number,
    @Res() res: Response,
  ) {
    const { metaImage, imageFile } = await this.imagesService.findOne(imageId);

    res.setHeader('Content-Type', metaImage.mimeType);

    const response = res.send(imageFile.body);

    return response;
  }
}
