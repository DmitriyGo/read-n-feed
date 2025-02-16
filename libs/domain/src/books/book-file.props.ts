import { BookFormat } from './book-format.value-object';

export interface BookFileProps {
  id: string;
  bookId: string;
  format: BookFormat;
  filePath: string;
  fileSize?: number; // in bytes
  createdAt: Date;
}
