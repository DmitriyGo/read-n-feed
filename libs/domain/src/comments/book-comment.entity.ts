import { BookCommentProps } from './book-comment.props';

export class BookComment {
  private props: BookCommentProps;

  constructor(props: BookCommentProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get bookId() {
    return this.props.bookId;
  }

  get userId() {
    return this.props.userId;
  }

  get content() {
    return this.props.content;
  }

  get parentCommentId() {
    return this.props.parentCommentId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  updateContent(newContent: string) {
    this.props.content = newContent;
    this.props.updatedAt = new Date();
  }

  toPrimitives(): BookCommentProps {
    return { ...this.props };
  }
}
