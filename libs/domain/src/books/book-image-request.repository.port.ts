import { BookImageRequest } from './book-image-request.entity';

export interface BookImageRequestSearchOptions {
  userId?: string;
  bookId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface IBookImageRequestRepository {
  create(bookImageRequest: BookImageRequest): Promise<void>;
  update(bookImageRequest: BookImageRequest): Promise<void>;
  findById(id: string): Promise<BookImageRequest | null>;
  search(options: BookImageRequestSearchOptions): Promise<BookImageRequest[]>;
  count(options: BookImageRequestSearchOptions): Promise<number>;
  findPendingByBook(bookId: string): Promise<BookImageRequest | null>;
  delete(id: string): Promise<void>;
}
