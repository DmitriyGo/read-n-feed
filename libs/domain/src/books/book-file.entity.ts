import { BookFileProps } from './book-file.props';
import { BookFormat } from './book-format.value-object';

type BookFormatString = 'PDF' | 'EPUB' | 'FB2' | 'MOBI' | 'AZW3';

export class BookFile {
  private props: BookFileProps;

  constructor(props: BookFileProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get bookId() {
    return this.props.bookId;
  }

  get bookRequestId() {
    return this.props.bookRequestId;
  }

  get format(): BookFormat {
    return this.props.format;
  }

  get filePath() {
    return this.props.filePath;
  }

  get fileSize() {
    return this.props.fileSize;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get filename() {
    return this.props.filename;
  }

  get mimeType() {
    return this.props.mimeType;
  }

  get metadata() {
    return this.props.metadata;
  }

  get isValidated() {
    return this.props.isValidated ?? false;
  }

  get checksum() {
    return this.props.checksum;
  }

  // Methods to update the entity

  setMetadata(metadata: Record<string, any>) {
    this.props.metadata = metadata;
  }

  setValidationStatus(isValid: boolean) {
    this.props.isValidated = isValid;
  }

  setChecksum(checksum: string) {
    this.props.checksum = checksum;
  }

  associateWithBook(bookId: string) {
    this.props.bookId = bookId;
    this.props.bookRequestId = null;
  }

  associateWithBookRequest(bookRequestId: string) {
    this.props.bookRequestId = bookRequestId;
    this.props.bookId = null;
  }

  toPrimitives(): Omit<BookFileProps, 'format'> & { format: BookFormatString } {
    return {
      ...this.props,
      format: this.props.format.value as BookFormatString,
    };
  }

  public update(props: Partial<Omit<BookFileProps, 'id' | 'createdAt'>>): void {
    if (props.bookId !== undefined) {
      this.props.bookId = props.bookId;
    }
    if (props.bookRequestId !== undefined) {
      this.props.bookRequestId = props.bookRequestId;
    }
    if (props.format !== undefined) {
      this.props.format = props.format;
    }
    if (props.filePath !== undefined) {
      this.props.filePath = props.filePath;
    }
    if (props.fileSize !== undefined) {
      this.props.fileSize = props.fileSize;
    }
    if (props.filename !== undefined) {
      this.props.filename = props.filename;
    }
    if (props.mimeType !== undefined) {
      this.props.mimeType = props.mimeType;
    }
    if (props.metadata !== undefined) {
      this.props.metadata = props.metadata;
    }
    if (props.isValidated !== undefined) {
      this.props.isValidated = props.isValidated;
    }
    if (props.checksum !== undefined) {
      this.props.checksum = props.checksum;
    }
    this.props.updatedAt = new Date();
  }
}
