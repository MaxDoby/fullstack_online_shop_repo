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
import { ResizeImageParamsDto } from './dto/resize-image.dto';
import { UploadProductImageParamsDto } from './dto/upload-productImage.dto';
import { FindImageParamsDto } from './dto/find-image.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @ApiOperation({
    summary: 'Upload product image.',
    description:
      'Receives an image file through multipart/form-data and uploads it to object storage. The image is connected to the product identified by productId. The endpoint stores image metadata such as original file name, MIME type, file size, width and height in the database.',
  })
  @ApiParam({
    name: 'productId',
    type: Number,
    description:
      'Product ID used to attach the uploaded image to an existing product.',
    example: 1,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Image file uploaded as multipart/form-data. The field name must be file.',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Product image uploaded successfully.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Missing file, invalid file type, or invalid request parameters.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  @Post('/products/:productId')
  @UseInterceptors(FileInterceptor('file'))
  uploadProductImage(
    @Param() params: UploadProductImageParamsDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imagesService.uploadProductImage(params.productId, file);
  }

  @ApiOperation({
    summary: 'Get resized product image.',
    description:
      'Returns a resized version of the product image. The current supported size is 500x300. The original image is loaded from storage, resized with Sharp, and returned directly as an image response.',
  })
  @ApiParam({
    name: 'imageId',
    type: Number,
    description: 'Image ID from the ProductImage table.',
    example: 1,
  })
  @ApiParam({
    name: 'size',
    type: String,
    description: 'Requested image size. Currently only 500x300 is supported.',
    example: '500x300',
  })
  @ApiResponse({
    status: 200,
    description: 'Resized image returned successfully.',
    content: {
      'image/*': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid image ID or unsupported image size. Supported size: 500x300.',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found.',
  })
  @Get(':imageId/:size')
  async scaleImage(
    @Param() params: ResizeImageParamsDto,
    @Res() res: Response,
  ) {
    const { metaImage, imageFile } =
      await this.imagesService.scaleImage(params);
    res.setHeader('Content-Type', metaImage.mimeType);
    const response = res.send(imageFile.body);

    return response;
  }

  @ApiOperation({
    summary: 'Get original product image.',
    description:
      'Returns the original image file stored for the given imageId. The response content type is set from the saved image MIME type, so the browser or client can render the image directly.',
  })
  @ApiParam({
    name: 'imageId',
    type: Number,
    description: 'Image ID from the ProductImage table.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Original image returned successfully.',
    content: {
      'image/*': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid image ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found.',
  })
  @Get(':imageId')
  async findProductImage(
    @Param() params: FindImageParamsDto,
    @Res() res: Response,
  ) {
    const { metaImage, imageFile } = await this.imagesService.findOne(
      params.imageId,
    );

    res.setHeader('Content-Type', metaImage.mimeType);

    const response = res.send(imageFile.body);

    return response;
  }
}
