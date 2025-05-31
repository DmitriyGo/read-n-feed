import { BookFileRequest } from './book-file-request.entity';

export interface BookFileRequestSearchOptions {
  userId?: string;
  bookId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface IBookFileRequestRepository {
  create(bookFileRequest: BookFileRequest): Promise<void>;
  update(bookFileRequest: BookFileRequest): Promise<void>;
  findById(id: string): Promise<BookFileRequest | null>;
  search(options: BookFileRequestSearchOptions): Promise<BookFileRequest[]>;
  count(options: BookFileRequestSearchOptions): Promise<number>;
  findPendingByBookAndFormat(
    bookId: string,
    format: string,
  ): Promise<BookFileRequest | null>;
  delete(id: string): Promise<void>;
}
