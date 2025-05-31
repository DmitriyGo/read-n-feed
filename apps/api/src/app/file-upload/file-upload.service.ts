import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { IFileStorageService } from '@read-n-feed/domain';
import * as crypto from 'crypto';
import * as path from 'path';

export enum ImageType {
  BOOK_COVER = 'book-covers',
  USER_AVATAR = 'user-avatars',
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(
    @Inject('IFileStorageService')
    private readonly fileStorage: IFileStorageService,
  ) {}

  /**
   * Uploads an image file and returns the URL to access it
   */
  async uploadImage(
    file: Express.Multer.File,
    imageType: ImageType,
    originalId: string,
  ): Promise<string> {
    if (!file) {
      throw new Error('File is required');
    }

    // Generate a unique filename based on the image type and original ID
    const filename = this.generateUniqueFilename(file.originalname, originalId);

    // Create a path that includes the image type directory
    const filePath = path.join(imageType, filename);

    // Save the file
    await this.fileStorage.saveFile(file.buffer, filePath, file.mimetype);

    // Get the URL for the file
    return this.fileStorage.getFileUrl(filePath);
  }

  /**
   * Gets an image file by its path
   */
  async getImage(filePath: string): Promise<Buffer> {
    try {
      return await this.fileStorage.getFile(filePath);
    } catch (error) {
      this.logger.error(`Failed to get image: ${error.message}`);
      throw new NotFoundException('Image not found');
    }
  }

  /**
   * Deletes an image file
   */
  async deleteImage(filePath: string): Promise<void> {
    try {
      await this.fileStorage.deleteFile(filePath);
    } catch (error) {
      this.logger.error(`Failed to delete image: ${error.message}`);
      // We don't throw here as the file might already be deleted
    }
  }

  /**
   * Generates a unique filename for an image
   */
  private generateUniqueFilename(originalName: string, id: string): string {
    // Create a hash of the ID + timestamp for uniqueness
    const hash = crypto
      .createHash('md5')
      .update(`${id}_${Date.now()}`)
      .digest('hex');

    // Keep the original extension
    const ext = path.extname(originalName).toLowerCase();
    return `${hash}${ext}`;
  }
}
