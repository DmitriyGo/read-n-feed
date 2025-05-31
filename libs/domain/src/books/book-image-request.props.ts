export type BookImageRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BookImageRequestProps {
  id: string;
  bookId: string;
  userId: string;
  imageUrl: string | null;
  notes?: string | null;
  status: BookImageRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date | null;
  rejectedAt?: Date | null;
  approvedBy?: string | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
  adminNotes?: string | null;
}
