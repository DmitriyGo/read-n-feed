import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  BookImageRequestUseCase,
  AdminReviewBookImageRequestDto,
  BookImageRequestResponseDto,
  PaginatedBookImageRequestResponseDto,
} from '@read-n-feed/application';
import { JwtPayload } from '@read-n-feed/domain';

import { CurrentUser } from '../auth/guards/current-user.decorator';
import { AdminOnly } from '../auth/guards/roles.decorator';

@ApiBearerAuth()
@ApiTags('book-image-requests-admin')
@Controller('admin/book-image-requests')
export class BookImageRequestAdminController {
  constructor(
    private readonly bookImageRequestUseCase: BookImageRequestUseCase,
  ) {}

  @Get()
  @AdminOnly()
  @ApiOperation({ summary: 'Get all book image requests (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  @ApiQuery({ name: 'bookId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated book image requests',
    type: PaginatedBookImageRequestResponseDto,
  })
  async getAllBookImageRequests(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('bookId') bookId?: string,
  ): Promise<PaginatedBookImageRequestResponseDto> {
    return this.bookImageRequestUseCase.searchBookImageRequests({
      page,
      limit,
      status,
      bookId,
    });
  }

  @Post(':id/review')
  @AdminOnly()
  @ApiOperation({ summary: 'Review a book image request (admin only)' })
  @ApiParam({ name: 'id', description: 'Book image request ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated book image request',
    type: BookImageRequestResponseDto,
  })
  async reviewBookImageRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminReviewBookImageRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookImageRequestResponseDto> {
    await this.bookImageRequestUseCase.reviewBookImageRequest(id, user.id, dto);
    return this.bookImageRequestUseCase.getBookImageRequestWithDetails(id);
  }

  @Get(':id')
  @AdminOnly()
  @ApiOperation({
    summary: 'Get a specific book image request by ID (admin only)',
  })
  @ApiParam({ name: 'id', description: 'Book image request ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the book image request',
    type: BookImageRequestResponseDto,
  })
  async getBookImageRequestById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookImageRequestResponseDto> {
    return this.bookImageRequestUseCase.getBookImageRequestWithDetails(id);
  }

  @Get('book/:bookId')
  @AdminOnly()
  @ApiOperation({
    summary: 'Get all book image requests for a specific book (admin only)',
  })
  @ApiParam({ name: 'bookId', description: 'Book ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated book image requests for the specified book',
    type: PaginatedBookImageRequestResponseDto,
  })
  async getBookImageRequestsByBook(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ): Promise<PaginatedBookImageRequestResponseDto> {
    return this.bookImageRequestUseCase.getBookImageRequests(bookId, {
      page,
      limit,
      status,
    });
  }
}
