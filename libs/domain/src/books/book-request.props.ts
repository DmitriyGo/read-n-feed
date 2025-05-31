export type BookRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BookRequestProps {
  id: string;
  userId: string;

  // Book details
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  publicationDate?: Date | null;
  publisher?: string | null;
  language?: string | null;

  // Additional request-specific fields
  authorNames?: string[] | null;
  genreNames?: string[] | null;
  tagLabels?: string[] | null;

  // Request metadata
  status: BookRequestStatus;
  adminNotes?: string | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
  approvedBy?: string | null;
  rejectedBy?: string | null;
  resultingBookId?: string | null;
}
