import { Injectable, NotFoundException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(configService: ConfigService) {
    const endpoint = configService.getOrThrow<string>('S3_ENDPOINT');
    const region = configService.getOrThrow<string>('S3_REGION');
    const accessKeyId = configService.getOrThrow<string>('S3_ACCESS_KEY');
    const secretAccessKey = configService.getOrThrow<string>('S3_SECRET_KEY');
    this.bucketName = configService.getOrThrow<string>('S3_BUCKET');

    const forcePathStyle =
      configService.getOrThrow<string>('S3_FORCE_PATH_STYLE') === 'true';

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle,
    });
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await this.s3Client.send(command);

    return key;
  }

  async getFile(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);

    if (!response.Body) throw new NotFoundException('Image not found.');

    const byteArray = await response.Body.transformToByteArray();
    const bodyBuffer = Buffer.from(byteArray);

    return {
      body: bodyBuffer,
      contentType: response.ContentType,
    };
  }

  async deleteFile(storageKey: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: storageKey,
    });

    await this.s3Client.send(command);
  }
}
