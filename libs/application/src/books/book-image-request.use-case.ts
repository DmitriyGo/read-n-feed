import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  BookImageRequest,
  BookImageRequestSearchOptions,
  IBookImageRequestRepository,
  IBookRepository,
  IFileStorageService,
} from '@read-n-feed/domain';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateBookImageRequestDto,
  AdminReviewBookImageRequestDto,
  BookImageRequestResponseDto,
  toBookImageRequestResponseDto,
} from './dto/book-image-request.dto';

@Injectable()
export class BookImageRequestUseCase {
  private readonly logger = new Logger(BookImageRequestUseCase.name);

  constructor(
    @Inject('IBookImageRequestRepository')
    private readonly bookImageRequestRepo: IBookImageRequestRepository,
    @Inject('IBookRepository')
    private readonly bookRepo: IBookRepository,
    @Inject('IFileStorageService')
    private readonly fileStorage: IFileStorageService,
  ) {}

  async createBookImageRequest(
    userId: string,
    dto: CreateBookImageRequestDto,
    imageBuffer?: Buffer,
    mimeType?: string,
    originalFilename?: string,
  ): Promise<BookImageRequest> {
    // Verify the book exists
    const book = await this.bookRepo.findById(dto.bookId);
    if (!book) {
      throw new NotFoundException(`Book with id=${dto.bookId} not found`);
    }

    // Check if there's already a pending request for this book
    const existingRequest = await this.bookImageRequestRepo.findPendingByBook(
      dto.bookId,
    );
    if (existingRequest) {
      throw new BadRequestException(
        `There is already a pending image request for this book`,
      );
    }

    let imageUrl = dto.imageUrl || null;

    // If an image file was provided, upload it
    if (imageBuffer && mimeType) {
      try {
        // Generate a unique filename
        const filename = `book-covers/${uuidv4()}${
          originalFilename ? path.extname(originalFilename) : '.jpg'
        }`;

        // Upload the image
        await this.fileStorage.saveFile(imageBuffer, filename, mimeType);

        // Get the URL for the image
        imageUrl = await this.fileStorage.getFileUrl(filename);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to upload image: ${errorMessage}`);
        throw new BadRequestException(
          `Failed to upload image: ${errorMessage}`,
        );
      }
    }

    // Create the book image request
    const request = new BookImageRequest({
      id: uuidv4(),
      bookId: dto.bookId,
      userId,
      imageUrl,
      notes: dto.notes || null,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.bookImageRequestRepo.create(request);
    this.logger.log(
      `Book image request created for book ${dto.bookId} by user ${userId}`,
    );

    return request;
  }

  async updateImageUrl(
    requestId: string,
    imageUrl: string,
    userId: string,
  ): Promise<void> {
    // Verify the request exists
    const request = await this.bookImageRequestRepo.findById(requestId);
    if (!request) {
      throw new NotFoundException(
        `Book image request with id=${requestId} not found`,
      );
    }

    // Verify the user owns the request
    if (request.userId !== userId) {
      throw new UnauthorizedException(
        'You can only update your own image requests',
      );
    }

    // Verify the request is still pending
    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        'Cannot update image URL for a request that is not pending',
      );
    }

    // Update the image URL
    request.setImageUrl(imageUrl);
    await this.bookImageRequestRepo.update(request);
    this.logger.log(
      `Image URL updated for book image request ${requestId} by user ${userId}`,
    );
  }

  async reviewBookImageRequest(
    requestId: string,
    adminId: string,
    dto: AdminReviewBookImageRequestDto,
  ): Promise<BookImageRequest> {
    // Verify the request exists
    const request = await this.bookImageRequestRepo.findById(requestId);
    if (!request) {
      throw new NotFoundException(
        `Book image request with id=${requestId} not found`,
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
      // Ensure an image URL is associated with the request
      if (!request.imageUrl) {
        throw new BadRequestException(
          'Cannot approve a request without an associated image',
        );
      }

      try {
        // Get the book
        const book = await this.bookRepo.findById(request.bookId);
        if (!book) {
          throw new NotFoundException(`Book not found`);
        }

        // Update the book's cover image URL
        book.update({ coverImageUrl: request.imageUrl });
        await this.bookRepo.update(book);

        // Approve the request
        request.approve(adminId);
        await this.bookImageRequestRepo.update(request);

        this.logger.log(
          `Book image request ${requestId} approved by admin ${adminId}, image ${request.imageUrl} associated with book ${request.bookId}`,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to update book cover image during approval: ${errorMessage}`,
        );
        throw new BadRequestException(
          `Failed to update book cover image: ${errorMessage}`,
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
      await this.bookImageRequestRepo.update(request);
      this.logger.log(
        `Book image request ${requestId} rejected by admin ${adminId}: ${dto.rejectionReason}`,
      );
    }

    return request;
  }

  async getBookImageRequest(requestId: string): Promise<BookImageRequest> {
    const request = await this.bookImageRequestRepo.findById(requestId);
    if (!request) {
      throw new NotFoundException(
        `Book image request with id=${requestId} not found`,
      );
    }
    return request;
  }

  async getBookImageRequestWithDetails(
    requestId: string,
  ): Promise<BookImageRequestResponseDto> {
    const request = await this.getBookImageRequest(requestId);

    // Get book details
    const book = await this.bookRepo.findById(request.bookId);
    const bookInfo = book
      ? {
          title: book.title,
          coverImageUrl: book.coverImageUrl,
        }
      : null;

    return toBookImageRequestResponseDto(request, bookInfo);
  }

  async searchBookImageRequests(
    options: BookImageRequestSearchOptions,
  ): Promise<{
    items: BookImageRequestResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 10;

    const [requests, total] = await Promise.all([
      this.bookImageRequestRepo.search({
        ...options,
        page,
        limit,
      }),
      this.bookImageRequestRepo.count(options),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Get book details for each request
    const items = await Promise.all(
      requests.map(async (request) => {
        try {
          const book = await this.bookRepo.findById(request.bookId);
          const bookInfo = book
            ? {
                title: book.title,
                coverImageUrl: book.coverImageUrl,
              }
            : null;

          return toBookImageRequestResponseDto(request, bookInfo);
        } catch (error) {
          this.logger.error(
            `Error getting book info for request ${request.id}: ${error instanceof Error ? error.message : String(error)}`,
          );
          return toBookImageRequestResponseDto(request);
        }
      }),
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getUserBookImageRequests(
    userId: string,
    options: BookImageRequestSearchOptions,
  ): Promise<{
    items: BookImageRequestResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.searchBookImageRequests({
      ...options,
      userId,
    });
  }

  async getBookImageRequests(
    bookId: string,
    options: BookImageRequestSearchOptions,
  ): Promise<{
    items: BookImageRequestResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.searchBookImageRequests({
      ...options,
      bookId,
    });
  }

  async deleteBookImageRequest(
    requestId: string,
    userId: string,
  ): Promise<void> {
    const request = await this.bookImageRequestRepo.findById(requestId);
    if (!request) {
      throw new NotFoundException(
        `Book image request with id=${requestId} not found`,
      );
    }

    if (request.userId !== userId) {
      throw new UnauthorizedException(
        'You can only delete your own image requests',
      );
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(
        'Cannot delete a request that has already been processed',
      );
    }

    await this.bookImageRequestRepo.delete(requestId);
    this.logger.log(
      `Book image request ${requestId} deleted by user ${userId}`,
    );
  }
}
