import { BookFile } from './book-file.entity';

export interface IBookFileRepository {
  create(file: BookFile): Promise<void>;
  findById(fileId: string): Promise<BookFile | null>;
  findAllByBook(bookId: string): Promise<BookFile[]>;
  delete(fileId: string): Promise<void>;
}
