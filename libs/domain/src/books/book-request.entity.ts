// libs/domain/src/books/book-request.entity.ts
import { BookRequestProps, BookRequestStatus } from './book-request.props';

export class BookRequest {
  private props: BookRequestProps;

  constructor(props: BookRequestProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get coverImageUrl(): string | null | undefined {
    return this.props.coverImageUrl;
  }

  get publicationDate(): Date | null | undefined {
    return this.props.publicationDate;
  }

  get publisher(): string | null | undefined {
    return this.props.publisher;
  }

  get authorNames(): string[] | null | undefined {
    return this.props.authorNames;
  }

  get genreNames(): string[] | null | undefined {
    return this.props.genreNames;
  }

  get tagLabels(): string[] | null | undefined {
    return this.props.tagLabels;
  }

  get status(): BookRequestStatus {
    return this.props.status;
  }

  get adminNotes(): string | null | undefined {
    return this.props.adminNotes;
  }

  get rejectionReason(): string | null | undefined {
    return this.props.rejectionReason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get approvedAt(): Date | null | undefined {
    return this.props.approvedAt;
  }

  get rejectedAt(): Date | null | undefined {
    return this.props.rejectedAt;
  }

  get approvedBy(): string | null | undefined {
    return this.props.approvedBy;
  }

  get rejectedBy(): string | null | undefined {
    return this.props.rejectedBy;
  }

  get resultingBookId(): string | null | undefined {
    return this.props.resultingBookId;
  }

  // Status change methods
  approve(adminId: string): void {
    this.props.status = 'APPROVED';
    this.props.approvedAt = new Date();
    this.props.approvedBy = adminId;
    this.props.updatedAt = new Date();
  }

  reject(adminId: string, reason?: string): void {
    this.props.status = 'REJECTED';
    this.props.rejectedAt = new Date();
    this.props.rejectedBy = adminId;
    this.props.rejectionReason = reason || null;
    this.props.updatedAt = new Date();
  }

  updateAdminNotes(notes: string): void {
    this.props.adminNotes = notes;
    this.props.updatedAt = new Date();
  }

  update(partial: Partial<BookRequestProps>): void {
    this.props = {
      ...this.props,
      ...partial,
      updatedAt: new Date(),
    };
  }

  toPrimitives(): BookRequestProps {
    return { ...this.props };
  }
}
