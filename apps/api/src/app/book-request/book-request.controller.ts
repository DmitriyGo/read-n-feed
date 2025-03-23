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
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  BookRequestResponseDto,
  BookRequestUseCase,
  CreateBookFileDto,
  CreateBookRequestDto,
  PaginatedBookRequestResponseDto,
  UpdateBookRequestDto,
  toBookRequestResponseDto,
} from '@read-n-feed/application';
import { JwtPayload } from '@read-n-feed/domain';

import { CurrentUser } from '../auth/guards/current-user.decorator';
import { AdminOnly } from '../auth/guards/roles.decorator';

@ApiBearerAuth()
@ApiTags('book-requests')
@Controller('book-requests')
export class BookRequestController {
  constructor(
    private readonly bookRequestUseCase: BookRequestUseCase,
    private readonly bookFileUseCase: BookFileUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book request with required file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The book file to upload (required)',
        },
        title: {
          type: 'string',
          description: 'The title of the book',
        },
        description: {
          type: 'string',
          description: 'Short description or synopsis',
        },
        coverImageUrl: {
          type: 'string',
          description: 'Cover image URL',
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
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookRequestResponseDto> {
    // Validate file is provided
    if (!file) {
      throw new BadRequestException(
        'File is required when creating a book request',
      );
    }

    // Extract file-related props and book request props
    const { fileFormat, fileLanguage, ...bookRequestDto } = dto;

    if (!fileFormat) {
      throw new BadRequestException('File format is required');
    }

    // First create the book request
    const request = await this.bookRequestUseCase.createBookRequest(
      user.id,
      bookRequestDto,
    );

    try {
      // Upload the file and associate it with the book request
      const fileDto: CreateBookFileDto = {
        bookRequestId: request.id,
        format: fileFormat as any,
      };

      // Add language to metadata if provided
      const metadata: Record<string, any> = {};
      if (fileLanguage || dto.language) {
        metadata.language = fileLanguage || dto.language;
      }

      // Update the fileDto to include metadata
      fileDto.metadata = metadata;

      await this.bookFileUseCase.uploadBookFile(
        fileDto,
        file.buffer,
        file.mimetype,
        file.originalname,
      );

      // Get the updated request with files
      return this.bookRequestUseCase.getBookRequestWithFiles(request.id);
    } catch (error) {
      // If file upload fails, we should clean up by deleting the book request we just created
      try {
        await this.bookRequestUseCase.deleteBookRequest(request.id);
      } catch (deleteError) {
        // Log the error but don't expose it to the user
        console.error(
          'Failed to clean up book request after file upload failure:',
          deleteError,
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
  @UseInterceptors(FileInterceptor('file'))
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
        title: {
          type: 'string',
          description: 'Updated title of the book',
        },
        description: {
          type: 'string',
          description: 'Updated description',
        },
        coverImageUrl: {
          type: 'string',
          description: 'Updated cover image URL',
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
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookRequestResponseDto> {
    // First, check that the request exists and user has permission
    const existingRequest = await this.bookRequestUseCase.getBookRequest(id);

    if (existingRequest.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending book requests can be updated',
      );
    }

    // If not admin, check ownership
    if (!user.roles.includes('ADMIN') && existingRequest.userId !== user.id) {
      throw new ForbiddenException(
        'You can only update your own book requests',
      );
    }

    // Extract file-related props
    const { fileFormat, fileLanguage, ...updateDto } = dto;

    // Update the book request
    const updatedRequest = await this.bookRequestUseCase.updateBookRequest(
      id,
      existingRequest.userId,
      updateDto,
    );

    // If a file was uploaded, process it
    if (file) {
      if (!fileFormat) {
        throw new BadRequestException(
          'File format is required when uploading a file',
        );
      }

      const fileDto: CreateBookFileDto = {
        bookRequestId: id,
        format: fileFormat as any,
      };

      // Add language to metadata if provided
      const metadata: Record<string, any> = {};
      if (fileLanguage || dto.language) {
        metadata.language = fileLanguage || dto.language;
      }

      // Update the fileDto to include metadata
      fileDto.metadata = metadata;

      await this.bookFileUseCase.uploadBookFile(
        fileDto,
        file.buffer,
        file.mimetype,
        file.originalname,
      );
    }

    // Get the updated request with files
    return this.bookRequestUseCase.getBookRequestWithFiles(id);
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
    const request = await this.bookRequestUseCase.reviewBookRequest(
      id,
      user.id,
      dto,
    );

    // Get files for the request if it was approved
    const bookRequestWithFiles =
      await this.bookRequestUseCase.getBookRequestWithFiles(id);
    return bookRequestWithFiles;
  }
}
