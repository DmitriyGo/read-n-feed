export class Book {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly author: string,
    public readonly description?: string,
    public readonly genres: string[] = [],
    public readonly formats: string[] = [],
    public readonly coverUrl?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
