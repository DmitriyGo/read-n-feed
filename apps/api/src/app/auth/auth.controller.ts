import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUseCase, LoginDto, RegisterDto } from '@read-n-feed/application';
import { JwtPayload } from '@read-n-feed/domain';
import { AuthCookieOptionsService } from '@read-n-feed/infrastructure';
import { Request, Response } from 'express';

import { CurrentUser } from './guards/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './guards/public.decorator';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authUseCase: AuthUseCase,
    private readonly authCookieOptions: AuthCookieOptionsService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    return await this.authUseCase.register(dto);
  }

  @Public()
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

  @Public()
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

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authUseCase.refreshTokens(refreshToken);

    res.cookie(
      'refreshToken',
      newRefreshToken,
      this.authCookieOptions.getDefaultCookieOptions(),
    );

    return { accessToken };
  }

  @Public()
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

  @Public()
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

  @Get('sessions')
  @ApiOperation({ summary: 'Get all active sessions' })
  async getSessions(@CurrentUser() user: JwtPayload) {
    return this.authUseCase.getUserSessions(user.id);
  }

  @Delete('sessions/:sessionId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Revoke specific session' })
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.authUseCase.revokeSession(user.id, sessionId);
    return { message: 'Session revoked successfully' };
  }
}
