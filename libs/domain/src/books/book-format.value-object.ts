export class BookFormat {
  private static readonly allowedFormats = [
    'PDF',
    'EPUB',
    'FB2',
    'MOBI',
    'AZW3',
  ];

  private constructor(private readonly format: string) {}

  static create(format: string): BookFormat {
    const upper = format.toUpperCase();
    if (!BookFormat.allowedFormats.includes(upper)) {
      throw new Error(`Unsupported book format: ${format}`);
    }
    return new BookFormat(upper);
  }

  get value(): string {
    return this.format;
  }

  isViewableInBrowser(): boolean {
    return ['PDF', 'EPUB'].includes(this.format);
  }
}
