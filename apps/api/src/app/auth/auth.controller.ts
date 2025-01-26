import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { AuthUseCase, LoginDto, RegisterDto } from '@read-n-feed/application';
import { AuthCookieOptionsService } from '@read-n-feed/infrastructure';
import { Request, Response } from 'express';

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
  @ApiOperation({ summary: 'Login user' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const { accessToken, refreshToken } = await this.authUseCase.login(
      dto,
      userAgent,
    );

    res.cookie(
      'refreshToken',
      refreshToken,
      this.authCookieOptions.getDefaultCookieOptions(),
    );

    return res.status(HttpStatus.OK).json({ accessToken });
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiHeader({
    name: 'x-refresh-token',
    description:
      'Refresh token for DEV only. In production, use HTTP-only cookies.',
    required: false,
  })
  async refresh(@Req() req: Request, @Res() res: Response) {
    let refreshToken: string | undefined = req.cookies?.refreshToken;
    if (this.authCookieOptions.isDevelopment && !refreshToken) {
      refreshToken = req.headers['x-refresh-token'] as string;
    }

    const userAgent = req.headers['user-agent'] || 'unknown';

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authUseCase.refreshTokens(refreshToken, userAgent);

    res.cookie(
      'refreshToken',
      newRefreshToken,
      this.authCookieOptions.getDefaultCookieOptions(),
    );

    return res.status(HttpStatus.OK).json({ accessToken });
  }

  @Get('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Req() req: Request, @Res() res: Response) {
    let refreshToken: string | undefined = req.cookies?.refreshToken;
    if (this.authCookieOptions.isDevelopment && !refreshToken) {
      refreshToken = req.headers['x-refresh-token'] as string;
    }

    if (refreshToken) {
      await this.authUseCase.logout(refreshToken);
    }

    res.clearCookie(
      'refreshToken',
      this.authCookieOptions.getDefaultCookieOptions(),
    );
    return res.status(HttpStatus.OK).send({ success: true });
  }
}
