import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdminReviewDto,
  BookFileUseCase,
  BookFormatDto,
  BookRequestResponseDto,
  BookRequestUseCase,
  CreateBookFileDto,
  CreateBookRequestDto,
  PaginatedBookRequestResponseDto,
  UpdateBookRequestDto,
} from '@read-n-feed/application';
import { JwtPayload } from '@read-n-feed/domain';

import { CurrentUser } from '../auth/guards/current-user.decorator';
import { AdminOnly } from '../auth/guards/roles.decorator';
import {
  FileUploadService,
  ImageType,
} from '../file-upload/file-upload.service';

@ApiBearerAuth()
@ApiTags('book-requests')
@Controller('book-requests')
export class BookRequestController {
  constructor(
    private readonly bookRequestUseCase: BookRequestUseCase,
    private readonly bookFileUseCase: BookFileUseCase,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Create a new book request with required file and optional cover image',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The book file to upload (required)',
        },
        coverImage: {
          type: 'string',
          format: 'binary',
          description: 'Cover image file (optional)',
        },
        title: {
          type: 'string',
          description: 'The title of the book',
        },
        description: {
          type: 'string',
          description: 'Short description or synopsis',
        },
        publicationDate: {
          type: 'string',
          description: 'Publication date (YYYY-MM-DD)',
        },
        publisher: {
          type: 'string',
          description: 'Publisher name',
        },
        authorNames: {
          type: 'string',
          description:
            'Names of authors (comma-separated or JSON array string)',
          example: 'Author 1, Author 2, Author 3',
        },
        genreNames: {
          type: 'string',
          description: 'Names of genres (comma-separated or JSON array string)',
          example: 'Fiction, Sci-Fi',
        },
        tagLabels: {
          type: 'string',
          description:
            'Tags for the book (comma-separated or JSON array string)',
          example: 'bestseller, classic, mystery',
        },
        fileFormat: {
          type: 'string',
          enum: ['PDF', 'EPUB', 'FB2', 'MOBI', 'AZW3'],
          description: 'Format of the book file',
        },
        language: {
          type: 'string',
          description: 'Language of the book',
        },
        fileLanguage: {
          type: 'string',
          description: 'Language of the file (if different from book language)',
        },
        filename: {
          type: 'string',
          description: 'Custom display filename',
        },
      },
      required: ['file', 'fileFormat', 'title'],
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Book request with file successfully created',
    type: BookRequestResponseDto,
  })
  async createBookRequest(
    @Body() dto: CreateBookRequestDto,
    @UploadedFiles()
    files: { file: Express.Multer.File[]; coverImage?: Express.Multer.File[] },
    @CurrentUser() user: JwtPayload,
  ): Promise<BookRequestResponseDto> {
    // Validate book file is provided
    if (!files.file?.[0]) {
      throw new BadRequestException(
        'Book file is required when creating a book request',
      );
    }

    const bookFile = files.file[0];
    const coverImage = files.coverImage?.[0];

    // Extract file-related props and book request props
    const { fileFormat, fileLanguage, filename, ...bookRequestDto } = dto;

    if (!fileFormat) {
      throw new BadRequestException('File format is required');
    }

    // If cover image is provided, upload it first
    let coverImageUrl: string | undefined;
    if (coverImage) {
      try {
        // We'll use a temporary ID for the cover image, since we don't have the book request ID yet
        const tempId = `temp_${Date.now()}`;
        coverImageUrl = await this.fileUploadService.uploadImage(
          coverImage,
          ImageType.BOOK_COVER,
          tempId,
        );
        bookRequestDto.coverImageUrl = coverImageUrl;
      } catch {
        throw new BadRequestException('Failed to upload cover image');
      }
    }

    // Create the book request
    const request = await this.bookRequestUseCase.createBookRequest(
      user.id,
      bookRequestDto,
    );

    try {
      // Upload the book file and associate it with the book request
      const fileDto: CreateBookFileDto = {
        bookRequestId: request.id,
        filename: filename,
        format: fileFormat as BookFormatDto,
      };

      // Add language to metadata if provided
      const metadata: Record<string, unknown> = {};
      if (fileLanguage || dto.language) {
        metadata.language = fileLanguage || dto.language;
      }

      // Update the fileDto to include metadata
      fileDto.metadata = metadata;

      await this.bookFileUseCase.uploadBookFile(
        fileDto,
        bookFile.buffer,
        bookFile.mimetype,
        bookFile.originalname,
      );

      // Get the updated request with files
      return this.bookRequestUseCase.getBookRequestWithFiles(request.id);
    } catch (error) {
      // If file upload fails, clean up the cover image and book request
      try {
        if (coverImageUrl) {
          await this.fileUploadService.deleteImage(coverImageUrl);
        }
        await this.bookRequestUseCase.deleteBookRequest(request.id);
      } catch (cleanupError) {
        console.error(
          'Failed to clean up after file upload failure:',
          cleanupError,
        );
      }

      // Re-throw the original error
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all book requests (with filtering)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  @ApiQuery({ name: 'title', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns paginated book requests',
    type: PaginatedBookRequestResponseDto,
  })
  async getBookRequests(
    @CurrentUser() user: JwtPayload,
    @Query('page') pageQuery?: string,
    @Query('limit') limitQuery?: string,
    @Query('status') status?: string,
    @Query('title') title?: string,
  ): Promise<PaginatedBookRequestResponseDto> {
    // Parse pagination parameters safely
    const page = pageQuery ? parseInt(pageQuery, 10) : undefined;
    const limit = limitQuery ? parseInt(limitQuery, 10) : undefined;

    const options = {
      page: !isNaN(page as number) ? page : undefined,
      limit: !isNaN(limit as number) ? limit : undefined,
      status,
      title,
    };

    // For non-admin users, only show their own requests
    if (!user.roles.includes('ADMIN')) {
      const result = await this.bookRequestUseCase.getUserBookRequestsWithFiles(
        user.id,
        options,
      );
      return result;
    }

    // Admins can see all requests
    const result =
      await this.bookRequestUseCase.searchBookRequestsWithFiles(options);
    return result;
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get all book requests for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns paginated book requests for the current user',
    type: PaginatedBookRequestResponseDto,
  })
  async getMyBookRequests(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ): Promise<PaginatedBookRequestResponseDto> {
    return this.bookRequestUseCase.getUserBookRequestsWithFiles(user.id, {
      page,
      limit,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific book request by ID' })
  @ApiParam({ name: 'id', description: 'Book request ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the book request',
    type: BookRequestResponseDto,
  })
  async getBookRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookRequestResponseDto> {
    const bookRequestWithFiles =
      await this.bookRequestUseCase.getBookRequestWithFiles(id);

    // Non-admin users can only view their own requests
    if (
      !user.roles.includes('ADMIN') &&
      bookRequestWithFiles.userId !== user.id
    ) {
      throw new NotFoundException('Book request not found');
    }

    return bookRequestWithFiles;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a book request' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
  )
  @ApiParam({ name: 'id', description: 'Book request ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'New book file to upload (optional)',
        },
        coverImage: {
          type: 'string',
          format: 'binary',
          description: 'New cover image file to upload (optional)',
        },
        title: {
          type: 'string',
          description: 'Updated title of the book',
        },
        description: {
          type: 'string',
          description: 'Updated description',
        },
        publicationDate: {
          type: 'string',
          description: 'Updated publication date (YYYY-MM-DD)',
        },
        publisher: {
          type: 'string',
          description: 'Updated publisher name',
        },
        authorNames: {
          type: 'string',
          description:
            'Names of authors (comma-separated or JSON array string)',
          example: 'Author 1, Author 2, Author 3',
        },
        genreNames: {
          type: 'string',
          description: 'Names of genres (comma-separated or JSON array string)',
          example: 'Fiction, Sci-Fi',
        },
        tagLabels: {
          type: 'string',
          description:
            'Tags for the book (comma-separated or JSON array string)',
          example: 'bestseller, classic, mystery',
        },
        fileFormat: {
          type: 'string',
          enum: ['PDF', 'EPUB', 'FB2', 'MOBI', 'AZW3'],
          description: 'Format of the book file (required if file is provided)',
        },
        language: {
          type: 'string',
          description: 'Language of the book',
        },
        fileLanguage: {
          type: 'string',
          description: 'Language of the file (if different from book language)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the updated book request',
    type: BookRequestResponseDto,
  })
  async updateBookRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    dto: UpdateBookRequestDto & { fileFormat?: string; fileLanguage?: string },
    @UploadedFiles()
    files: { file?: Express.Multer.File[]; coverImage?: Express.Multer.File[] },
    @CurrentUser() user: JwtPayload,
  ): Promise<BookRequestResponseDto> {
    // Get the existing request to check permissions
    const existingRequest = await this.bookRequestUseCase.getBookRequest(id);
    if (!existingRequest) {
      throw new NotFoundException('Book request not found');
    }

    if (existingRequest.userId !== user.id && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException(
        'Not authorized to update this book request',
      );
    }

    // Handle cover image upload if provided
    if (files?.coverImage?.[0]) {
      try {
        // Delete existing cover image if any
        if (existingRequest.coverImageUrl) {
          await this.fileUploadService.deleteImage(
            existingRequest.coverImageUrl,
          );
        }

        // Upload new cover image
        const coverImageUrl = await this.fileUploadService.uploadImage(
          files.coverImage[0],
          ImageType.BOOK_COVER,
          id,
        );
        dto.coverImageUrl = coverImageUrl;
      } catch {
        throw new BadRequestException('Failed to upload cover image');
      }
    }

    // Handle book file upload if provided
    if (files?.file?.[0]) {
      const { fileFormat, fileLanguage } = dto;
      if (!fileFormat) {
        throw new BadRequestException(
          'File format is required when uploading a new file',
        );
      }

      const fileDto: CreateBookFileDto = {
        bookRequestId: id,
        format: fileFormat as BookFormatDto,
      };

      // Add language to metadata if provided
      if (fileLanguage || dto.language) {
        fileDto.metadata = {
          language: fileLanguage || dto.language,
        };
      }

      await this.bookFileUseCase.uploadBookFile(
        fileDto,
        files.file[0].buffer,
        files.file[0].mimetype,
        files.file[0].originalname,
      );
    }

    // Update the book request
    return this.bookRequestUseCase.updateBookRequest(id, user.id, dto);
  }

  @Post(':id/review')
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Review a book request (admin only)' })
  @ApiParam({ name: 'id', description: 'Book request ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the updated book request',
    type: BookRequestResponseDto,
  })
  async reviewBookRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminReviewDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookRequestResponseDto> {
    await this.bookRequestUseCase.reviewBookRequest(id, user.id, dto);

    // Get files for the request if it was approved
    const bookRequestWithFiles =
      await this.bookRequestUseCase.getBookRequestWithFiles(id);
    return bookRequestWithFiles;
  }
}
