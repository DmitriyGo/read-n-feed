import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import {
  IBookFileRepository,
  IBookRepository,
  BookFile,
  BookFormat,
  IFileStorageService,
} from '@read-n-feed/domain';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateBookFileDto,
  toBookFileResponseDto,
  BookFileResponseDto,
} from './dto/book-file.dto';

@Injectable()
export class BookFileUseCase {
  private readonly logger = new Logger(BookFileUseCase.name);

  constructor(
    @Inject('IBookFileRepository')
    private readonly bookFileRepo: IBookFileRepository,

    @Inject('IBookRepository')
    private readonly bookRepo: IBookRepository,

    @Inject('IFileStorageService')
    private readonly fileStorage: IFileStorageService,
  ) {}

  private validateFileFormat(format: string, mimeType: string): void {
    // Map of expected MIME types for each format
    const formatMimeMap: Record<string, string[]> = {
      PDF: ['application/pdf'],
      EPUB: ['application/epub+zip'],
      FB2: ['application/xml', 'text/xml'],
      MOBI: ['application/x-mobipocket-ebook'],
      AZW3: ['application/vnd.amazon.ebook'],
    };

    const allowedMimeTypes = formatMimeMap[format.toUpperCase()];
    if (!allowedMimeTypes) {
      throw new UnsupportedMediaTypeException(`Unsupported format: ${format}`);
    }

    // For some formats like FB2, we're more lenient with MIME types
    if (format.toUpperCase() === 'FB2') {
      return; // Accept any MIME type for FB2
    }

    if (!allowedMimeTypes.includes(mimeType)) {
      this.logger.warn(`Invalid mimetype ${mimeType} for format ${format}`);
      throw new UnsupportedMediaTypeException(
        `The uploaded file doesn't match the specified format ${format}. Expected MIME types: ${allowedMimeTypes.join(', ')}`,
      );
    }
  }

  async uploadBookFile(
    dto: CreateBookFileDto,
    fileBuffer: Buffer,
    mimeType: string,
    originalFilename: string,
  ): Promise<BookFileResponseDto> {
    // Check if book exists
    const book = await this.bookRepo.findById(dto.bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${dto.bookId} not found`);
    }

    // Validate file format
    this.validateFileFormat(dto.format, mimeType);

    // Generate a filename that preserves the original extension
    const extension =
      path.extname(originalFilename).toLowerCase() ||
      `.${dto.format.toLowerCase()}`;
    const filename = `${dto.bookId}_${uuidv4()}${extension}`;

    // Save file to storage
    const filePath = await this.fileStorage.saveFile(
      fileBuffer,
      filename,
      mimeType,
    );

    // Calculate file size if not provided
    const fileSize = dto.fileSize || fileBuffer.length;

    // Create bookFile entity
    const bookFile = new BookFile({
      id: uuidv4(),
      bookId: dto.bookId,
      format: BookFormat.create(dto.format),
      filePath,
      fileSize,
      createdAt: new Date(),
    });

    // Save to database
    await this.bookFileRepo.create(bookFile);

    // Get URL for the file
    const downloadUrl = await this.fileStorage.getFileUrl(filePath);

    return toBookFileResponseDto(bookFile, true, downloadUrl);
  }

  async getBookFile(fileId: string): Promise<{
    buffer: Buffer;
    file: BookFile;
    mimeType: string;
    filename: string;
  }> {
    const bookFile = await this.bookFileRepo.findById(fileId);
    if (!bookFile) {
      throw new NotFoundException(`Book file with id=${fileId} not found`);
    }

    const fileBuffer = await this.fileStorage.getFile(bookFile.filePath);

    // Determine content type based on format
    const format = bookFile.format.value.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      epub: 'application/epub+zip',
      fb2: 'application/xml',
      mobi: 'application/x-mobipocket-ebook',
      azw3: 'application/vnd.amazon.ebook',
    };

    const mimeType = mimeTypes[format] || 'application/octet-stream';
    const filename = path.basename(bookFile.filePath);

    return {
      buffer: fileBuffer,
      file: bookFile,
      mimeType,
      filename,
    };
  }

  async getBookFileUrl(fileId: string): Promise<string> {
    const bookFile = await this.bookFileRepo.findById(fileId);
    if (!bookFile) {
      throw new NotFoundException(`Book file with id=${fileId} not found`);
    }

    return this.fileStorage.getFileUrl(bookFile.filePath);
  }

  async deleteBookFile(fileId: string): Promise<void> {
    const bookFile = await this.bookFileRepo.findById(fileId);
    if (!bookFile) {
      throw new NotFoundException(`Book file with id=${fileId} not found`);
    }

    // Delete file from storage
    await this.fileStorage.deleteFile(bookFile.filePath);

    // Delete record from database
    await this.bookFileRepo.delete(fileId);

    this.logger.log(`Book file ${fileId} deleted successfully`);
  }

  async findBookFiles(bookId: string): Promise<BookFileResponseDto[]> {
    // Check if book exists
    const book = await this.bookRepo.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${bookId} not found`);
    }

    const files = await this.bookFileRepo.findAllByBook(bookId);

    // Get URLs for all files
    const results = await Promise.all(
      files.map(async (file) => {
        const url = await this.fileStorage.getFileUrl(file.filePath);
        return toBookFileResponseDto(file, true, url);
      }),
    );

    return results;
  }
}
