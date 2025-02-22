import { BookFormat } from './book-format.value-object';

export interface BookFileProps {
  id: string;
  bookId: string;
  format: BookFormat;
  filePath: string;
  fileSize?: number | null; // in bytes
  createdAt: Date;
}
