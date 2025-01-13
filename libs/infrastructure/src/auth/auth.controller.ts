import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiProperty } from '@nestjs/swagger';
import { RegisterUserUseCase } from '@read-n-feed/application';
import { IsEmail, IsString, MinLength } from 'class-validator';

// @TODO: extract
export class RegisterUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongpassword', description: 'User password', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        role: 'user',
        createdAt: '2025-01-13T12:34:56.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async register(@Body() body: RegisterUserDto) {
    const user = await this.registerUserUseCase.execute(body.email, body.password);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
