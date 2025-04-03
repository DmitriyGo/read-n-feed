import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  Res,
  HttpStatus,
  HttpCode,
  StreamableFile,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  BookFileUseCase,
  CreateBookFileDto,
  BookFileResponseDto,
} from '@read-n-feed/application';
import { JwtPayload } from '@read-n-feed/domain';
import { Response } from 'express';

import { CurrentUser } from '../auth/guards/current-user.decorator';
import { Public } from '../auth/guards/public.decorator';
import { AdminOnly } from '../auth/guards/roles.decorator';

@ApiBearerAuth()
@ApiTags('book-files')
@Controller('book-files')
export class BookFileController {
  constructor(private readonly bookFileUseCase: BookFileUseCase) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload a new book file for a book or a book request',
  })
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
          description:
            'The ID of the book this file belongs to (optional if bookRequestId is provided)',
        },
        bookRequestId: {
          type: 'string',
          format: 'uuid',
          description:
            'The ID of the book request this file belongs to (optional if bookId is provided)',
        },
        format: {
          type: 'string',
          enum: ['PDF', 'EPUB', 'FB2', 'MOBI', 'AZW3'],
          description: 'Format of the book file',
        },
        filename: {
          type: 'string',
          description: 'Custom display filename',
        },
      },
      required: ['file', 'format'],
    },
  })
  async uploadBookFile(
    @Body() dto: CreateBookFileDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookFileResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate that either bookId or bookRequestId is provided
    if (!dto.bookId && !dto.bookRequestId) {
      throw new BadRequestException(
        'Either bookId or bookRequestId must be provided',
      );
    }

    // Only allow admins to upload files directly to books
    if (dto.bookId && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException(
        'Only admins can upload files directly to books',
      );
    }

    return this.bookFileUseCase.uploadBookFile(
      dto,
      file.buffer,
      file.mimetype,
      file.originalname,
    );
  }

  @Get('download/:id')
  @ApiOperation({ summary: 'Download a book file' })
  @ApiParam({ name: 'id', description: 'Book file ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the book file as a downloadable stream',
  })
  async downloadBookFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: JwtPayload,
  ): Promise<StreamableFile> {
    // Here you would add access control logic
    // For example:
    // if (!await this.hasDownloadPermission(user.id)) {
    //   throw new ForbiddenException('Your subscription does not allow downloading');
    // }

    const { buffer, mimeType, filename } =
      await this.bookFileUseCase.getBookFile(id);

    const encodedFilename = encodeURIComponent(filename);
    const contentDisposition = `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`;

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': contentDisposition,
      'Content-Length': buffer.length,
    });

    return new StreamableFile(buffer);
  }

  @Get('view/:id')
  @ApiOperation({ summary: 'View a book file in the browser (if supported)' })
  @ApiParam({ name: 'id', description: 'Book file ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the book file for in-browser viewing',
  })
  async viewBookFile(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: JwtPayload,
  ): Promise<StreamableFile> {
    const { buffer, mimeType, filename, file } =
      await this.bookFileUseCase.getBookFile(id);

    // For PDF files, set inline disposition
    const disposition = file.format.value === 'PDF' ? 'inline' : 'attachment';

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `${disposition}; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': buffer.length,
    });

    return new StreamableFile(buffer);
  }

  @Get('url/:id')
  @ApiOperation({ summary: 'Get a download URL for a book file' })
  @ApiParam({ name: 'id', description: 'Book file ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the download URL',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
    },
  })
  async getBookFileUrl(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ url: string }> {
    const url = await this.bookFileUseCase.getBookFileUrl(id);
    return { url };
  }

  @Delete(':id')
  @AdminOnly()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a book file' })
  @ApiParam({ name: 'id', description: 'Book file ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Book file deleted successfully',
  })
  async deleteBookFile(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.bookFileUseCase.deleteBookFile(id);
  }

  @Get('book/:bookId')
  @ApiOperation({ summary: 'Get all files for a book' })
  @ApiParam({ name: 'bookId', description: 'Book ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all files for the specified book',
    type: [BookFileResponseDto],
  })
  @Public()
  async getBookFiles(
    @Param('bookId', ParseUUIDPipe) bookId: string,
  ): Promise<BookFileResponseDto[]> {
    return this.bookFileUseCase.findBookFiles(bookId);
  }

  @Get('book-request/:bookRequestId')
  @ApiOperation({ summary: 'Get all files for a book request' })
  @ApiParam({ name: 'bookRequestId', description: 'Book Request ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all files for the specified book request',
    type: [BookFileResponseDto],
  })
  async getBookRequestFiles(
    @Param('bookRequestId', ParseUUIDPipe) bookRequestId: string,
  ): Promise<BookFileResponseDto[]> {
    return this.bookFileUseCase.findBookRequestFiles(bookRequestId);
  }

  @Get('metadata/:id')
  @ApiOperation({ summary: 'Get metadata for a book file' })
  @ApiParam({ name: 'id', description: 'Book file ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns file metadata',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        author: { type: 'string' },
        pageCount: { type: 'number' },
        fileSize: { type: 'number' },
        format: { type: 'string' },
        creationDate: { type: 'string', format: 'date-time' },
        language: { type: 'string' },
      },
    },
  })
  async getFileMetadata(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const bookFile = await this.bookFileUseCase.getBookFile(id);

    return {
      ...(bookFile.file.metadata || {}),
      format: bookFile.file.format.value,
      fileSize: bookFile.file.fileSize,
      filename: bookFile.filename,
    };
  }
}
