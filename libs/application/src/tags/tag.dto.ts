import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Tag } from '@read-n-feed/domain';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    example: 'dystopian',
    description: 'Label of the tag',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  label: string;
}

export class UpdateTagDto {
  @ApiProperty({
    example: 'dystopian-future',
    description: 'Updated label of the tag',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  label: string;
}

export class TagResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'dystopian' })
  label: string;
}

export function toTagResponseDto(tag: Tag): TagResponseDto {
  const props = tag.toPrimitives();
  return {
    id: props.id,
    label: props.label,
  };
}
