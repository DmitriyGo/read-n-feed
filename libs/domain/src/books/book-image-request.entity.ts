import {
  BookImageRequestProps,
  BookImageRequestStatus,
} from './book-image-request.props';

export class BookImageRequest {
  private props: BookImageRequestProps;

  constructor(props: BookImageRequestProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get bookId(): string {
    return this.props.bookId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get imageUrl(): string | null {
    return this.props.imageUrl;
  }

  get notes(): string | null | undefined {
    return this.props.notes;
  }

  get status(): BookImageRequestStatus {
    return this.props.status;
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

  get rejectionReason(): string | null | undefined {
    return this.props.rejectionReason;
  }

  get adminNotes(): string | null | undefined {
    return this.props.adminNotes;
  }

  setImageUrl(imageUrl: string): void {
    this.props.imageUrl = imageUrl;
    this.props.updatedAt = new Date();
  }

  updateNotes(notes: string): void {
    this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

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

  toPrimitives(): BookImageRequestProps {
    return { ...this.props };
  }
}
