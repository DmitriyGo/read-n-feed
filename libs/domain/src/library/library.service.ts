import { LibraryEntry } from './library.entity';

export class LibraryDomainService {
  addBookToLibrary(userId: string, bookId: string, existingEntries: LibraryEntry[]): LibraryEntry {
    const alreadyExists = existingEntries.some((entry) => entry.bookId === bookId && entry.userId === userId);
    if (alreadyExists) {
      throw new Error('Book is already in the user library.');
    }

    return new LibraryEntry(/* id */ crypto.randomUUID(), userId, bookId);
  }
}
