export interface ReadingProgressProps {
  id: string;
  userId: string;
  bookId: string;
  progress: number; // 0..100
  deviceId?: string | null;
  updatedAt: Date;
  metadata?: Record<string, any> | null;
}
