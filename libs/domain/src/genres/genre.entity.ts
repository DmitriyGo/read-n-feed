import { GenreProps } from './genre.props';

export class Genre {
  private props: GenreProps;

  constructor(props: GenreProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  toPrimitives(): GenreProps {
    return { ...this.props };
  }
}
