import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'The ID of the book being commented on' })
  @IsUUID()
  bookId: string;

  @ApiProperty({ description: 'The ID of the user creating the comment' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'The actual comment content' })
  @IsString()
  @MaxLength(1000)
  content: string;

  @ApiPropertyOptional({ description: 'Parent comment ID if this is a reply' })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}

export class UpdateCommentDto {
  @ApiProperty({ description: 'New comment content' })
  @IsString()
  @MaxLength(1000)
  content: string;
}

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookId: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional({ description: 'Username of the comment author' })
  username?: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  parentCommentId?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
