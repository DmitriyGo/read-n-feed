import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  BookRequest,
  BookRequestSearchOptions,
  IBookRequestRepository,
  IBookRepository,
  IUserRepository,
  IAuthorRepository,
  IGenreRepository,
  ITagRepository,
  Author,
  Genre,
  Tag,
  Book,
  BookRequestProps,
  IBookFileRepository,
} from '@read-n-feed/domain';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateBookRequestDto,
  UpdateBookRequestDto,
  AdminReviewDto,
  BookRequestResponseDto,
  toBookRequestResponseDto,
} from './dto/book-request.dto';

@Injectable()
export class BookRequestUseCase {
  private readonly logger = new Logger(BookRequestUseCase.name);
  private readonly MAX_PENDING_REQUESTS = 5;

  constructor(
    @Inject('IBookRequestRepository')
    private readonly bookRequestRepo: IBookRequestRepository,
    @Inject('IBookRepository')
    private readonly bookRepo: IBookRepository,
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
    @Inject('IAuthorRepository')
    private readonly authorRepo: IAuthorRepository,
    @Inject('IGenreRepository')
    private readonly genreRepo: IGenreRepository,
    @Inject('ITagRepository')
    private readonly tagRepo: ITagRepository,
    @Inject('IBookFileRepository')
    private readonly bookFileRepo: IBookFileRepository,
  ) {}

