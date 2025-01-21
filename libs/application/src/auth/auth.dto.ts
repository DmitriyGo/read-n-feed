import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongPass123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'https://some-cdn/avatar.png', required: false })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address used for login',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'strongPass123',
    description: 'Password for the account',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
