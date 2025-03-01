import { TagProps } from './tag.props';

export class Tag {
  private props: TagProps;

  constructor(props: TagProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get label() {
    return this.props.label;
  }

  updateLabel(newLabel: string) {
    this.props.label = newLabel;
  }

  toPrimitives(): TagProps {
    return { ...this.props };
  }
}
