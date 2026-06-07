import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StorageService } from '../../core/storage/storage.service';
import sharp from 'sharp';
import 'multer';
import { ResizeImageParamsDto } from './dto/resize-image.dto';
import { ProductImageMapper } from './mappers/product-image.mapper';
import { ImagesRepository } from './images.repository';

@Injectable()
export class ImagesService {
  constructor(
    private readonly storageService: StorageService,
    private readonly imagesRepository: ImagesRepository,
  ) {}

  async uploadProductImage(productId: number, file: Express.Multer.File) {
    const product = await this.imagesRepository.findProductById(productId);

    if (!product) throw new NotFoundException('Product not found.');

    const safeFileName = file.originalname.replace(/\s+/g, '-');
    const storageKey = `products/${productId}/${Date.now()}-${safeFileName}`;
    const metadata = await sharp(file.buffer).metadata();

    if (!metadata.width || !metadata.height)
      throw new BadRequestException('Invalid image metadata.');

    await this.storageService.uploadFile(
      storageKey,
      file.buffer,
      file.mimetype,
    );

    const saveImageData = await this.imagesRepository.createProductImage({
      product: {
        connect: { id: productId },
      },
      storageKey,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      width: metadata.width,
      height: metadata.height,
    });

    return ProductImageMapper.toResponse(saveImageData);
  }

  async getProductImages(productId: number) {
    const product = await this.imagesRepository.findProductById(productId);

    if (!product) throw new NotFoundException('Product not found.');

    const productImages =
      await this.imagesRepository.findProductImages(productId);

    return ProductImageMapper.toResponseList(productImages);
  }

  async getOne(id: number) {
    const metaImage = await this.imagesRepository.findImageById(id);

    if (!metaImage) throw new NotFoundException('Image not found by ID.');

    const imageFile = await this.storageService.getFile(metaImage.storageKey);

    return { metaImage, imageFile };
  }

  async setPrimaryProductImage(imageId: number) {
    const productImage = await this.imagesRepository.findImageById(imageId);

    if (!productImage) throw new NotFoundException('Image not found.');

    const updatedImage = await this.imagesRepository.setPrimaryImage({
      imageId,
      productId: productImage.productId,
    });

    return ProductImageMapper.toResponse(updatedImage);
  }

  async deleteProductImage(imageId: number) {
    const productImage = await this.imagesRepository.findImageById(imageId);

    if (!productImage) throw new NotFoundException('Image not found.');

    await this.storageService.deleteFile(productImage.storageKey);

    await this.imagesRepository.deleteImage(imageId);

    return {
      message: `This image was successfully deleted.`,
      imageId,
    };
  }

  async scaleImage(params: ResizeImageParamsDto) {
    const { metaImage, imageFile } = await this.getOne(params.imageId);

    const { width, height } = params;

    const resizedBuffer = await this.resizeImageBuffer(
      imageFile.body,
      width,
      height,
    );

    return {
      metaImage,
      imageFile: {
        body: resizedBuffer,
      },
    };
  }

  async scaleImageWithSize(imageId: number, size: string) {
    const { metaImage, imageFile } = await this.getOne(imageId);

    const [widthText, heightText] = size.split('x');
    const width = Number(widthText);
    const height = Number(heightText);

    if (
      !width ||
      !height ||
      width < 1 ||
      width > 2000 ||
      height < 1 ||
      height > 2000
    ) {
      throw new BadRequestException(
        'Invalid image size. Expected format: 500x300',
      );
    }

    const resizedBuffer = await this.resizeImageBuffer(
      imageFile.body,
      width,
      height,
    );

    return {
      metaImage,
      imageFile: {
        body: resizedBuffer,
      },
    };
  }

  private async resizeImageBuffer(
    imageBuffer: Buffer,
    width: number,
    height: number,
  ) {
    return sharp(imageBuffer)
      .resize(width, height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toBuffer();
  }
}
