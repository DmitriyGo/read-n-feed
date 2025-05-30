import { Controller, Get, Patch, Post, Param, Body, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  toUserResponseDto,
  UpdateUserProfileDto,
  UserResponseDto,
  UserUseCase,
} from '@read-n-feed/application';
import { Request } from 'express';

import { AdminOnly } from '../auth/guards/roles.decorator';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  @ApiOkResponse({ type: UserResponseDto })
  async getMyProfile(@Req() req: Request): Promise<UserResponseDto> {
    const userId = req.user['id'];
    const user = await this.userUseCase.getUserProfile(userId);
    return toUserResponseDto(user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  @ApiOkResponse({ type: UserResponseDto })
  async updateMyProfile(
    @Req() req: Request,
    @Body() dto: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    const userId = req.user['id'];
    const updated = await this.userUseCase.updateUserProfile(userId, dto);
    return toUserResponseDto(updated);
  }

  @AdminOnly()
  @Post(':id/block')
  @ApiOperation({ summary: 'Block a user (admin-only)' })
  @ApiOkResponse({ type: UserResponseDto })
  async blockUser(@Param('id') userId: string): Promise<UserResponseDto> {
    const user = await this.userUseCase.blockUser(userId);
    return toUserResponseDto(user);
  }

  @AdminOnly()
  @Post(':id/unblock')
  @ApiOperation({ summary: 'Unblock a user (admin-only)' })
  @ApiOkResponse({ type: UserResponseDto })
  async unblockUser(@Param('id') userId: string): Promise<UserResponseDto> {
    const user = await this.userUseCase.unblockUser(userId);
    return toUserResponseDto(user);
  }

  @Patch('me/avatar')
  @ApiOperation({ summary: 'Update my avatar' })
  @ApiOkResponse({ type: UserResponseDto })
  async updateMyAvatar(
    @Req() req: Request,
    @Body('avatarUrl') avatarUrl: string,
  ): Promise<UserResponseDto> {
    const userId = req.user['id'];
    const updated = await this.userUseCase.updateUserProfile(userId, { avatarUrl });
    return toUserResponseDto(updated);
  }
}
