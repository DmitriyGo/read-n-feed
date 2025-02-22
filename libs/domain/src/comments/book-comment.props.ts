export interface BookCommentProps {
  id: string;
  bookId: string;
  userId: string;
  content: string;
  parentCommentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
