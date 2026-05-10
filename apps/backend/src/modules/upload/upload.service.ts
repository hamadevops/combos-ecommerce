import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as os from 'os';
import sharp from 'sharp';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { CustomInternalServerErrorException } from 'src/common/exceptions/custom-exceptions';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class UploadService implements OnModuleInit {
  private readonly logger = new Logger(UploadService.name);
  private minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT')!;
    const port = this.configService.get<number>('MINIO_PORT');
    const useSSL = this.configService.get<boolean>('MINIO_USE_SSL') || false;

    // Build MinIO client config
    const minioConfig: any = {
      endPoint: endpoint,
      useSSL: useSSL,
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY')!,
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY')!,
      region: 'us-east-1', // Default region to avoid redirect issues
      pathStyle: true, // Use path-style URLs (domain.com/bucket/object) instead of virtual-hosted style
    };

    // Only add port if it's specified (otherwise MinIO uses default: 443 for SSL, 80 for non-SSL)
    if (port) {
      minioConfig.port = Number(port);
    }

    this.minioClient = new Minio.Client(minioConfig);
    this.bucketName = this.configService.get<string>('MINIO_BUCKET')!;

    // Log MinIO configuration for debugging
    this.logger.log(
      `MinIO Config: endpoint=${endpoint}, port=${port || 'default'}, useSSL=${useSSL}, bucket=${this.bucketName}`,
    );
  }

  async onModuleInit() {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    if (endpoint) {
      await this.ensureBucketExists();
    }
  }

  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName);
        this.logger.log(`Bucket "${this.bucketName}" created successfully.`);

        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetBucketLocation', 's3:ListBucket'],
              Resource: [`arn:aws:s3:::${this.bucketName}`],
            },
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(
          this.bucketName,
          JSON.stringify(policy),
        );
      }
    } catch (error) {
      this.logger.error(`Error ensuring bucket exists: ${error.message}`);
    }
  }

  private isImage(mimetype: string): boolean {
    return ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(
      mimetype,
    );
  }

  private isVideo(mimetype: string): boolean {
    return mimetype.startsWith('video/');
  }

  private async optimizeImage(
    buffer: Buffer,
  ): Promise<{ buffer: Buffer; mimetype: string; extension: string } | null> {
    try {
      const optimized = await sharp(buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      return {
        buffer: optimized,
        mimetype: 'image/webp',
        extension: '.webp',
      };
    } catch (error) {
      this.logger.warn(`Optimization failed, using original: ${error.message}`);
      return null;
    }
  }

  private async optimizeVideo(
    buffer: Buffer,
  ): Promise<{ buffer: Buffer; mimetype: string; extension: string } | null> {
    const tempInPath = path.join(os.tmpdir(), `${uuidv4()}_in`);
    const tempOutPath = path.join(os.tmpdir(), `${uuidv4()}_out.mp4`);

    try {
      await fs.writeFile(tempInPath, buffer);

      await new Promise((resolve, reject) => {
        ffmpeg(tempInPath)
          .outputOptions([
            '-vcodec libx264',
            '-crf 28',
            '-preset faster',
            '-movflags +faststart',
            '-vf scale=-2:720',
            '-max_muxing_queue_size 1024',
          ])
          .toFormat('mp4')
          .on('end', resolve)
          .on('error', reject)
          .save(tempOutPath);
      });

      const optimizedBuffer = await fs.readFile(tempOutPath);

      return {
        buffer: optimizedBuffer,
        mimetype: 'video/mp4',
        extension: '.mp4',
      };
    } catch (error) {
      this.logger.warn(`Video optimization failed: ${error.message}`);
      return null;
    } finally {
      await fs.unlink(tempInPath).catch(() => {});
      await fs.unlink(tempOutPath).catch(() => {});
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'general') {
    let buffer = file.buffer;
    let mimetype = file.mimetype;
    let extension = path.extname(file.originalname);

    if (this.isImage(mimetype)) {
      const optimized = await this.optimizeImage(buffer);
      if (optimized) {
        buffer = optimized.buffer;
        mimetype = optimized.mimetype;
        extension = optimized.extension;
      }
    } else if (this.isVideo(mimetype)) {
      const optimized = await this.optimizeVideo(buffer);
      if (optimized) {
        buffer = optimized.buffer;
        mimetype = optimized.mimetype;
        extension = optimized.extension;
      }
    }

    const fileName = `${uuidv4()}${extension}`;
    const objectName = `${folder}/${fileName}`;
    try {
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        buffer,
        buffer.length,
        {
          'Content-Type': mimetype,
        },
      );

      return this.getFileUrl(objectName);
    } catch (error) {
      this.logger.error(`Upload error: ${error.message}`);
      throw new CustomInternalServerErrorException('Lỗi tải file lên hệ thống');
    }
  }

  async uploadFromUrl(url: string, folder: string = 'general') {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { responseType: 'arraybuffer' }),
      );

      let buffer = Buffer.from(response.data);
      let mimetype = response.headers['content-type'] as string;
      let extension = path.extname(new URL(url).pathname) || '.jpg';

      if (this.isImage(mimetype)) {
        const optimized = await this.optimizeImage(buffer);
        if (optimized) {
          buffer = optimized.buffer;
          mimetype = optimized.mimetype;
          extension = optimized.extension;
        }
      } else if (this.isVideo(mimetype)) {
        const optimized = await this.optimizeVideo(buffer);
        if (optimized) {
          buffer = optimized.buffer;
          mimetype = optimized.mimetype;
          extension = optimized.extension;
        }
      }

      const fileName = `${uuidv4()}${extension}`;
      const objectName = `${folder}/${fileName}`;

      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        buffer,
        buffer.length,
        {
          'Content-Type': mimetype,
        },
      );

      return this.getFileUrl(objectName);
    } catch (error) {
      this.logger.error(`Upload from URL error: ${error.message}`);
      throw new CustomInternalServerErrorException('Lỗi tải file từ URL');
    }
  }

  async deleteFile(filePath: string) {
    try {
      // Input path format: /bucketName/folder/file.ext or /bucketName/file.ext
      // Minio removeObject needs: bucketName, objectName (folder/file.ext)
      const parts = filePath.split('/').filter(Boolean);
      if (parts.length < 2) {
        this.logger.warn(`Invalid file path for deletion: ${filePath}`);
        return;
      }

      const bucket = parts[0];
      const objectName = parts.slice(1).join('/');

      await this.minioClient.removeObject(bucket, objectName);
      this.logger.log(`Deleted file from MinIO: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error deleting file ${filePath}: ${error.message}`);
    }
  }

  private getFileUrl(fileName: string): string {
    // Always return relative path: /{bucket}/{fileName}
    // Frontend/API Gateway will handle the full URL construction
    return `/${this.bucketName}/${fileName}`;
  }

  // ==========================================
  // CHUNK UPLOAD LOGIC (For large files)
  // ==========================================

  async uploadChunk(uploadId: string, chunkIndex: number, file: Express.Multer.File) {
    const tempDir = path.join(os.tmpdir(), `upload_${uploadId}`);
    try {
      await fs.mkdir(tempDir, { recursive: true });
    } catch (e) {}

    const chunkPath = path.join(tempDir, `chunk_${chunkIndex}`);
    await fs.writeFile(chunkPath, file.buffer);
    this.logger.log(`Saved chunk ${chunkIndex} for upload ${uploadId}`);
    return { success: true, message: `Chunk ${chunkIndex} uploaded` };
  }

  async completeChunkUpload(uploadId: string, totalChunks: number, originalname: string, folder: string = 'general') {
    const tempDir = path.join(os.tmpdir(), `upload_${uploadId}`);
    const mergedFilePath = path.join(tempDir, `merged_${originalname}`);
    
    // 1. Verify all chunks exist
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(tempDir, `chunk_${i}`);
      try {
        await fs.access(chunkPath);
      } catch (error) {
        throw new CustomInternalServerErrorException(`Thiếu chunk thứ ${i}. Không thể hoàn thành upload.`);
      }
    }

    // 2. Merge all chunks into one file
    this.logger.log(`Merging ${totalChunks} chunks for ${uploadId}`);
    
    // Clear merged file if exists
    try { await fs.unlink(mergedFilePath); } catch (e) {}

    // Use streams to append to avoid loading everything in memory
    const writeStream = require('fs').createWriteStream(mergedFilePath, { flags: 'a' });
    
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(tempDir, `chunk_${i}`);
      const data = await fs.readFile(chunkPath); // Chunks are small (e.g., 5MB), safe to read into memory individually
      writeStream.write(data);
    }
    
    await new Promise((resolve) => writeStream.end(resolve));

    // 3. Process video directly from disk (No large buffer loading)
    let finalUploadPath = mergedFilePath;
    const extension = path.extname(originalname);
    const optimizedPath = path.join(tempDir, `optimized.mp4`);
    let finalMimeType = 'video/mp4';

    if (this.isVideo(`video/${extension.substring(1)}`)) {
      this.logger.log(`Optimizing large video directly on disk...`);
      try {
        await new Promise((resolve, reject) => {
          ffmpeg(mergedFilePath)
            .outputOptions([
              '-vcodec libx264',
              '-crf 28',
              '-preset faster',
              '-movflags +faststart',
              '-vf scale=-2:720', // keep ratio, scale to 720p height max
              '-max_muxing_queue_size 1024',
            ])
            .toFormat('mp4')
            .on('end', resolve)
            .on('error', reject)
            .save(optimizedPath);
        });
        finalUploadPath = optimizedPath;
      } catch (error) {
        this.logger.warn(`Optimization failed, using original size: ${error.message}`);
      }
    }

    // 4. Upload to MinIO directly from disk
    const fileName = `${uuidv4()}.mp4`; // Always mp4 for processed videos
    const objectName = `${folder}/${fileName}`;

    this.logger.log(`Uploading processed video to MinIO: ${objectName}`);
    try {
      await this.minioClient.fPutObject(
        this.bucketName,
        objectName,
        finalUploadPath,
        { 'Content-Type': finalMimeType }
      );
      
      // Cleanup temp dir
      await fs.rm(tempDir, { recursive: true, force: true });
      
      return this.getFileUrl(objectName);
    } catch (error) {
      this.logger.error(`MinIO chunk assembly upload error: ${error.message}`);
      throw new CustomInternalServerErrorException('Lỗi tải video dung lượng lớn lên hệ thống');
    }
  }
}
