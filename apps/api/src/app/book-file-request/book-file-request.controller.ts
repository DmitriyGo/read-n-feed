import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { BookFileRequestUseCase } from '@read-n-feed/application';
import { JwtPayload } from '@read-n-feed/domain';

import { CurrentUser } from '../auth/guards/current-user.decorator';

@ApiTags('book-file-requests')
@Controller('book-requests/:requestId/files')
@UseGuards(AuthGuard('jwt'))
export class BookFileRequestController {
  constructor(
    private readonly bookFileRequestUseCase: BookFileRequestUseCase,
  ) {}

  @Post(':fileId')
  @ApiOperation({ summary: 'Attach a file to a book request' })
  @ApiParam({ name: 'requestId', description: 'Book request ID' })
  @ApiParam({ name: 'fileId', description: 'Book file ID' })
  @ApiResponse({ status: 200, description: 'File attached successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Book request or file not found' })
  async attachFileToRequest(
    @Param('requestId') requestId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    try {
      await this.bookFileRequestUseCase.attachFileToRequest(
        requestId,
        fileId,
        user.id,
      );
      return { message: 'File attached successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to attach file to request',
      );
    }
  }

  @Delete(':fileId')
  @ApiOperation({ summary: 'Detach a file from a book request' })
  @ApiParam({ name: 'requestId', description: 'Book request ID' })
  @ApiParam({ name: 'fileId', description: 'Book file ID' })
  @ApiResponse({ status: 200, description: 'File detached successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Book request or file not found' })
  async detachFileFromRequest(
    @Param('requestId') requestId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    try {
      await this.bookFileRequestUseCase.detachFileFromRequest(
        requestId,
        fileId,
        user.id,
      );
      return { message: 'File detached successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to detach file from request',
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all files attached to a book request' })
  @ApiParam({ name: 'requestId', description: 'Book request ID' })
  @ApiResponse({ status: 200, description: 'List of files' })
  @ApiResponse({ status: 404, description: 'Book request not found' })
  async getRequestFiles(
    @Param('requestId') requestId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    try {
      const files = await this.bookFileRequestUseCase.getRequestFiles(
        requestId,
        user.id,
      );
      return files.map((file) => ({
        id: file.id,
        format: file.format.value,
        filename: file.filename,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        isValidated: file.isValidated,
        createdAt: file.createdAt,
      }));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to get files for book request',
      );
    }
  }
}
