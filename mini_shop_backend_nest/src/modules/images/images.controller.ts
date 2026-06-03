import {
  Controller,
  Get,
  Delete,
  Post,
  Patch,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin/admin.guard';
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
import { ResizeImageWithSizeParamsDto } from './dto/resize-image-with-size.dto';

@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  /// --- UPLOAD_PRODUCT_IMAGE ---

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
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('/product/:productId')
  @UseInterceptors(FileInterceptor('file'))
  uploadProductImage(
    @Param() params: UploadProductImageParamsDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imagesService.uploadProductImage(params.productId, file);
  }

  /// --- GET_PRODUCT_IMAGES --- ///

  @ApiOperation({
    summary: 'Get product images.',
    description: 'Returns all images attached to the selected product.',
  })
  @ApiParam({
    name: 'productId',
    type: Number,
    description: 'Product ID used to find attached images.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Product images retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  @Get('/product/:productId')
  async getProductImages(@Param('productId') productId: string) {
    return this.imagesService.getProductImages(Number(productId));
  }

  /// --- SET_PRIMARY_IMAGE --- ///

  @ApiOperation({
    summary: 'Set product primary image.',
    description:
      'Marks the selected product image as primary. All other images attached to the same product are automatically marked as non-primary.',
  })
  @ApiParam({
    name: 'imageId',
    type: Number,
    description: 'Image ID from the ProductImage table.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Product primary image updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found.',
  })
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':imageId/primary')
  async setPrimaryProductImage(@Param('imageId') imageId: string) {
    return this.imagesService.setPrimaryProductImage(Number(imageId));
  }

  /// --- DELETE_IMAGE --- ///

  @ApiOperation({
    summary: 'Delete product image.',
    description:
      'Deletes a product image from object storage and removes its metadata from the database.',
  })
  @ApiParam({
    name: 'imageId',
    type: Number,
    description: 'Image ID from the ProductImage table.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Product image deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found.',
  })
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':imageId')
  async deleteProductImage(@Param('imageId') imageId: string) {
    return this.imagesService.deleteProductImage(Number(imageId));
  }

  /// --- SCALE_IMAGE --- ///
  @ApiOperation({
    summary: 'Get resized product image.',
    description:
      'Returns a resized version of the product image. The original image is loaded from storage, resized with Sharp, and returned directly as an image response.',
  })
  @ApiParam({
    name: 'imageId',
    type: Number,
    description: 'Image ID from the ProductImage table.',
    example: 1,
  })
  @ApiParam({
    name: 'width',
    type: Number,
    description: 'Requested image width size.',
    example: 500,
  })
  @ApiParam({
    name: 'height',
    type: Number,
    description: 'Requested image height size.',
    example: 300,
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
      'Invalid image ID, width, or height. Width and height must be between 1 and 2000.',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found.',
  })
  @Get(':imageId/:width/:height')
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

  /// --- SCALE_IMAGE_WITH_SIZE ---

  @ApiOperation({
    summary: 'Get resized product image by size string.',
    description:
      'Returns a resized version of the product image. The size parameter is received in WIDTHxHEIGHT format, for example 500x300. This approach is compact and common in image/CDN-style APIs, but requires manual parsing before using Sharp.',
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
    description:
      'Requested image size in WIDTHxHEIGHT format. Width and height must be between 1 and 2000.',
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
      'Invalid image ID or size format. Expected format: WIDTHxHEIGHT, for example 500x300. Width and height must be between 1 and 2000.',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found.',
  })
  @Get(':imageId/:size')
  async scaleImageWithSize(
    @Param() params: ResizeImageWithSizeParamsDto,
    @Res() res: Response,
  ) {
    const { metaImage, imageFile } =
      await this.imagesService.scaleImageWithSize(
        Number(params.imageId),
        params.size,
      );

    res.setHeader('Content-Type', metaImage.mimeType);
    return res.send(imageFile.body);
  }

  /// --- FIND_PRODUCT_IMAGE ---

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
    const { metaImage, imageFile } = await this.imagesService.getOne(
      params.imageId,
    );

    res.setHeader('Content-Type', metaImage.mimeType);

    const response = res.send(imageFile.body);

    return response;
  }
}
