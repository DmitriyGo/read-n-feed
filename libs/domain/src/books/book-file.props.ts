import { BookFormat } from './book-format.value-object';

export interface BookFileProps {
  id: string;
  bookId: string;
  format: BookFormat;
  filePath: string;
  fileSize?: number | null; // in bytes
  createdAt: Date;

  filename?: string | null; // Original filename
  mimeType?: string | null; // MIME type of the file
  metadata?: Record<string, any> | null; // Extended metadata from the file
  isValidated?: boolean; // Flag indicating if the file has been validated
  checksum?: string | null; // File checksum for integrity verification
}
