// apps/api/src/app/book-request/book-request.controller.ts
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
  AdminReviewDto,
  BookRequestResponseDto,
  BookRequestUseCase,
  CreateBookRequestDto,
  PaginatedBookRequestResponseDto,
  UpdateBookRequestDto,
  toBookRequestResponseDto,
} from '@read-n-feed/application';
import { BookRequestProps, JwtPayload } from '@read-n-feed/domain';

import { CurrentUser } from '../auth/guards/current-user.decorator';
import { AdminOnly } from '../auth/guards/roles.decorator';

@ApiBearerAuth()
@ApiTags('book-requests')
@Controller('book-requests')
export class BookRequestController {
  constructor(private readonly bookRequestUseCase: BookRequestUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book request' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Book request successfully created',
    type: BookRequestResponseDto,
  })
  async createBookRequest(
    @Body() dto: CreateBookRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookRequestResponseDto> {
    const request = await this.bookRequestUseCase.createBookRequest(
      user.id,
      dto,
    );
    return toBookRequestResponseDto(request);
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
      const result = await this.bookRequestUseCase.getUserBookRequests(
        user.id,
        options,
      );
      return {
        ...result,
        items: result.items.map((item) => toBookRequestResponseDto(item)),
      };
    }

    // Admins can see all requests
    const result = await this.bookRequestUseCase.searchBookRequests(options);
    return {
      ...result,
      items: result.items.map((item) => toBookRequestResponseDto(item)),
    };
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
    const result = await this.bookRequestUseCase.getUserBookRequests(user.id, {
      page,
      limit,
      status,
    });

    return {
      ...result,
      items: result.items.map((item) => toBookRequestResponseDto(item)),
    };
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
    const request = await this.bookRequestUseCase.getBookRequest(id);

    // Non-admin users can only view their own requests
    if (!user.roles.includes('ADMIN') && request.userId !== user.id) {
      throw new NotFoundException('Book request not found');
    }

    return toBookRequestResponseDto(request);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a book request' })
  @ApiParam({ name: 'id', description: 'Book request ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the updated book request',
    type: BookRequestResponseDto,
  })
  async updateBookRequest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookRequestResponseDto> {
    // For regular users
    if (!user.roles.includes('ADMIN')) {
      const request = await this.bookRequestUseCase.updateBookRequest(
        id,
        user.id,
        dto,
      );
      return toBookRequestResponseDto(request);
    }

    const request = await this.bookRequestUseCase.getBookRequest(id);
    const updatedRequest = await this.bookRequestUseCase.updateBookRequest(
      id,
      request.userId,
      dto,
    );

    return toBookRequestResponseDto(updatedRequest);
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
    return toBookRequestResponseDto(request);
  }
}
