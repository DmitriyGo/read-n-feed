import { BookFileProps } from './book-file.props';
import { BookFormat } from './book-format.value-object';

type BookFormatString = 'PDF' | 'EPUB' | 'FB2';

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

  toPrimitives(): Omit<BookFileProps, 'format'> & { format: BookFormatString } {
    return {
      ...this.props,
      format: this.props.format.value as BookFormatString,
    };
  }
}
