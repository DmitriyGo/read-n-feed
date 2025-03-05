import { Injectable } from '@nestjs/common';
import { BookFile as BookFileFromDb } from '@prisma/client';
import { IBookFileRepository, BookFile, BookFormat } from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaBookFileRepository implements IBookFileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(file: BookFile): Promise<void> {
    const data = file.toPrimitives();
    await this.prisma.bookFile.create({
      data: {
        id: data.id,
        bookId: data.bookId,
        format: data.format,
        filePath: data.filePath,
        fileSize: data.fileSize,
        createdAt: data.createdAt,
      },
    });
  }

  async findById(fileId: string): Promise<BookFile | null> {
    const record = await this.prisma.bookFile.findUnique({
      where: { id: fileId },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAllByBook(bookId: string): Promise<BookFile[]> {
    const records = await this.prisma.bookFile.findMany({
      where: { bookId },
    });
    return records.map((r) => this.toDomain(r));
  }

  async delete(fileId: string): Promise<void> {
    await this.prisma.bookFile.delete({ where: { id: fileId } });
  }

  private toDomain(record: BookFileFromDb): BookFile {
    return new BookFile({
      ...record,
      format: BookFormat.create(record.format),
    });
  }
}
