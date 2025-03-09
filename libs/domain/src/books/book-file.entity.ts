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

  toPrimitives(): Omit<BookFileProps, 'format'> & { format: BookFormatString } {
    return {
      ...this.props,
      format: this.props.format.value as BookFormatString,
    };
  }
}
