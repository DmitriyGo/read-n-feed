import { AuthorProps } from './author.props';

export class Author {
  private props: AuthorProps;

  constructor(props: AuthorProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get bio() {
    return this.props.bio;
  }

  updateBio(newBio: string) {
    this.props.bio = newBio;
  }

  toPrimitives(): AuthorProps {
    return { ...this.props };
  }
}
