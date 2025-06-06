import { Injectable } from '@nestjs/common';
import { Tag as TagFromDb } from '@prisma/client';
import { ITagRepository, Tag } from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTagRepository implements ITagRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(tag: Tag): Promise<void> {
    const props = tag.toPrimitives();
    await this.prisma.tag.create({ data: { ...props } });
  }

  async update(tag: Tag): Promise<void> {
    const props = tag.toPrimitives();
    await this.prisma.tag.update({
      where: { id: props.id },
      data: { ...props },
    });
  }

  async delete(id: string): Promise<void> {
    // First, delete all book-tag associations
    await this.prisma.bookTag.deleteMany({
      where: { tagId: id },
    });

    // Then delete the tag
    await this.prisma.tag.delete({
      where: { id },
    });
  }

  async findById(id: string): Promise<Tag | null> {
    const record = await this.prisma.tag.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByLabel(label: string): Promise<Tag | null> {
    const record = await this.prisma.tag.findUnique({
      where: { label },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async listAll(): Promise<Tag[]> {
    const records = await this.prisma.tag.findMany({
      orderBy: { label: 'asc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: TagFromDb): Tag {
    return new Tag({
      id: record.id,
      label: record.label,
    });
  }
}
