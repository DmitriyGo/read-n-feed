import { ReadingProgressProps } from './reading-progress.props';

export class ReadingProgress {
  private props: ReadingProgressProps;

  constructor(props: ReadingProgressProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get userId() {
    return this.props.userId;
  }

  get bookId() {
    return this.props.bookId;
  }

  get progress() {
    return this.props.progress;
  }

  get deviceId() {
    return this.props.deviceId;
  }

  updateProgress(newProgress: number) {
    this.props.progress = Math.max(0, Math.min(100, newProgress));
    this.props.updatedAt = new Date();
  }

  toPrimitives(): ReadingProgressProps {
    return { ...this.props };
  }
}
