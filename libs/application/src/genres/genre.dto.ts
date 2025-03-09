import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Genre } from '@read-n-feed/domain';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateGenreDto {
  @ApiProperty({
    example: 'Science Fiction',
    description: 'Name of the genre',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}

export class UpdateGenreDto {
  @ApiPropertyOptional({
    example: 'Sci-Fi',
    description: 'Updated name of the genre',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;
}

export class GenreResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Science Fiction' })
  name: string;
}

export function toGenreResponseDto(genre: Genre): GenreResponseDto {
  const props = genre.toPrimitives();
  return {
    id: props.id,
    name: props.name,
  };
}
