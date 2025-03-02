import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Author } from '@read-n-feed/domain';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({
    example: 'J.K. Rowling',
    description: 'Full name of the author',
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: 'British author best known for the Harry Potter series',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    example: '1965-07-31',
    description: 'Author date of birth (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    description: 'Author date of death if applicable (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  dateOfDeath?: Date;
}

export class UpdateAuthorDto {
  @ApiPropertyOptional({
    example: 'J.K. Rowling',
    description: 'Updated name of the author',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'British author best known for the Harry Potter series',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    example: '1965-07-31',
    description: 'Updated date of birth (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    description: 'Updated date of death if applicable (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  dateOfDeath?: Date;
}

export class SearchAuthorsDto {
  @ApiPropertyOptional({
    description: 'Partial name match',
    example: 'Rowling',
  })
  @IsString()
  @IsOptional()
  name?: string;
}

export class AuthorResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'J.K. Rowling' })
  name: string;

  @ApiPropertyOptional({
    example: 'British author best known for the Harry Potter series',
  })
  bio?: string | null;

  @ApiPropertyOptional({ example: '1965-07-31T00:00:00.000Z' })
  dateOfBirth?: Date | null;

  @ApiPropertyOptional({ example: null })
  dateOfDeath?: Date | null;
}

export function toAuthorResponseDto(author: Author): AuthorResponseDto {
  const props = author.toPrimitives();
  return {
    id: props.id,
    name: props.name,
    bio: props.bio,
    dateOfBirth: props.dateOfBirth,
    dateOfDeath: props.dateOfDeath,
  };
}
