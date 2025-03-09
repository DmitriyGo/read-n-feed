import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import {
  IBookFileRepository,
  IBookRepository,
  BookFile,
  BookFormat,
  IFileStorageService,
} from '@read-n-feed/domain';
import * as crypto from 'crypto';
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
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB default

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
      FB2: ['application/xml', 'text/xml', 'application/fb2+xml'],
      MOBI: ['application/x-mobipocket-ebook'],
      AZW3: ['application/vnd.amazon.ebook'],
    };

    const allowedMimeTypes = formatMimeMap[format.toUpperCase()];
    if (!allowedMimeTypes) {
      throw new UnsupportedMediaTypeException(
        `Unsupported format: ${format}. Supported formats are: ${Object.keys(formatMimeMap).join(', ')}`,
      );
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

  private validateFileSize(fileSize: number): void {
    if (fileSize > this.MAX_FILE_SIZE) {
      throw new PayloadTooLargeException(
        `File size exceeds the maximum allowed size of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    if (fileSize === 0) {
      throw new BadRequestException('File is empty');
    }
  }

  /**
   * Validates a PDF file by checking its header and structure
   */
  private validatePdf(buffer: Buffer): { isValid: boolean; error?: string } {
    try {
      // Check PDF header signature (%PDF-1.x)
      const header = buffer.slice(0, 8).toString();
      if (!header.startsWith('%PDF-')) {
        return { isValid: false, error: 'Invalid PDF header signature' };
      }

      // Check for EOF marker
      const lastBytes = buffer.slice(buffer.length - 1024);
      const trailerString = lastBytes.toString();
      if (!trailerString.includes('%%EOF')) {
        return { isValid: false, error: 'Missing PDF EOF marker' };
      }

      // Check minimum viable size for a PDF
      if (buffer.length < 100) {
        return { isValid: false, error: 'File too small to be a valid PDF' };
      }

      return { isValid: true };
    } catch (error) {
      this.logger.error(
        `Error validating PDF: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { isValid: false, error: 'Error validating PDF file' };
    }
  }

  private extractPdfMetadata(buffer: Buffer): Record<string, any> {
    try {
      // Basic metadata extraction approach
      const metadata: Record<string, any> = {
        fileSize: buffer.length,
      };

      // Generate a checksum for the file
      const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

      metadata['checksum'] = checksum;

      // Basic PDF parsing to extract metadata
      const pdfString = buffer.toString(
        'utf8',
        0,
        Math.min(10000, buffer.length),
      );

      // Extract title
      const titleMatch = pdfString.match(/\/Title\s*\(([^)]+)\)/);
      if (titleMatch && titleMatch[1]) {
        metadata['title'] = titleMatch[1].replace(/\\(.)/g, '$1'); // Remove escaping
      }

      // Extract author
      const authorMatch = pdfString.match(/\/Author\s*\(([^)]+)\)/);
      if (authorMatch && authorMatch[1]) {
        metadata['author'] = authorMatch[1].replace(/\\(.)/g, '$1');
      }

      // Estimate page count by counting "Page" objects
      const pageMatches = pdfString.match(/\/Type\s*\/Page/g);
      if (pageMatches) {
        metadata['pageCount'] = pageMatches.length;
      }

      return metadata;
    } catch (error) {
      this.logger.warn(
        `Error extracting PDF metadata: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { fileSize: buffer.length };
    }
  }

  async uploadBookFile(
    dto: CreateBookFileDto,
    fileBuffer: Buffer,
    mimeType: string,
    originalFilename: string,
  ): Promise<BookFileResponseDto> {
    try {
      // Check if book exists
      const book = await this.bookRepo.findById(dto.bookId);
      if (!book) {
        throw new NotFoundException(`Book with id=${dto.bookId} not found`);
      }

      // Validate file size
      this.validateFileSize(fileBuffer.length);

      // Validate file format
      this.validateFileFormat(dto.format, mimeType);

      // Validate file contents for PDF
      let isValidFile = true;
      let validationError = '';
      let metadata: Record<string, any> = { fileSize: fileBuffer.length };

      if (dto.format.toUpperCase() === 'PDF') {
        const validationResult = this.validatePdf(fileBuffer);
        isValidFile = validationResult.isValid;
        validationError = validationResult.error || '';

        if (!isValidFile) {
          throw new BadRequestException(`Invalid PDF file: ${validationError}`);
        }

        // Extract metadata from PDF
        metadata = this.extractPdfMetadata(fileBuffer);
      }

      // For other formats, we'll add validation later
      // TODO: Add validation for EPUB, FB2, etc.

      // Generate a filename that preserves the original extension
      const extension = `.${dto.format.toLowerCase()}`;
      const filename = `${dto.bookId}_${uuidv4()}${extension}`;

      // Save file to storage
      const filePath = await this.fileStorage.saveFile(
        fileBuffer,
        filename,
        mimeType,
      );

      // Create bookFile entity
      const bookFile = new BookFile({
        id: uuidv4(),
        bookId: dto.bookId,
        format: BookFormat.create(dto.format),
        filePath,
        fileSize: fileBuffer.length,
        createdAt: new Date(),
        filename: originalFilename,
        mimeType,
        metadata,
        isValidated: isValidFile,
        checksum: metadata['checksum'],
      });

      // Save to database
      await this.bookFileRepo.create(bookFile);

      // Get URL for the file
      const downloadUrl = await this.fileStorage.getFileUrl(filePath);

      this.logger.log(`Book file uploaded successfully: ${filename}`);
      return toBookFileResponseDto(bookFile, true, downloadUrl);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnsupportedMediaTypeException ||
        error instanceof PayloadTooLargeException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Convert unknown error to a BadRequestException with proper message
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error uploading book file: ${errorMessage}`);
      throw new BadRequestException(`Failed to upload file: ${errorMessage}`);
    }
  }

  async getBookFile(fileId: string): Promise<{
    buffer: Buffer;
    file: BookFile;
    mimeType: string;
    filename: string;
  }> {
    try {
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

      // Use stored mimeType if available, otherwise use format-based lookup
      const mimeType =
        bookFile.mimeType || mimeTypes[format] || 'application/octet-stream';

      // Use stored filename if available, otherwise use the basename
      const filename = bookFile.filename || path.basename(bookFile.filePath);

      return {
        buffer: fileBuffer,
        file: bookFile,
        mimeType,
        filename,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error retrieving book file: ${errorMessage}`);
      throw new BadRequestException(`Failed to retrieve file: ${errorMessage}`);
    }
  }

  async getBookFileUrl(fileId: string): Promise<string> {
    try {
      const bookFile = await this.bookFileRepo.findById(fileId);
      if (!bookFile) {
        throw new NotFoundException(`Book file with id=${fileId} not found`);
      }

      return this.fileStorage.getFileUrl(bookFile.filePath);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting book file URL: ${errorMessage}`);
      throw new BadRequestException(`Failed to get file URL: ${errorMessage}`);
    }
  }

  async deleteBookFile(fileId: string): Promise<void> {
    try {
      const bookFile = await this.bookFileRepo.findById(fileId);
      if (!bookFile) {
        throw new NotFoundException(`Book file with id=${fileId} not found`);
      }

      // Delete file from storage
      await this.fileStorage.deleteFile(bookFile.filePath);

      // Delete record from database
      await this.bookFileRepo.delete(fileId);

      this.logger.log(`Book file ${fileId} deleted successfully`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error deleting book file: ${errorMessage}`);
      throw new BadRequestException(`Failed to delete file: ${errorMessage}`);
    }
  }

  async findBookFiles(bookId: string): Promise<BookFileResponseDto[]> {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error finding book files: ${errorMessage}`);
      throw new BadRequestException(
        `Failed to fetch book files: ${errorMessage}`,
      );
    }
  }
}
