import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IFileStorageService } from '@read-n-feed/domain';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalFileStorageService implements IFileStorageService {
  private readonly uploadDir: string;
  private readonly logger = new Logger(LocalFileStorageService.name);

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', 'uploads');
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      this.logger.log(`Creating upload directory: ${this.uploadDir}`);
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    // Create subdirectories for different file types
    const subdirs = ['book-covers', 'user-avatars'];
    for (const subdir of subdirs) {
      const dirPath = path.join(this.uploadDir, subdir);
      if (!fs.existsSync(dirPath)) {
        this.logger.log(`Creating subdirectory: ${dirPath}`);
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }
  }

  private generateSecureFilename(originalName: string): string {
    // Create a hash of the original filename + timestamp for uniqueness
    const hash = crypto
      .createHash('md5')
      .update(`${originalName}_${Date.now()}`)
      .digest('hex');

    // Keep the original extension
    const ext = path.extname(originalName).toLowerCase();
    return `${hash}${ext}`;
  }

  generateChecksum(fileBuffer: Buffer): string {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  async saveFile(
    fileBuffer: Buffer,
    filename: string,
    mimeType: string,
  ): Promise<string> {
    // Check if filename includes a subdirectory
    let subdir = '';
    let basename = filename;

    if (filename.includes(path.sep)) {
      const parts = filename.split(path.sep);
      subdir = parts[0];
      basename = parts[parts.length - 1];

      // Ensure the subdirectory exists
      const dirPath = path.join(this.uploadDir, subdir);
      if (!fs.existsSync(dirPath)) {
        this.logger.log(`Creating subdirectory: ${dirPath}`);
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }

    // Encode filename to handle Unicode characters properly
    const encodedFilename = encodeURIComponent(basename).replace(
      /[!'()*]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    );

    const filePath = subdir
      ? path.join(this.uploadDir, subdir, encodedFilename)
      : path.join(this.uploadDir, encodedFilename);

    try {
      await fs.promises.writeFile(filePath, fileBuffer);
      this.logger.log(`File saved: ${filePath}`);
      return filePath;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to save file: ${errorMessage}`);
      throw new Error(`Failed to save file: ${errorMessage}`);
    }
  }

  async getFile(filePath: string): Promise<Buffer> {
    try {
      return await fs.promises.readFile(filePath);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to read file ${filePath}: ${errorMessage}`);
      throw new Error(`File not found or inaccessible`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
      this.logger.log(`File deleted: ${filePath}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete file ${filePath}: ${errorMessage}`);
      throw new Error(`Failed to delete file: ${errorMessage}`);
    }
  }

  async getFileUrl(filePath: string): Promise<string> {
    const baseUrl = this.configService.get<string>(
      'FILES_BASE_URL',
      'http://localhost:3001/files',
    );

    // Remove the uploads directory prefix if it exists
    const uploadDir = this.configService.get<string>('UPLOAD_DIR', 'uploads');
    const normalizedPath = filePath
      .replace(`${uploadDir}${path.sep}`, '')
      .replace(`${uploadDir}/`, '');

    // Ensure proper URL path formatting
    const urlPath = normalizedPath
      .split(path.sep)
      .map(encodeURIComponent)
      .join('/');

    return `${baseUrl}/${urlPath}`;
  }
}