  async createBookRequest(
    userId: string,
    dto: Omit<CreateBookRequestDto, 'fileFormat' | 'fileLanguage'>,
  ): Promise<BookRequest> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with id=${userId} not found`);
    }

    const pendingCount =
      await this.bookRequestRepo.countUserPendingRequests(userId);
    if (pendingCount >= this.MAX_PENDING_REQUESTS) {
      throw new BadRequestException(
        `You have reached the maximum number of pending requests (${this.MAX_PENDING_REQUESTS})`,
      );
    }

    const duplicate = await this.bookRequestRepo.findDuplicateRequest(
      userId,
      dto.title,
    );
    if (duplicate) {
      throw new BadRequestException(
        'You already have a pending request for this book',
      );
    }

    const bookRequest = new BookRequest({
      id: uuidv4(),
      userId,
      title: dto.title,
      description: dto.description || null,
      coverImageUrl: dto.coverImageUrl || null,
      publicationDate: dto.publicationDate
        ? new Date(dto.publicationDate)
        : null,
      publisher: dto.publisher || null,
      authorNames: dto.authorNames || null,
      genreNames: dto.genreNames || null,
      tagLabels: dto.tagLabels || null,
      language: dto.language || null,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.bookRequestRepo.create(bookRequest);
    return bookRequest;
  }

  async updateBookRequest(
    requestId: string,
    userId: string,
    dto: UpdateBookRequestDto,
  ): Promise<BookRequest> {
    const bookRequest = await this.bookRequestRepo.findById(requestId);
    if (!bookRequest) {
      throw new NotFoundException(
        `Book request with id=${requestId} not found`,
      );
    }

    // Users can only update their own pending requests
    if (bookRequest.userId !== userId) {
      throw new UnauthorizedException('You can only update your own requests');
    }

    if (bookRequest.status !== 'PENDING') {
      throw new BadRequestException(
        'This request has already been processed and cannot be updated',
      );
    }

    const updateData: Partial<BookRequestProps> = {
      ...dto,
      publicationDate: dto.publicationDate
        ? new Date(dto.publicationDate)
        : undefined,
    };

    bookRequest.update(updateData);

    await this.bookRequestRepo.update(bookRequest);
    return bookRequest;
  }

  async reviewBookRequest(
    requestId: string,
    adminId: string,
    dto: AdminReviewDto,
  ): Promise<BookRequest> {
    const bookRequest = await this.bookRequestRepo.findById(requestId);
    if (!bookRequest) {
      throw new NotFoundException(
        `Book request with id=${requestId} not found`,
      );
    }

    if (bookRequest.status !== 'PENDING') {
      throw new BadRequestException('This request has already been processed');
    }

    if (dto.adminNotes) {
      bookRequest.updateAdminNotes(dto.adminNotes);
    }

    if (dto.status === 'APPROVED') {
      try {
        const now = new Date();

        // 1. Create a Book entity to add to the repository
        const newBookId = uuidv4();
        const book = new Book({
          id: newBookId,
          title: bookRequest.title,
          description: bookRequest.description || null,
          coverImageUrl: bookRequest.coverImageUrl || null,
          publicationDate: bookRequest.publicationDate || null,
          publisher: bookRequest.publisher || null,
          language: bookRequest.language || null,
          averageRating: null,
          totalLikes: 0,
          createdAt: now,
          updatedAt: now,
        });
        await this.bookRepo.create(book);

        // 2. Handle authors - find or create authors
        if (bookRequest.authorNames && bookRequest.authorNames.length > 0) {
          const authorIds: string[] = [];

          for (const authorName of bookRequest.authorNames) {
            const existingAuthors =
              await this.authorRepo.findByName(authorName);

            if (existingAuthors.length > 0) {
              // Use the first existing author with this name
              authorIds.push(existingAuthors[0].id);
            } else {
              // Create a new author
              const authorId = uuidv4();
              const newAuthor = new Author({
                id: authorId,
                name: authorName,
                bio: null,
                dateOfBirth: null,
                dateOfDeath: null,
              });

              await this.authorRepo.create(newAuthor);
              authorIds.push(authorId);
            }
          }

          // Link authors to the book
          if (authorIds.length > 0) {
            await this.bookRepo.addAuthors(newBookId, authorIds);
          }
        }

        // 3. Handle genres - find or create genres
        if (bookRequest.genreNames && bookRequest.genreNames.length > 0) {
          const genreIds: string[] = [];

          for (const genreName of bookRequest.genreNames) {
            const genre = await this.genreRepo.findByName(genreName);

            if (genre) {
              genreIds.push(genre.id);
            } else {
              // Create a new genre - removing the description field
              const genreId = uuidv4();
              const newGenre = new Genre({
                id: genreId,
                name: genreName,
              });

              await this.genreRepo.create(newGenre);
              genreIds.push(genreId);
            }
          }

          // Link genres to the book
          if (genreIds.length > 0) {
            await this.bookRepo.addGenres(newBookId, genreIds);
          }
        }

        // 4. Handle tags - find or create tags
        if (bookRequest.tagLabels && bookRequest.tagLabels.length > 0) {
          const tagIds: string[] = [];

          for (const tagLabel of bookRequest.tagLabels) {
            const tag = await this.tagRepo.findByLabel(tagLabel);

            if (tag) {
              tagIds.push(tag.id);
            } else {
              // Create a new tag
              const tagId = uuidv4();
              const newTag = new Tag({
                id: tagId,
                label: tagLabel,
              });

              await this.tagRepo.create(newTag);
              tagIds.push(tagId);
            }
          }

          // Link tags to the book
          if (tagIds.length > 0) {
            await this.bookRepo.addTags(newBookId, tagIds);
          }
        }

        // 5. Handle book files - associate files with the new book
        try {
          // Find all files associated with this request
          const bookFiles =
            await this.bookFileRepo.findAllByBookRequest(requestId);
          if (bookFiles.length > 0) {
            // Get the file IDs
            const fileIds = bookFiles.map((file) => file.id);

            // Associate files with the new book
            await this.bookFileRepo.associateWithBook(fileIds, newBookId);

            this.logger.log(
              `Associated ${fileIds.length} files with newly created book ${newBookId}`,
            );
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Error handling book files during approval: ${errorMessage}`,
          );
          // Continue with approval process even if file association fails
        }

        // Store the resulting book ID in the request
        bookRequest.update({
          resultingBookId: newBookId,
        });

        // Approve the request
        bookRequest.approve(adminId);

        this.logger.log(
          `Book request ${requestId} approved by admin ${adminId}, created book ${newBookId}`,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to create book from request ${requestId}: ${errorMessage}`,
        );
        throw new BadRequestException(`Failed to create book: ${errorMessage}`);
      }
    } else if (dto.status === 'REJECTED') {
      // Ensure rejection reason is provided
      if (!dto.rejectionReason) {
        throw new BadRequestException(
          'A reason must be provided when rejecting a request',
        );
      }
      // Reject the request
      bookRequest.reject(adminId, dto.rejectionReason);
      this.logger.log(
        `Book request ${requestId} rejected by admin ${adminId}: ${dto.rejectionReason}`,
      );
    }

    await this.bookRequestRepo.update(bookRequest);
    return bookRequest;
  }

  async getBookRequest(requestId: string): Promise<BookRequest> {
    const bookRequest = await this.bookRequestRepo.findById(requestId);
    if (!bookRequest) {
      throw new NotFoundException(
        `Book request with id=${requestId} not found`,
      );
    }
    return bookRequest;
  }

  async searchBookRequests(options: BookRequestSearchOptions): Promise<{
    items: BookRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [requests, total] = await Promise.all([
      this.bookRequestRepo.search(options),
      this.bookRequestRepo.count(options),
    ]);

    const page = options.page || 1;
    const limit = options.limit || 10;
    const totalPages = Math.ceil(total / limit);

    return {
      items: requests,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getUserBookRequests(
    userId: string,
    options: BookRequestSearchOptions = {},
  ): Promise<{
    items: BookRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.searchBookRequests({
      ...options,
      userId,
    });
  }

  async deleteBookRequest(requestId: string): Promise<void> {
    const bookRequest = await this.bookRequestRepo.findById(requestId);
    if (!bookRequest) {
      // If it doesn't exist, we consider it deleted already
      return;
    }

    // Delete associated files
    try {
      const files = await this.bookFileRepo.findAllByBookRequest(requestId);

      // Delete each file
      for (const file of files) {
        await this.bookFileRepo.delete(file.id);
      }
    } catch (error) {
      this.logger.warn(
        `Error deleting files for request ${requestId}: ${error}`,
      );
      // Continue with request deletion even if file deletion fails
    }

    // Delete the request
    await this.bookRequestRepo.delete(requestId);
  }

  async getUserBookRequestsWithFiles(
    userId: string,
    options: BookRequestSearchOptions = {},
  ): Promise<{
    items: BookRequestResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.searchBookRequests({
      ...options,
      userId,
    });

    // Enhance each book request with its files
    const enhancedItems = await Promise.all(
      result.items.map(async (request) => {
        return this.getBookRequestWithFiles(request.id);
      }),
    );

    return {
      items: enhancedItems,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async searchBookRequestsWithFiles(
    options: BookRequestSearchOptions = {},
  ): Promise<{
    items: BookRequestResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const result = await this.searchBookRequests(options);

    // Enhance each book request with its files
    const enhancedItems = await Promise.all(
      result.items.map(async (request) => {
        return this.getBookRequestWithFiles(request.id);
      }),
    );

    return {
      items: enhancedItems,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getBookRequestWithFiles(
    requestId: string,
  ): Promise<BookRequestResponseDto> {
    const bookRequest = await this.getBookRequest(requestId);

    // Get files associated with this request
    const files = await this.bookFileRepo.findAllByBookRequest(requestId);

    // Transform files to response DTOs
    const fileResponses = files.map((file) => ({
      id: file.id,
      bookId: file.bookId,
      bookRequestId: file.bookRequestId,
      format: file.format.value,
      fileSize: file.fileSize,
      createdAt: file.createdAt,
      filename: file.filename,
      mimeType: file.mimeType,
      isValidated: file.isValidated,
      metadata: file.metadata,
    }));

    // Use toBookRequestResponseDto to create the response
    return toBookRequestResponseDto(bookRequest, fileResponses);
  }
}
