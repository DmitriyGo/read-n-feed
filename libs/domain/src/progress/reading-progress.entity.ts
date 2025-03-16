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

  get updatedAt() {
    return this.props.updatedAt;
  }

  get metadata() {
    return this.props.metadata;
  }

  getPageNumber(): number | null {
    return this.props.metadata?.['pageNumber'] || null;
  }

  getTotalPages(): number | null {
    return this.props.metadata?.['totalPages'] || null;
  }

  getPosition(): string | null {
    return this.props.metadata?.['position'] || null;
  }

  setPageNumber(pageNumber: number): void {
    this.updateMetadata({ pageNumber });
  }

  setTotalPages(totalPages: number): void {
    this.updateMetadata({ totalPages });
  }

  setPosition(position: string): void {
    this.updateMetadata({ position });
  }

  updateProgress(newProgress: number) {
    this.props.progress = Math.max(0, Math.min(100, newProgress));
    this.props.updatedAt = new Date();
  }

  updateMetadata(metadata: Record<string, any>) {
    this.props.metadata = {
      ...(this.props.metadata || {}),
      ...metadata,
    };
    this.props.updatedAt = new Date();
  }

  toPrimitives(): ReadingProgressProps {
    return { ...this.props };
  }
}
