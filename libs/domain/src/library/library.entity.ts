export class UserLibraryEntry {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bookId: string,
    public status: 'not_started' | 'in_progress' | 'finished' = 'not_started',
    public progress = 0,
    public readonly addedAt?: Date,
    public updatedAt?: Date,
  ) {}
}
