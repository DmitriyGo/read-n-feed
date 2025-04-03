import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  UploadedFile,
  BadRequestException,
  UseInterceptors,
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
  BookFileRequestUseCase,
  CreateBookFileRequestDto,
  BookFileRequestResponseDto,
  PaginatedBookFileRequestResponseDto,
  BookFileUseCase,
} from '@read-n-feed/application';
import { JwtPayload } from '@read-n-feed/domain';

import { CurrentUser } from '../auth/guards/current-user.decorator';

@ApiBearerAuth()
@ApiTags('book-file-requests')
@Controller('book-file-requests')
export class BookFileRequestUserController {
  constructor(
    private readonly bookFileRequestUseCase: BookFileRequestUseCase,
    private readonly bookFileUseCase: BookFileUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book file request with file upload' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The book file to upload',
        },
        bookId: {
          type: 'string',
          format: 'uuid',
          description: 'The ID of the book to add a file for',
        },
        format: {
          type: 'string',
          enum: ['PDF', 'EPUB', 'FB2', 'MOBI', 'AZW3'],
          description: 'Format of the book file',
        },
        notes: {
          type: 'string',
          description: 'Additional notes for the admin (optional)',
        },
        filename: {
          type: 'string',
          description: 'Custom display filename (supports Unicode characters)',
          example: 'Преступление и наказание.epub',
        },
      },
      required: ['file', 'bookId', 'format'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Book file request with file created successfully',
    type: BookFileRequestResponseDto,
  })
  async createBookFileRequest(
    @Body() dto: CreateBookFileRequestDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookFileRequestResponseDto> {
    if (!file) {
      throw new BadRequestException(
        'File is required when creating a book file request',
      );
    }

    const request =
      await this.bookFileRequestUseCase.createBookFileRequestWithFile(
        user.id,
        dto,
        file.buffer,
        file.mimetype,
        file.originalname,
      );

    return this.bookFileRequestUseCase.getBookFileRequestWithDetails(
      request.id,
    );
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get all book file requests for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated book file requests for the current user',
    type: PaginatedBookFileRequestResponseDto,
  })
  async getMyBookFileRequests(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ): Promise<PaginatedBookFileRequestResponseDto> {
    return this.bookFileRequestUseCase.getUserBookFileRequests(user.id, {
      page,
      limit,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific book file request by ID' })
  @ApiParam({ name: 'id', description: 'Book file request ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the book file request',
    type: BookFileRequestResponseDto,
  })
  async getBookFileRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookFileRequestResponseDto> {
    const request = await this.bookFileRequestUseCase.getBookFileRequest(id);

    // Regular users can only view their own requests
    if (request.userId !== user.id && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException('You can only view your own requests');
    }

    return this.bookFileRequestUseCase.getBookFileRequestWithDetails(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a book file request' })
  @ApiParam({ name: 'id', description: 'Book file request ID' })
  @ApiResponse({
    status: 204,
    description: 'Book file request deleted successfully',
  })
  async deleteBookFileRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.bookFileRequestUseCase.deleteBookFileRequest(id, user.id);
  }

  @Post(':id/associate-file/:fileId')
  @ApiOperation({ summary: 'Associate a file with a book file request' })
  @ApiParam({ name: 'id', description: 'Book file request ID' })
  @ApiParam({ name: 'fileId', description: 'Book file ID' })
  @ApiResponse({ status: 200, description: 'File associated successfully' })
  async associateFileWithRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fileId', ParseUUIDPipe) fileId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookFileRequestResponseDto> {
    await this.bookFileRequestUseCase.associateFileWithRequest(
      id,
      fileId,
      user.id,
    );
    return this.bookFileRequestUseCase.getBookFileRequestWithDetails(id);
  }
}
