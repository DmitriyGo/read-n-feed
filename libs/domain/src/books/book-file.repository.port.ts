import { BookFile } from './book-file.entity';

export interface IBookFileRepository {
  create(file: BookFile): Promise<void>;
  update(file: BookFile): Promise<void>;
  findById(fileId: string): Promise<BookFile | null>;
  findAllByBook(bookId: string): Promise<BookFile[]>;
  findAllByBookRequest(bookRequestId: string): Promise<BookFile[]>;
  delete(fileId: string): Promise<void>;
  findByChecksum(checksum: string): Promise<BookFile[]>;
  associateWithBook(fileIds: string[], bookId: string): Promise<void>;
  findByRequestId(bookRequestId: string): Promise<BookFile[]>;
}
