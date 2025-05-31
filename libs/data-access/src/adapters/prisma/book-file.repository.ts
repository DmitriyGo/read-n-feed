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
        bookRequestId: data.bookRequestId,
        format: data.format,
        filePath: data.filePath,
        fileSize: data.fileSize,
        createdAt: data.createdAt,
        // New fields
        filename: data.filename,
        mimeType: data.mimeType,
        metadata: data.metadata
          ? JSON.parse(JSON.stringify(data.metadata))
          : null,
        isValidated: data.isValidated,
        checksum: data.checksum,
        language: data.language,
      },
    });
  }

  async update(file: BookFile): Promise<void> {
    const data = file.toPrimitives();
    await this.prisma.bookFile.update({
      where: { id: data.id },
      data: {
        bookId: data.bookId,
        bookRequestId: data.bookRequestId,
        format: data.format,
        filePath: data.filePath,
        fileSize: data.fileSize,
        // New fields
        filename: data.filename,
        mimeType: data.mimeType,
        metadata: data.metadata
          ? JSON.parse(JSON.stringify(data.metadata))
          : null,
        isValidated: data.isValidated,
        checksum: data.checksum,
        language: data.language,
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

  async findAllByBookRequest(bookRequestId: string): Promise<BookFile[]> {
    const records = await this.prisma.bookFile.findMany({
      where: { bookRequestId },
    });
    return records.map((r) => this.toDomain(r));
  }

  async delete(fileId: string): Promise<void> {
    await this.prisma.bookFile.delete({ where: { id: fileId } });
  }

  async findByChecksum(checksum: string): Promise<BookFile[]> {
    const records = await this.prisma.bookFile.findMany({
      where: { checksum },
    });
    return records.map((r) => this.toDomain(r));
  }

  async associateWithBook(fileIds: string[], bookId: string): Promise<void> {
    await this.prisma.bookFile.updateMany({
      where: { id: { in: fileIds } },
      data: {
        bookId: bookId,
        bookRequestId: null,
      },
    });
  }

  async findByBookId(bookId: string): Promise<BookFile[]> {
    const records = await this.prisma.bookFile.findMany({
      where: { bookId },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findByRequestId(bookRequestId: string): Promise<BookFile[]> {
    const bookFiles = await this.prisma.bookFile.findMany({
      where: {
        bookRequestId,
      },
    });

    return bookFiles.map((file) => this.toDomain(file));
  }

  private toDomain(record: BookFileFromDb): BookFile {
    return new BookFile({
      ...record,
      format: BookFormat.create(record.format),
      metadata: record.metadata
        ? (record.metadata as Record<string, any>)
        : null,
      language: record.language,
    });
  }
}
