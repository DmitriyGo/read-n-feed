import { Injectable, Logger } from '@nestjs/common';
import { BookFileRequest as BookFileRequestFromDb } from '@prisma/client';
import {
  BookFileRequest,
  BookFileRequestSearchOptions,
  IBookFileRequestRepository,
} from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaBookFileRequestRepository
  implements IBookFileRequestRepository
{
  private readonly logger = new Logger(PrismaBookFileRequestRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(bookFileRequest: BookFileRequest): Promise<void> {
    const props = bookFileRequest.toPrimitives();
    await this.prisma.bookFileRequest.create({
      data: {
        id: props.id,
        bookId: props.bookId,
        userId: props.userId,
        fileId: props.fileId,
        format: props.format,
        status: props.status,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        approvedAt: props.approvedAt,
        rejectedAt: props.rejectedAt,
        approvedBy: props.approvedBy,
        rejectedBy: props.rejectedBy,
        rejectionReason: props.rejectionReason,
        adminNotes: props.adminNotes,
        language: props.language,
      },
    });
  }

  async update(bookFileRequest: BookFileRequest): Promise<void> {
    const props = bookFileRequest.toPrimitives();
    await this.prisma.bookFileRequest.update({
      where: { id: props.id },
      data: {
        bookId: props.bookId,
        userId: props.userId,
        fileId: props.fileId,
        format: props.format,
        status: props.status,
        updatedAt: props.updatedAt,
        approvedAt: props.approvedAt,
        rejectedAt: props.rejectedAt,
        approvedBy: props.approvedBy,
        rejectedBy: props.rejectedBy,
        rejectionReason: props.rejectionReason,
        adminNotes: props.adminNotes,
        language: props.language,
      },
    });
  }

  async findById(id: string): Promise<BookFileRequest | null> {
    const record = await this.prisma.bookFileRequest.findUnique({
      where: { id },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async search(
    options: BookFileRequestSearchOptions,
  ): Promise<BookFileRequest[]> {
    const { userId, bookId, status } = options;

    // Ensure page and limit are valid numbers
    const page =
      typeof options.page === 'number' &&
      !isNaN(options.page) &&
      options.page > 0
        ? options.page
        : 1;

    const limit =
      typeof options.limit === 'number' &&
      !isNaN(options.limit) &&
      options.limit > 0
        ? options.limit
        : 10;

    const where: any = {};
    if (userId) where.userId = userId;
    if (bookId) where.bookId = bookId;
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    this.logger.debug(
      `Searching book file requests with: page=${page}, limit=${limit}, skip=${skip}`,
    );

    const records = await this.prisma.bookFileRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return records.map((record) => this.toDomain(record));
  }

  async count(options: BookFileRequestSearchOptions): Promise<number> {
    const { userId, bookId, status } = options;

    const where: any = {};
    if (userId) where.userId = userId;
    if (bookId) where.bookId = bookId;
    if (status) where.status = status;

    return this.prisma.bookFileRequest.count({ where });
  }

  async findPendingByBookAndFormat(
    bookId: string,
    format: string,
  ): Promise<BookFileRequest | null> {
    const record = await this.prisma.bookFileRequest.findFirst({
      where: {
        bookId,
        format,
        status: 'PENDING',
      },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.bookFileRequest.delete({
      where: { id },
    });
  }

  private toDomain(record: BookFileRequestFromDb): BookFileRequest {
    return new BookFileRequest({
      id: record.id,
      bookId: record.bookId,
      userId: record.userId,
      fileId: record.fileId,
      format: record.format,
      status: record.status as any,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      approvedAt: record.approvedAt,
      rejectedAt: record.rejectedAt,
      approvedBy: record.approvedBy,
      rejectedBy: record.rejectedBy,
      rejectionReason: record.rejectionReason,
      adminNotes: record.adminNotes,
      language: record.language,
    });
  }
}
