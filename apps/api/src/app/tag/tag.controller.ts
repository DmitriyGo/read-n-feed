import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  TagResponseDto,
  CreateTagDto,
  UpdateTagDto,
  toTagResponseDto,
  TagUseCase,
} from '@read-n-feed/application';

import { AdminOnly } from '../auth/guards/roles.decorator';

@ApiBearerAuth()
@ApiTags('tags')
@Controller('tags')
export class TagController {
  constructor(private readonly tagUseCase: TagUseCase) {}

  @Post()
  @AdminOnly()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiBody({ type: CreateTagDto })
  @ApiCreatedResponse({
    description: 'Tag successfully created',
    type: TagResponseDto,
  })
  async createTag(@Body() dto: CreateTagDto): Promise<TagResponseDto> {
    const tag = await this.tagUseCase.createTag(dto);
    return toTagResponseDto(tag);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the tag',
    type: TagResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  async getTag(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TagResponseDto> {
    const tag = await this.tagUseCase.getTag(id);
    return toTagResponseDto(tag);
  }

  @Put(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Update tag by ID' })
  @ApiBody({ type: UpdateTagDto })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated tag',
    type: TagResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  async updateTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTagDto,
  ): Promise<TagResponseDto> {
    const updated = await this.tagUseCase.updateTag(id, dto);
    return toTagResponseDto(updated);
  }

  @Delete(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Delete tag by ID' })
  @ApiResponse({ status: 204, description: 'Tag deleted successfully' })
  @ApiNotFoundResponse({ description: 'Tag not found' })
  async deleteTag(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.tagUseCase.deleteTag(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({
    status: 200,
    description: 'Returns all tags',
    type: [TagResponseDto],
  })
  async getAllTags(): Promise<TagResponseDto[]> {
    const tags = await this.tagUseCase.getAllTags();
    return tags.map((tag) => toTagResponseDto(tag));
  }
}
