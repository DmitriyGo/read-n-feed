import { Injectable } from '@nestjs/common';
import { ReadingProgress as ProgressFromDb } from '@prisma/client';
import {
  IReadingProgressRepository,
  ReadingProgress,
} from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaReadingProgressRepository
  implements IReadingProgressRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async upsert(progress: ReadingProgress): Promise<void> {
    const props = progress.toPrimitives();

    await this.prisma.readingProgress.upsert({
      where: {
        userId_bookId_deviceId: {
          userId: props.userId,
          bookId: props.bookId,
          deviceId: props.deviceId || '',
        },
      },
      update: {
        progress: props.progress,
        updatedAt: props.updatedAt,
        metadata: props.metadata
          ? JSON.parse(JSON.stringify(props.metadata))
          : null,
      },
      create: {
        id: props.id,
        userId: props.userId,
        bookId: props.bookId,
        progress: props.progress,
        deviceId: props.deviceId || '',
        updatedAt: props.updatedAt,
        metadata: props.metadata
          ? JSON.parse(JSON.stringify(props.metadata))
          : null,
      },
    });
  }

  async find(
    userId: string,
    bookId: string,
    deviceId?: string | null,
  ): Promise<ReadingProgress | null> {
    const record = await this.prisma.readingProgress.findUnique({
      where: {
        userId_bookId_deviceId: {
          userId,
          bookId,
          deviceId: deviceId || '',
        },
      },
    });

    if (!record) return null;
    return this.toDomain(record);
  }

  async findAllForBook(
    userId: string,
    bookId: string,
  ): Promise<ReadingProgress[]> {
    const records = await this.prisma.readingProgress.findMany({
      where: { userId, bookId },
      orderBy: { updatedAt: 'desc' },
    });

    return records.map((r) => this.toDomain(r));
  }

  async findAllBooksByUser(userId: string): Promise<string[]> {
    // Get all unique bookIds that the user has progress for
    const records = await this.prisma.readingProgress.findMany({
      where: { userId },
      select: { bookId: true },
      distinct: ['bookId'],
    });

    return records.map((r) => r.bookId);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.readingProgress.delete({
      where: { id },
    });
  }

  private toDomain(record: ProgressFromDb): ReadingProgress {
    return new ReadingProgress({
      id: record.id,
      userId: record.userId,
      bookId: record.bookId,
      progress: record.progress,
      deviceId: record.deviceId === '' ? null : record.deviceId,
      updatedAt: record.updatedAt,
      metadata: record.metadata
        ? (record.metadata as Record<string, any>)
        : null,
    });
  }
}
