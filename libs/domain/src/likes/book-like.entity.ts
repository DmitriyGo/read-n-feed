import { BookLikeProps } from './book-like.props';

export class BookLike {
  private props: BookLikeProps;

  constructor(props: BookLikeProps) {
    this.props = props;
  }

  get userId() {
    return this.props.userId;
  }

  get bookId() {
    return this.props.bookId;
  }

  get likedAt() {
    return this.props.likedAt;
  }

  toPrimitives(): BookLikeProps {
    return { ...this.props };
  }
}
