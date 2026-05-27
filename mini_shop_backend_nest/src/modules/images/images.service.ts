import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { StorageService } from '../../core/storage/storage.service';
import sharp from 'sharp';
import 'multer';
import { ResizeImageParamsDto } from './dto/resize-image.dto';

@Injectable()
export class ImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async uploadProductImage(productId: number, file: Express.Multer.File) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new NotFoundException('Product not found.');

    if (!file) throw new BadRequestException('Image file is required.');

    if (!file.mimetype.startsWith('image/'))
      throw new BadRequestException('Only image files are accepted.');

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

    const saveImageData = await this.prisma.productImage.create({
      data: {
        productId,
        storageKey,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        width: metadata.width,
        height: metadata.height,
      },
    });

    return saveImageData;
  }

  findAll() {
    return `This action returns all images`;
  }

  async findOne(id: number) {
    const metaImage = await this.prisma.productImage.findUnique({
      where: { id },
    });

    if (!metaImage) throw new NotFoundException('Image not found by ID.');

    const imageFile = await this.storageService.getFile(metaImage.storageKey);

    return { metaImage, imageFile };
  }

  remove(id: number) {
    return `This action removes a #${id} image`;
  }

  async scaleImage(params: ResizeImageParamsDto) {
    const { metaImage, imageFile } = await this.findOne(params.imageId);

    const { width, height } = params;

    const resizedBuffer = await sharp(imageFile.body)
      .resize(width, height)
      .toBuffer();

    return {
      metaImage,
      imageFile: {
        body: resizedBuffer,
      },
    };
  }

  async scaleImageWithSize(imageId: number, size: string) {
    const { metaImage, imageFile } = await this.findOne(imageId);

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

    const resizedBuffer = await sharp(imageFile.body)
      .resize(width, height)
      .toBuffer();

    return {
      metaImage,
      imageFile: {
        body: resizedBuffer,
      },
    };
  }
}
