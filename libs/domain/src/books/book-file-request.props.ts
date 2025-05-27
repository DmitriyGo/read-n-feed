export type BookFileRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BookFileRequestProps {
  id: string;
  bookId: string;
  userId: string;
  fileId: string | null;
  format: string;
  status: BookFileRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
  approvedBy?: string | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;
  language?: string | null;
}
