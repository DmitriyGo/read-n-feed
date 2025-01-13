import { UserLibraryEntry } from './library.entity';

export class LibraryDomainService {
  updateProgress(libraryEntry: UserLibraryEntry, newProgress: number): UserLibraryEntry {
    if (newProgress < 0) throw new Error('Progress cannot be negative');

    libraryEntry.progress = newProgress;
    libraryEntry.updatedAt = new Date();
    return libraryEntry;
  }
}
