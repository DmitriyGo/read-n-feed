export class BookFormat {
  private readonly allowedFormats = ['PDF', 'EPUB', 'FB2'];

  private constructor(private readonly format: string) {}

  static create(format: string): BookFormat {
    const upper = format.toUpperCase();
    if (!['PDF', 'EPUB', 'FB2'].includes(upper)) {
      throw new Error(`Unsupported book format: ${format}`);
    }
    return new BookFormat(upper);
  }

  get value(): string {
    return this.format;
  }
}
