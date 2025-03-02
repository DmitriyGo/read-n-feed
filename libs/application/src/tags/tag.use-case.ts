import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Tag, TagProps, ITagRepository } from '@read-n-feed/domain';
import { v4 as uuidv4 } from 'uuid';

import { CreateTagDto, UpdateTagDto } from './tag.dto';

@Injectable()
export class TagUseCase {
  constructor(
    @Inject('ITagRepository')
    private readonly tagRepo: ITagRepository,
  ) {}

  async createTag(dto: CreateTagDto): Promise<Tag> {
    // Check if tag with same label already exists
    const existing = await this.tagRepo.findByLabel(dto.label);
    if (existing) {
      throw new ConflictException(
        `Tag with label "${dto.label}" already exists`,
      );
    }

    const tag = new Tag({
      id: uuidv4(),
      label: dto.label,
    });

    await this.tagRepo.create(tag);
    return tag;
  }

  async updateTag(tagId: string, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.tagRepo.findById(tagId);
    if (!tag) {
      throw new NotFoundException(`Tag with id=${tagId} not found`);
    }

    // If label is being updated, check for uniqueness
    if (dto.label !== tag.label) {
      const existing = await this.tagRepo.findByLabel(dto.label);
      if (existing) {
        throw new ConflictException(
          `Tag with label "${dto.label}" already exists`,
        );
      }
    }

    const updatedProps: TagProps = {
      ...tag.toPrimitives(),
      label: dto.label,
    };

    const updatedTag = new Tag(updatedProps);
    await this.tagRepo.update(updatedTag);
    return updatedTag;
  }

  async getTag(tagId: string): Promise<Tag> {
    const tag = await this.tagRepo.findById(tagId);
    if (!tag) {
      throw new NotFoundException(`Tag with id=${tagId} not found`);
    }
    return tag;
  }

  async getAllTags(): Promise<Tag[]> {
    return this.tagRepo.listAll();
  }

  async deleteTag(tagId: string): Promise<void> {
    const tag = await this.tagRepo.findById(tagId);
    if (!tag) {
      throw new NotFoundException(`Tag with id=${tagId} not found`);
    }

    await this.tagRepo.delete(tagId);
  }

  async findTagByLabel(label: string): Promise<Tag | null> {
    return this.tagRepo.findByLabel(label);
  }
}
