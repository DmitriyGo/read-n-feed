export class LibraryEntry {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly bookId: string,
    public status: 'NOT_STARTED' | 'IN_PROGRESS' | 'FINISHED' = 'NOT_STARTED',
    public progress = 0,
    public addedAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  startReading(): void {
    if (this.status === 'FINISHED') {
      throw new Error('Cannot start reading a finished book!');
    }
    this.status = 'IN_PROGRESS';
    this.updatedAt = new Date();
  }

  updateProgress(value: number): void {
    if (this.status !== 'IN_PROGRESS') {
      throw new Error('Cannot update progress if book is not in progress!');
    }
    if (value < 0 || value > 100) {
      throw new Error('Progress must be between 0 and 100 percent.');
    }
    this.progress = value;
    this.updatedAt = new Date();
  }

  finishReading(): void {
    if (this.status !== 'IN_PROGRESS') {
      throw new Error('Must be in progress to finish reading!');
    }
    this.status = 'FINISHED';
    this.progress = 100;
    this.updatedAt = new Date();
  }
}
