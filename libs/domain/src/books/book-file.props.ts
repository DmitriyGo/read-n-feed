import { BookFormat } from './book-format.value-object';

export interface BookFileProps {
  id: string;
  bookId?: string | null;
  bookRequestId?: string | null;
  format: BookFormat;
  filePath: string;
  fileSize?: number | null; // in bytes
  createdAt: Date;
  updatedAt?: Date;

  filename?: string | null; // Original filename
  mimeType?: string | null; // MIME type of the file
  metadata?: Record<string, any> | null; // Extended metadata from the file
  isValidated?: boolean; // Flag indicating if the file has been validated
  checksum?: string | null; // File checksum for integrity verification
  language?: string | null; // Language code (e.g., 'en', 'ru')
}
