import { ReadingProgress } from './reading-progress.entity';

export interface IReadingProgressRepository {
  upsert(progress: ReadingProgress): Promise<void>;
  find(
    userId: string,
    bookId: string,
    deviceId?: string,
  ): Promise<ReadingProgress | null>;
  findAllForBook(userId: string, bookId: string): Promise<ReadingProgress[]>;
}
