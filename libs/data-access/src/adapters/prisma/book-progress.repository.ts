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
          deviceId: props.deviceId ?? '',
        },
      },
      update: { ...props },
      create: { ...props },
    });
  }

  async find(
    userId: string,
    bookId: string,
    deviceId?: string,
  ): Promise<ReadingProgress | null> {
    const record = await this.prisma.readingProgress.findUnique({
      where: {
        userId_bookId_deviceId: {
          userId,
          bookId,
          deviceId: deviceId ?? '',
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
    });
    return records.map((r) => this.toDomain(r));
  }

  private toDomain(record: ProgressFromDb): ReadingProgress {
    return new ReadingProgress({ ...record });
  }
}
