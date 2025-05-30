import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
  StreamableFile,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  ParseUUIDPipe,
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
import { Response } from 'express';
import * as path from 'path';

import { FileUploadService, ImageType } from './file-upload.service';
import { CurrentUser } from '../auth/guards/current-user.decorator';
import { AdminOnly } from '../auth/guards/roles.decorator';

@ApiBearerAuth()
@ApiTags('file-upload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  /**
   * Usage flow for book cover images:
   * 1. Upload the image using POST /file-upload/book-cover/{bookId}
   * 2. Get the URL from the response
   * 3. Update the book's coverImageUrl using PUT /books/{id}/cover-image
   */

  /**
   * Usage flow for user avatar images:
   * 1. Upload the image using POST /file-upload/user-avatar
   * 2. Get the URL from the response
   * 3. Update the user's avatarUrl using PATCH /users/me/avatar
   */

  @Post('book-cover/:bookId')
  @ApiOperation({ summary: 'Upload a book cover image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The image file to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the URL of the uploaded image',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
    },
  })
  async uploadBookCover(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Check if file is an image
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // Only admins can upload book covers
    if (!user.roles.includes('ADMIN')) {
      throw new BadRequestException('Only admins can upload book covers');
    }

    const url = await this.fileUploadService.uploadImage(
      file,
      ImageType.BOOK_COVER,
      bookId,
    );

    return { url };
  }

  @Post('user-avatar')
  @ApiOperation({ summary: 'Upload a user avatar image' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The image file to upload',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the URL of the uploaded image',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
    },
  })
  async uploadUserAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Check if file is an image
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    const url = await this.fileUploadService.uploadImage(
      file,
      ImageType.USER_AVATAR,
      user.id,
    );

    return { url };
  }

  @Get('book-cover/:filename')
  @ApiOperation({ summary: 'Get a book cover image' })
  @ApiParam({ name: 'filename', description: 'Image filename' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the image file',
  })
  async getBookCover(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const filePath = path.join(ImageType.BOOK_COVER, filename);

    try {
      const buffer = await this.fileUploadService.getImage(filePath);

      // Set appropriate content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      };

      res.set({
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': buffer.length,
      });

      return new StreamableFile(buffer);
    } catch (error) {
      throw new NotFoundException('Image not found');
    }
  }

  @Get('user-avatar/:filename')
  @ApiOperation({ summary: 'Get a user avatar image' })
  @ApiParam({ name: 'filename', description: 'Image filename' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the image file',
  })
  async getUserAvatar(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const filePath = path.join(ImageType.USER_AVATAR, filename);

    try {
      const buffer = await this.fileUploadService.getImage(filePath);

      // Set appropriate content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      };

      res.set({
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': buffer.length,
      });

      return new StreamableFile(buffer);
    } catch (error) {
      throw new NotFoundException('Image not found');
    }
  }

  @Delete('book-cover/:filename')
  @AdminOnly()
  @ApiOperation({ summary: 'Delete a book cover image' })
  @ApiParam({ name: 'filename', description: 'Image filename' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Image deleted successfully',
  })
  async deleteBookCover(@Param('filename') filename: string): Promise<void> {
    const filePath = path.join(ImageType.BOOK_COVER, filename);
    await this.fileUploadService.deleteImage(filePath);
  }

  @Delete('user-avatar/:filename')
  @ApiOperation({ summary: 'Delete a user avatar image' })
  @ApiParam({ name: 'filename', description: 'Image filename' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Image deleted successfully',
  })
  async deleteUserAvatar(
    @Param('filename') filename: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    // Only allow users to delete their own avatars or admins to delete any
    // This would require additional logic to verify the avatar belongs to the user

    const filePath = path.join(ImageType.USER_AVATAR, filename);
    await this.fileUploadService.deleteImage(filePath);
  }
}
