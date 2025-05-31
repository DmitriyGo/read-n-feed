import { Injectable, Logger } from '@nestjs/common';
import { BookRequest as BookRequestFromDb } from '@prisma/client';
import {
  BookRequest,
  BookRequestSearchOptions,
  IBookRequestRepository,
} from '@read-n-feed/domain';

import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaBookRequestRepository implements IBookRequestRepository {
  private readonly logger = new Logger(PrismaBookRequestRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(bookRequest: BookRequest): Promise<void> {
    const props = bookRequest.toPrimitives();
    await this.prisma.bookRequest.create({
      data: {
        id: props.id,
        userId: props.userId,
        title: props.title,
        description: props.description,
        coverImageUrl: props.coverImageUrl,
        publicationDate: props.publicationDate,
        publisher: props.publisher,
        authorNames: props.authorNames
          ? JSON.parse(JSON.stringify(props.authorNames))
          : null,
        genreNames: props.genreNames
          ? JSON.parse(JSON.stringify(props.genreNames))
          : null,
        tagLabels: props.tagLabels
          ? JSON.parse(JSON.stringify(props.tagLabels))
          : null,
        status: props.status,
        adminNotes: props.adminNotes,
        rejectionReason: props.rejectionReason,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        approvedAt: props.approvedAt,
        rejectedAt: props.rejectedAt,
        approvedBy: props.approvedBy,
        rejectedBy: props.rejectedBy,
        resultingBookId: props.resultingBookId,
      },
    });
  }

  async update(bookRequest: BookRequest): Promise<void> {
    const props = bookRequest.toPrimitives();
    await this.prisma.bookRequest.update({
      where: { id: props.id },
      data: {
        title: props.title,
        description: props.description,
        coverImageUrl: props.coverImageUrl,
        publicationDate: props.publicationDate,
        publisher: props.publisher,
        authorNames: props.authorNames
          ? JSON.parse(JSON.stringify(props.authorNames))
          : null,
        genreNames: props.genreNames
          ? JSON.parse(JSON.stringify(props.genreNames))
          : null,
        tagLabels: props.tagLabels
          ? JSON.parse(JSON.stringify(props.tagLabels))
          : null,
        status: props.status,
        adminNotes: props.adminNotes,
        rejectionReason: props.rejectionReason,
        updatedAt: props.updatedAt,
        approvedAt: props.approvedAt,
        rejectedAt: props.rejectedAt,
        approvedBy: props.approvedBy,
        rejectedBy: props.rejectedBy,
        resultingBookId: props.resultingBookId,
      },
    });
  }

  async findById(id: string): Promise<BookRequest | null> {
    const record = await this.prisma.bookRequest.findUnique({
      where: { id },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async search(options: BookRequestSearchOptions): Promise<BookRequest[]> {
    const { userId, status, title } = options;

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
    if (status) where.status = status;
    if (title) where.title = { contains: title, mode: 'insensitive' };

    const skip = (page - 1) * limit;

    this.logger.debug(
      `Searching book requests with: page=${page}, limit=${limit}, skip=${skip}`,
    );

    const records = await this.prisma.bookRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit, // Ensure this is always a number
    });

    return records.map((record) => this.toDomain(record));
  }

  async count(options: BookRequestSearchOptions): Promise<number> {
    const { userId, status, title } = options;

    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (title) where.title = { contains: title, mode: 'insensitive' };

    return this.prisma.bookRequest.count({ where });
  }

  async countUserPendingRequests(userId: string): Promise<number> {
    return this.prisma.bookRequest.count({
      where: {
        userId,
        status: 'PENDING',
      },
    });
  }

  async findDuplicateRequest(
    userId: string,
    title: string,
  ): Promise<BookRequest | null> {
    const record = await this.prisma.bookRequest.findFirst({
      where: {
        userId,
        title: { equals: title, mode: 'insensitive' },
        status: 'PENDING',
      },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.bookRequest.delete({
      where: { id },
    });
  }

  private toDomain(record: BookRequestFromDb): BookRequest {
    return new BookRequest({
      id: record.id,
      userId: record.userId,
      title: record.title,
      description: record.description,
      coverImageUrl: record.coverImageUrl,
      publicationDate: record.publicationDate,
      publisher: record.publisher,
      authorNames: (record.authorNames as string[]) || null,
      genreNames: (record.genreNames as string[]) || null,
      tagLabels: (record.tagLabels as string[]) || null,
      status: record.status as any,
      adminNotes: record.adminNotes,
      rejectionReason: record.rejectionReason,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      approvedAt: record.approvedAt,
      rejectedAt: record.rejectedAt,
      approvedBy: record.approvedBy,
      rejectedBy: record.rejectedBy,
      resultingBookId: record.resultingBookId,
    });
  }
}
