export interface BookProps {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  publicationDate?: Date | null;
  publisher?: string | null;
  averageRating?: number | null;
  totalLikes?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
