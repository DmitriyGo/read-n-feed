import { Injectable, Logger } from '@nestjs/common';
import { BookImageRequest as BookImageRequestFromDb } from '@prisma/client';
import {
  BookImageRequest,
  BookImageRequestSearchOptions,
  IBookImageRequestRepository,
} from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaBookImageRequestRepository
  implements IBookImageRequestRepository
{
  private readonly logger = new Logger(PrismaBookImageRequestRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(bookImageRequest: BookImageRequest): Promise<void> {
    const props = bookImageRequest.toPrimitives();
    await this.prisma.bookImageRequest.create({
      data: {
        id: props.id,
        bookId: props.bookId,
        userId: props.userId,
        imageUrl: props.imageUrl,
        notes: props.notes,
        status: props.status,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        approvedAt: props.approvedAt,
        rejectedAt: props.rejectedAt,
        approvedBy: props.approvedBy,
        rejectedBy: props.rejectedBy,
        rejectionReason: props.rejectionReason,
        adminNotes: props.adminNotes,
      },
    });
  }

  async update(bookImageRequest: BookImageRequest): Promise<void> {
    const props = bookImageRequest.toPrimitives();
    await this.prisma.bookImageRequest.update({
      where: { id: props.id },
      data: {
        imageUrl: props.imageUrl,
        notes: props.notes,
        status: props.status,
        updatedAt: props.updatedAt,
        approvedAt: props.approvedAt,
        rejectedAt: props.rejectedAt,
        approvedBy: props.approvedBy,
        rejectedBy: props.rejectedBy,
        rejectionReason: props.rejectionReason,
        adminNotes: props.adminNotes,
      },
    });
  }

  async findById(id: string): Promise<BookImageRequest | null> {
    const record = await this.prisma.bookImageRequest.findUnique({
      where: { id },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async search(
    options: BookImageRequestSearchOptions,
  ): Promise<BookImageRequest[]> {
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
      `Searching book image requests with: page=${page}, limit=${limit}, skip=${skip}`,
    );

    const records = await this.prisma.bookImageRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return records.map((record) => this.toDomain(record));
  }

  async count(options: BookImageRequestSearchOptions): Promise<number> {
    const { userId, bookId, status } = options;

    const where: any = {};
    if (userId) where.userId = userId;
    if (bookId) where.bookId = bookId;
    if (status) where.status = status;

    return this.prisma.bookImageRequest.count({ where });
  }

  async findPendingByBook(bookId: string): Promise<BookImageRequest | null> {
    const record = await this.prisma.bookImageRequest.findFirst({
      where: {
        bookId,
        status: 'PENDING',
      },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.bookImageRequest.delete({
      where: { id },
    });
  }

  private toDomain(record: BookImageRequestFromDb): BookImageRequest {
    return new BookImageRequest({
      id: record.id,
      bookId: record.bookId,
      userId: record.userId,
      imageUrl: record.imageUrl,
      notes: record.notes,
      status: record.status as any,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      approvedAt: record.approvedAt,
      rejectedAt: record.rejectedAt,
      approvedBy: record.approvedBy,
      rejectedBy: record.rejectedBy,
      rejectionReason: record.rejectionReason,
      adminNotes: record.adminNotes,
    });
  }
}
