import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  CommentResponseDto,
  CommentUseCase,
  CreateCommentDto,
  UpdateCommentDto,
  UserUseCase,
} from '@read-n-feed/application';
import { BookComment } from '@read-n-feed/domain';
import { JwtPayload } from '@read-n-feed/domain';

import { CurrentUser } from '../auth/guards/current-user.decorator';
import { Public } from '../auth/guards/public.decorator';

@ApiBearerAuth()
@ApiTags('comments')
@Controller('comments')
export class CommentController {
  private readonly logger = new Logger(CommentController.name);

  constructor(
    private readonly commentUseCase: CommentUseCase,
    private readonly userUseCase: UserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiBody({ type: CreateCommentDto })
  @ApiCreatedResponse({
    description: 'Comment successfully created',
    type: CommentResponseDto,
  })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createComment(
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentUseCase.createComment({
      bookId: dto.bookId,
      userId: dto.userId,
      content: dto.content,
      parentCommentId: dto.parentCommentId,
    });
    return this.toResponseDto(comment);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comment by ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  async getCommentById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentUseCase.getCommentById(id);
    if (!comment)
      throw new NotFoundException(`Comment with id=${id} not found`);
    return this.toResponseDto(comment);
  }

  @Get('book/:bookId')
  @Public()
  @ApiOperation({ summary: 'Get all comments for a given book' })
  @ApiParam({ name: 'bookId', description: 'Book ID' })
  @ApiResponse({
    status: 200,
    description: 'Array of comments for the specified book',
    type: CommentResponseDto,
    isArray: true,
  })
  async getCommentsForBook(
    @Param('bookId', ParseUUIDPipe) bookId: string,
  ): Promise<CommentResponseDto[]> {
    const comments = await this.commentUseCase.getCommentsForBook(bookId);

    const enhancedComments = await Promise.all(
      comments.map(async (comment) => {
        const dto = this.toResponseDto(comment);
        try {
          const user = await this.userUseCase.getUserProfile(dto.userId);
          dto.username = user.toPrimitives().username;
        } catch (error) {
          this.logger.warn(
            `Could not get username for user ${dto.userId}: ${error.message}`,
          );
        }
        return dto;
      }),
    );

    return enhancedComments;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateComment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const updated = await this.commentUseCase.updateComment(id, dto.content);
    if (!updated)
      throw new NotFoundException(`Comment with id=${id} not found`);
    return this.toResponseDto(updated);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment by ID' })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  @ApiNotFoundResponse({ description: 'Comment not found' })
  async deleteComment(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    // check existence first
    const existing = await this.commentUseCase.getCommentById(id);
    if (!existing)
      throw new NotFoundException(`Comment with id=${id} not found`);

    // Only allow the comment's author or an admin to delete
    if (existing.userId !== user.id && !user.roles.includes('ADMIN')) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }

    await this.commentUseCase.deleteComment(id);
  }

  private toResponseDto(comment: BookComment): CommentResponseDto {
    const props = comment.toPrimitives();
    return {
      id: props.id,
      bookId: props.bookId,
      userId: props.userId,
      content: props.content,
      parentCommentId: props.parentCommentId ?? null,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
