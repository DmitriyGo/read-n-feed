import { BookFileProps } from './book-file.props';

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

  get format() {
    return this.props.format;
  }

  get filePath() {
    return this.props.filePath;
  }

  get fileSize() {
    return this.props.fileSize;
  }

  toPrimitives(): BookFileProps {
    return { ...this.props };
  }
}
