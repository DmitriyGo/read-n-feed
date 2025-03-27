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
  BookFileRequestUseCase,
  AdminReviewBookFileRequestDto,
  BookFileRequestResponseDto,
  PaginatedBookFileRequestResponseDto,
} from '@read-n-feed/application';
import { JwtPayload } from '@read-n-feed/domain';

import { CurrentUser } from '../auth/guards/current-user.decorator';
import { AdminOnly } from '../auth/guards/roles.decorator';

@ApiBearerAuth()
@ApiTags('book-file-requests-admin')
@Controller('admin/book-file-requests')
export class BookFileRequestAdminController {
  constructor(
    private readonly bookFileRequestUseCase: BookFileRequestUseCase,
  ) {}

  @Get()
  @AdminOnly()
  @ApiOperation({ summary: 'Get all book file requests (admin only)' })
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
    description: 'Returns paginated book file requests',
    type: PaginatedBookFileRequestResponseDto,
  })
  async getAllBookFileRequests(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('bookId') bookId?: string,
  ): Promise<PaginatedBookFileRequestResponseDto> {
    return this.bookFileRequestUseCase.searchBookFileRequests({
      page,
      limit,
      status,
      bookId,
    });
  }

  @Post(':id/review')
  @AdminOnly()
  @ApiOperation({ summary: 'Review a book file request (admin only)' })
  @ApiParam({ name: 'id', description: 'Book file request ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated book file request',
    type: BookFileRequestResponseDto,
  })
  async reviewBookFileRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminReviewBookFileRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookFileRequestResponseDto> {
    await this.bookFileRequestUseCase.reviewBookFileRequest(id, user.id, dto);
    return this.bookFileRequestUseCase.getBookFileRequestWithDetails(id);
  }

  @Get(':id')
  @AdminOnly()
  @ApiOperation({
    summary: 'Get a specific book file request by ID (admin only)',
  })
  @ApiParam({ name: 'id', description: 'Book file request ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the book file request',
    type: BookFileRequestResponseDto,
  })
  async getBookFileRequestById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<BookFileRequestResponseDto> {
    return this.bookFileRequestUseCase.getBookFileRequestWithDetails(id);
  }

  @Get('book/:bookId')
  @AdminOnly()
  @ApiOperation({
    summary: 'Get all book file requests for a specific book (admin only)',
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
    description: 'Returns paginated book file requests for the specified book',
    type: PaginatedBookFileRequestResponseDto,
  })
  async getBookFileRequestsByBook(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ): Promise<PaginatedBookFileRequestResponseDto> {
    return this.bookFileRequestUseCase.getBookFileRequests(bookId, {
      page,
      limit,
      status,
    });
  }
}
