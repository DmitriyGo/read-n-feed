import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthUseCase, LoginDto, RegisterDto } from '@read-n-feed/application';
import { Request, Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const user = await this.authUseCase.register(dto);
    return res.status(HttpStatus.CREATED).json(user);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const tokens = await this.authUseCase.login(dto, userAgent);
    return res.status(HttpStatus.OK).json(tokens);
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Refresh tokens' })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken =
      req.cookies?.refreshToken || req.headers['x-refresh-token'];
    const userAgent = req.headers['user-agent'] || 'unknown';

    const tokens = await this.authUseCase.refreshTokens(
      refreshToken,
      userAgent,
    );
    return res.status(HttpStatus.OK).json(tokens);
  }

  @Get('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken =
      req.cookies?.refreshToken || req.headers['x-refresh-token'];
    if (refreshToken) {
      await this.authUseCase.logout(refreshToken);
    }
    return res.status(HttpStatus.OK).send({ success: true });
  }
}
