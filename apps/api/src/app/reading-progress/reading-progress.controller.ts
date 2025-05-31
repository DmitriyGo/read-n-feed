import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpStatus,
  ParseUUIDPipe,
  NotFoundException,
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
  ReadingProgressUseCase,
  ReadingProgressResponseDto,
  SaveReadingProgressDto,
} from '@read-n-feed/application';
import { JwtPayload } from '@read-n-feed/domain';

import { CurrentUser } from '../auth/guards/current-user.decorator';

@ApiBearerAuth()
@ApiTags('reading-progress')
@Controller('reading-progress')
export class ReadingProgressController {
  constructor(private readonly progressUseCase: ReadingProgressUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Save reading progress for a book' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Progress saved successfully',
    type: ReadingProgressResponseDto,
  })
  async saveProgress(
    @Body() dto: SaveReadingProgressDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ReadingProgressResponseDto> {
    return this.progressUseCase.saveProgress(user.id, dto);
  }

  @Get('book/:bookId')
  @ApiOperation({ summary: 'Get reading progress for a book' })
  @ApiParam({ name: 'bookId', description: 'Book ID' })
  @ApiQuery({
    name: 'deviceId',
    required: false,
    description: 'Device ID (if omitted, returns progress for current device)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns reading progress',
    type: ReadingProgressResponseDto,
  })
  async getProgress(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @Query('deviceId') deviceId: string | undefined,
    @CurrentUser() user: JwtPayload,
  ): Promise<ReadingProgressResponseDto> {
    const progress = await this.progressUseCase.getProgress(
      user.id,
      bookId,
      deviceId,
    );

    if (!progress) {
      throw new NotFoundException('No reading progress found for this book');
    }

    return progress;
  }

  @Get('book/:bookId/all-devices')
  @ApiOperation({
    summary: 'Get reading progress for a book across all devices',
  })
  @ApiParam({ name: 'bookId', description: 'Book ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns reading progress for all devices',
    type: [ReadingProgressResponseDto],
  })
  async getAllProgress(
    @Param('bookId', ParseUUIDPipe) bookId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ReadingProgressResponseDto[]> {
    return this.progressUseCase.getAllProgress(user.id, bookId);
  }

  @Get('in-progress')
  @ApiOperation({ summary: 'Get all books in progress for the current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns IDs of books that the user has started reading',
    schema: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uuid',
      },
    },
  })
  async getInProgressBooks(@CurrentUser() user: JwtPayload): Promise<string[]> {
    return this.progressUseCase.getInProgressBooks(user.id);
  }
}
