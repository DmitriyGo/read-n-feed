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
  BookImageRequestUseCase,
  CreateBookImageRequestDto,
  BookImageRequestResponseDto,
  PaginatedBookImageRequestResponseDto,
} from '@read-n-feed/application';
import { JwtPayload } from '@read-n-feed/domain';

import { CurrentUser } from '../auth/guards/current-user.decorator';

@ApiBearerAuth()
@ApiTags('book-image-requests')
@Controller('book-image-requests')
export class BookImageRequestUserController {
  constructor(
    private readonly bookImageRequestUseCase: BookImageRequestUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new book image request with image upload',
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
          description: 'The image file to upload',
        },
        bookId: {
          type: 'string',
          format: 'uuid',
          description: 'The ID of the book to add/update an image for',
        },
        notes: {
          type: 'string',
          description: 'Additional notes for the admin (optional)',
        },
        imageUrl: {
          type: 'string',
          description: 'The URL of the image (if already uploaded)',
        },
      },
      required: ['bookId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Book image request created successfully',
    type: BookImageRequestResponseDto,
  })
  async createBookImageRequest(
    @Body() dto: CreateBookImageRequestDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookImageRequestResponseDto> {
    // Either file or imageUrl must be provided
    if (!file && !dto.imageUrl) {
      throw new BadRequestException('Either file or imageUrl must be provided');
    }

    const request = await this.bookImageRequestUseCase.createBookImageRequest(
      user.id,
      dto,
      file?.buffer,
      file?.mimetype,
      file?.originalname,
    );

    return this.bookImageRequestUseCase.getBookImageRequestWithDetails(
      request.id,
    );
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get all book image requests for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated book image requests for the current user',
    type: PaginatedBookImageRequestResponseDto,
  })
  async getMyBookImageRequests(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ): Promise<PaginatedBookImageRequestResponseDto> {
    return this.bookImageRequestUseCase.getUserBookImageRequests(user.id, {
      page,
      limit,
      status,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific book image request by ID' })
  @ApiParam({ name: 'id', description: 'Book image request ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the book image request',
    type: BookImageRequestResponseDto,
  })
  async getBookImageRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookImageRequestResponseDto> {
    const request = await this.bookImageRequestUseCase.getBookImageRequest(id);

    // If not admin, check ownership
    if (!user.roles.includes('ADMIN') && request.userId !== user.id) {
      throw new ForbiddenException('You can only view your own image requests');
    }

    return this.bookImageRequestUseCase.getBookImageRequestWithDetails(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a book image request' })
  @ApiParam({ name: 'id', description: 'Book image request ID' })
  @ApiResponse({
    status: 204,
    description: 'Book image request deleted successfully',
  })
  async deleteBookImageRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.bookImageRequestUseCase.deleteBookImageRequest(id, user.id);
  }

  @Post(':id/update-image')
  @ApiOperation({ summary: 'Update the image URL for a book image request' })
  @ApiParam({ name: 'id', description: 'Book image request ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
          description: 'The new URL of the image',
        },
      },
      required: ['imageUrl'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image URL updated successfully',
    type: BookImageRequestResponseDto,
  })
  async updateImageUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('imageUrl') imageUrl: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookImageRequestResponseDto> {
    await this.bookImageRequestUseCase.updateImageUrl(id, imageUrl, user.id);
    return this.bookImageRequestUseCase.getBookImageRequestWithDetails(id);
  }
}
