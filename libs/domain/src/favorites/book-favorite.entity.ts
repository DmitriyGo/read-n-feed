import { BookFavoriteProps } from './book-favorite.props';

export class BookFavorite {
  private props: BookFavoriteProps;

  constructor(props: BookFavoriteProps) {
    this.props = props;
  }

  get userId() {
    return this.props.userId;
  }

  get bookId() {
    return this.props.bookId;
  }

  get addedAt() {
    return this.props.addedAt;
  }

  toPrimitives(): BookFavoriteProps {
    return { ...this.props };
  }
}
