import {
  BookFileRequestProps,
  BookFileRequestStatus,
} from './book-file-request.props';

export class BookFileRequest {
  private props: BookFileRequestProps;

  constructor(props: BookFileRequestProps) {
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

  get fileId(): string | null {
    return this.props.fileId;
  }

  get format(): string {
    return this.props.format;
  }

  get status(): BookFileRequestStatus {
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

  get language(): string | null | undefined {
    return this.props.language;
  }

  associateFile(fileId: string): void {
    this.props.fileId = fileId;
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

  toPrimitives(): BookFileRequestProps {
    return { ...this.props };
  }
}
