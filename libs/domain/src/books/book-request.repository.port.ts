import { BookRequest } from './book-request.entity';

export interface BookRequestSearchOptions {
  userId?: string;
  status?: string;
  title?: string;
  page?: number;
  limit?: number;
}

export interface IBookRequestRepository {
  create(bookRequest: BookRequest): Promise<void>;
  update(bookRequest: BookRequest): Promise<void>;
  findById(id: string): Promise<BookRequest | null>;
  search(options: BookRequestSearchOptions): Promise<BookRequest[]>;
  count(options: BookRequestSearchOptions): Promise<number>;
  countUserPendingRequests(userId: string): Promise<number>;
  findDuplicateRequest(
    userId: string,
    title: string,
  ): Promise<BookRequest | null>;
}
