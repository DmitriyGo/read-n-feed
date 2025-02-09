import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  UseGuards,
  UnauthorizedException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUseCase, LoginDto, RegisterDto } from '@read-n-feed/application';
import { AuthCookieOptionsService } from '@read-n-feed/infrastructure';
import { Request, Response } from 'express';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './guards/public.decorator';

@Public()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authUseCase: AuthUseCase,
    private readonly authCookieOptions: AuthCookieOptionsService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const user = await this.authUseCase.register(dto);
    return res.status(HttpStatus.CREATED).json(user);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip;
    const { accessToken, refreshToken } = await this.authUseCase.login(
      dto,
      userAgent,
      ipAddress,
    );

    res.cookie(
      'refreshToken',
      refreshToken,
      this.authCookieOptions.getDefaultCookieOptions(),
    );

    return { accessToken };
  }

  @Get('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh tokens' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided.');
    }

    const userAgent = req.headers['user-agent'] || 'unknown';
    const ipAddress = req.ip;
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authUseCase.refreshTokens(refreshToken, userAgent, ipAddress);

    res.cookie(
      'refreshToken',
      newRefreshToken,
      this.authCookieOptions.getDefaultCookieOptions(),
    );

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found.');
    }

    await this.authUseCase.logout(refreshToken, false);
    res.clearCookie('refreshToken', { path: '/' });

    return { message: 'Logged out successfully.' };
  }

  @Post('logout-all')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found.');
    }

    await this.authUseCase.logout(refreshToken, true);
    res.clearCookie('refreshToken', { path: '/' });

    return { message: 'Logged out from all devices.' };
  }
}
