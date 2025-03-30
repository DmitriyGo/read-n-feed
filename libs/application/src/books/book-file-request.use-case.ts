import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  BookFileRequest,
  BookFileRequestSearchOptions,
  IBookFileRequestRepository,
  IBookRepository,
  IBookFileRepository,
  BookFile,
} from '@read-n-feed/domain';
import { v4 as uuidv4 } from 'uuid';

import { BookFileUseCase } from './book-file.use-case';
import {
  CreateBookFileRequestDto,
  AdminReviewBookFileRequestDto,
  BookFileRequestResponseDto,
  toBookFileRequestResponseDto,
} from './dto/book-file-request.dto';
import { BookFormatDto, CreateBookFileDto } from './dto/book-file.dto';

@Injectable()
export class BookFileRequestUseCase {
  private readonly logger = new Logger(BookFileRequestUseCase.name);

  constructor(
    @Inject('IBookFileRequestRepository')
    private readonly bookFileRequestRepo: IBookFileRequestRepository,
    @Inject('IBookRepository')
    private readonly bookRepo: IBookRepository,
    @Inject('IBookFileRepository')
    private readonly bookFileRepo: IBookFileRepository,
    private readonly bookFileUseCase: BookFileUseCase,
  ) {}

  async createBookFileRequestWithFile(
    userId: string,
    dto: CreateBookFileRequestDto,
    fileBuffer: Buffer,
    mimeType: string,
    originalFilename: string,
  ): Promise<BookFileRequest> {
    // Verify book exists
    const book = await this.bookRepo.findById(dto.bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${dto.bookId} not found`);
    }

    // Create the book file request
    const bookFileRequest = new BookFileRequest({
      id: uuidv4(),
      bookId: dto.bookId,
      userId,
      fileId: null, // Will be filled after file upload
      format: dto.format.toUpperCase(),
      status: 'PENDING',
      adminNotes: dto.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    try {
      // First create the book file request
      await this.bookFileRequestRepo.create(bookFileRequest);

      // Convert string format to enum
      const formatEnum =
        BookFormatDto[dto.format as keyof typeof BookFormatDto];

      if (!formatEnum) {
        throw new BadRequestException(`Invalid format: ${dto.format}`);
      }

      const fileDto: CreateBookFileDto = {
        format: formatEnum,
        bookId: dto.bookId,
      };

      // Upload the file using BookFileUseCase with the proper DTO
      const fileResponse = await this.bookFileUseCase.uploadBookFile(
        fileDto,
        fileBuffer,
        mimeType,
        originalFilename,
      );

      // Get the actual BookFile entity
      const bookFile = await this.bookFileRepo.findById(fileResponse.id);
      if (!bookFile) {
        throw new Error('Failed to find uploaded file');
      }

      // Remove the book association
      bookFile.update({ bookId: null });
      await this.bookFileRepo.update(bookFile);

      // Associate the file with our request
      bookFileRequest.associateFile(bookFile.id);
      await this.bookFileRequestRepo.update(bookFileRequest);

      return bookFileRequest;
    } catch (error) {
      // If anything fails, try to clean up the request
      try {
        await this.bookFileRequestRepo.delete(bookFileRequest.id);
      } catch (deleteError) {
        // Just log the error, don't expose to user
        this.logger.error(
          `Failed to clean up book file request after error: ${deleteError}`,
        );
      }

      // Re-throw the original error
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error creating book file request with file: ${errorMessage}`,
      );
      throw new BadRequestException(
        `Failed to create book file request: ${errorMessage}`,
      );
    }
  }

  async associateFileWithRequest(
    requestId: string,
    fileId: string,
    userId: string,
  ): Promise<void> {
    // Verify the request exists and belongs to the user
    const request = await this.bookFileRequestRepo.findById(requestId);
    if (!request) {
      throw new NotFoundException(
        `Book file request with id=${requestId} not found`,
      );
    }

    if (request.userId !== userId) {
      throw new UnauthorizedException('You can only modify your own requests');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be modified');
    }

    // Verify the file exists
    const file = await this.bookFileRepo.findById(fileId);
    if (!file) {
      throw new NotFoundException(`Book file with id=${fileId} not found`);
    }

    // Ensure the file format matches the requested format
    if (file.format.value.toUpperCase() !== request.format.toUpperCase()) {
      throw new BadRequestException(
        `File format (${file.format.value}) does not match the requested format (${request.format})`,
      );
    }

    // Associate the file with the request
    request.associateFile(fileId);
    await this.bookFileRequestRepo.update(request);
  }

  async reviewBookFileRequest(
    requestId: string,
    adminId: string,
    dto: AdminReviewBookFileRequestDto,
  ): Promise<BookFileRequest> {
    // Verify the request exists
    const request = await this.bookFileRequestRepo.findById(requestId);
    if (!request) {
      throw new NotFoundException(
        `Book file request with id=${requestId} not found`,
      );
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('This request has already been processed');
    }

    // Update admin notes if provided
    if (dto.adminNotes) {
      request.updateAdminNotes(dto.adminNotes);
    }

    if (dto.status === 'APPROVED') {
      // Ensure a file is associated with the request
      if (!request.fileId) {
        throw new BadRequestException(
          'Cannot approve a request without an associated file',
        );
      }

      try {
        // Get the file
        const file = await this.bookFileRepo.findById(request.fileId);
        if (!file) {
          throw new NotFoundException(`Associated file not found`);
        }

        // Associate the file with the book
        file.update({
          bookId: request.bookId,
          bookRequestId: null,
        });
        await this.bookFileRepo.update(file);

        // Approve the request
        request.approve(adminId);
        await this.bookFileRequestRepo.update(request);

        this.logger.log(
          `Book file request ${requestId} approved by admin ${adminId}, file ${request.fileId} associated with book ${request.bookId}`,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to associate file with book during approval: ${errorMessage}`,
        );
        throw new BadRequestException(
          `Failed to associate file with book: ${errorMessage}`,
        );
      }
    } else if (dto.status === 'REJECTED') {
      // Ensure rejection reason is provided
      if (!dto.rejectionReason) {
        throw new BadRequestException(
          'A reason must be provided when rejecting a request',
        );
      }
      // Reject the request
      request.reject(adminId, dto.rejectionReason);
      await this.bookFileRequestRepo.update(request);
      this.logger.log(
        `Book file request ${requestId} rejected by admin ${adminId}: ${dto.rejectionReason}`,
      );
    }

    return request;
  }

  async getBookFileRequest(requestId: string): Promise<BookFileRequest> {
    const request = await this.bookFileRequestRepo.findById(requestId);
    if (!request) {
      throw new NotFoundException(
        `Book file request with id=${requestId} not found`,
      );
    }
    return request;
  }

  async getBookFileRequestWithDetails(
    requestId: string,
  ): Promise<BookFileRequestResponseDto> {
    const request = await this.getBookFileRequest(requestId);

    // Get book details
    const book = await this.bookRepo.findById(request.bookId);
    const bookInfo = book
      ? {
          title: book.title,
          coverImageUrl: book.coverImageUrl,
        }
      : null;

    // Get file details if associated
    let fileInfo = null;
    if (request.fileId) {
      const file = await this.bookFileRepo.findById(request.fileId);
      if (file) {
        fileInfo = {
          filename: file.filename || 'unknown',
          fileSize: file.fileSize || 0,
          mimeType: file.mimeType || 'unknown',
        };
      }
    }

    return toBookFileRequestResponseDto(request, bookInfo, fileInfo);
  }

  async searchBookFileRequests(options: BookFileRequestSearchOptions): Promise<{
    items: BookFileRequestResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [requests, total] = await Promise.all([
      this.bookFileRequestRepo.search(options),
      this.bookFileRequestRepo.count(options),
    ]);

    const page = options.page || 1;
    const limit = options.limit || 10;
    const totalPages = Math.ceil(total / limit);

    // Fetch book and file details for each request
    const enhancedItems = await Promise.all(
      requests.map(async (request) => {
        try {
          // Get book details
          const book = await this.bookRepo.findById(request.bookId);
          const bookInfo = book
            ? {
                title: book.title,
                coverImageUrl: book.coverImageUrl,
              }
            : null;

          // Get file details if associated
          let fileInfo = null;
          if (request.fileId) {
            const file = await this.bookFileRepo.findById(request.fileId);
            if (file) {
              fileInfo = {
                filename: file.filename || 'unknown',
                fileSize: file.fileSize || 0,
                mimeType: file.mimeType || 'unknown',
              };
            }
          }

          return toBookFileRequestResponseDto(request, bookInfo, fileInfo);
        } catch (error) {
          // If there's an error getting details, just return the basic request
          return toBookFileRequestResponseDto(request);
        }
      }),
    );

    return {
      items: enhancedItems,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getUserBookFileRequests(
    userId: string,
    options: BookFileRequestSearchOptions = {},
  ): Promise<{
    items: BookFileRequestResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.searchBookFileRequests({
      ...options,
      userId,
    });
  }

  async getBookFileRequests(
    bookId: string,
    options: BookFileRequestSearchOptions = {},
  ): Promise<{
    items: BookFileRequestResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.searchBookFileRequests({
      ...options,
      bookId,
    });
  }

  async deleteBookFileRequest(
    requestId: string,
    userId: string,
  ): Promise<void> {
    const request = await this.bookFileRequestRepo.findById(requestId);
    if (!request) {
      // If it doesn't exist, consider it deleted already
      return;
    }

    // Only the user who created the request or admins can delete it
    if (request.userId !== userId) {
      throw new UnauthorizedException('You can only delete your own requests');
    }

    // If the request is not pending, don't allow deletion
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be deleted');
    }

    await this.bookFileRequestRepo.delete(requestId);
  }
}
