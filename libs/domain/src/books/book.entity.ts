import { BookProps } from './book.props';

export class Book {
  private props: BookProps;

  constructor(props: BookProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get coverImageUrl() {
    return this.props.coverImageUrl;
  }

  get publicationDate() {
    return this.props.publicationDate;
  }

  get publisher() {
    return this.props.publisher;
  }

  get language() {
    return this.props.language;
  }

  get averageRating() {
    return this.props.averageRating;
  }

  get totalLikes() {
    return this.props.totalLikes;
  }

  get ageRestriction() {
    return this.props.ageRestriction;
  }

  updateTitle(newTitle: string) {
    this.props.title = newTitle.trim();
    this.props.updatedAt = new Date();
  }

  addLike() {
    if (this.props.totalLikes == null) {
      this.props.totalLikes = 0;
    }
    this.props.totalLikes++;
    this.props.updatedAt = new Date();
  }

  removeLike() {
    if (this.props.totalLikes && this.props.totalLikes > 0) {
      this.props.totalLikes--;
      this.props.updatedAt = new Date();
    }
  }

  updateRating(newRating: number) {
    this.props.averageRating = newRating;
    this.props.updatedAt = new Date();
  }

  update(props: Partial<Omit<BookProps, 'id' | 'createdAt'>>) {
    Object.assign(this.props, props);
    this.props.updatedAt = new Date();
  }

  toPrimitives(): BookProps {
    return { ...this.props };
  }
}
