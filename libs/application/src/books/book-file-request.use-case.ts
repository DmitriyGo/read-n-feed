import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  BookFile,
  IBookFileRepository,
  IBookRequestRepository,
} from '@read-n-feed/domain';

@Injectable()
export class BookFileRequestUseCase {
  private readonly logger = new Logger(BookFileRequestUseCase.name);

  constructor(
    @Inject('IBookFileRepository')
    private readonly bookFileRepo: IBookFileRepository,
    @Inject('IBookRequestRepository')
    private readonly bookRequestRepo: IBookRequestRepository,
  ) {}

  /**
   * Attaches a file to a book request
   */
  async attachFileToRequest(
    requestId: string,
    fileId: string,
    userId: string,
  ): Promise<void> {
    const bookRequest = await this.bookRequestRepo.findById(requestId);
    if (!bookRequest) {
      throw new NotFoundException(
        `Book request with id=${requestId} not found`,
      );
    }

    // Only the user who created the request or admins can attach files
    if (bookRequest.userId !== userId) {
      throw new UnauthorizedException(
        'You can only attach files to your own requests',
      );
    }

    const bookFile = await this.bookFileRepo.findById(fileId);
    if (!bookFile) {
      throw new NotFoundException(`Book file with id=${fileId} not found`);
    }

    // If the file is already associated with this request, do nothing
    if (bookFile.bookRequestId === requestId) {
      return;
    }

    // If the file is associated with another request, throw an error
    if (bookFile.bookRequestId && bookFile.bookRequestId !== requestId) {
      throw new BadRequestException(
        `File with id=${fileId} is already associated with another book request`,
      );
    }

    // Update the file to associate it with the request
    bookFile.update({
      bookRequestId: requestId,
    });

    await this.bookFileRepo.update(bookFile);
  }

  /**
   * Detaches a file from a book request
   */
  async detachFileFromRequest(
    requestId: string,
    fileId: string,
    userId: string,
  ): Promise<void> {
    const bookRequest = await this.bookRequestRepo.findById(requestId);
    if (!bookRequest) {
      throw new NotFoundException(
        `Book request with id=${requestId} not found`,
      );
    }

    // Only the user who created the request or admins can detach files
    if (bookRequest.userId !== userId) {
      throw new UnauthorizedException(
        'You can only detach files from your own requests',
      );
    }

    const bookFile = await this.bookFileRepo.findById(fileId);
    if (!bookFile) {
      throw new NotFoundException(`Book file with id=${fileId} not found`);
    }

    // If the file is not associated with this request, throw an error
    if (bookFile.bookRequestId !== requestId) {
      throw new BadRequestException(
        `File with id=${fileId} is not associated with book request with id=${requestId}`,
      );
    }

    // Update the file to disassociate it from the request
    bookFile.update({
      bookRequestId: null,
    });

    await this.bookFileRepo.update(bookFile);
  }

  /**
   * Gets all files attached to a book request
   */
  async getRequestFiles(
    requestId: string,
    userId: string,
  ): Promise<BookFile[]> {
    const bookRequest = await this.bookRequestRepo.findById(requestId);
    if (!bookRequest) {
      throw new NotFoundException(
        `Book request with id=${requestId} not found`,
      );
    }

    // Only the user who created the request or admins can view files
    if (bookRequest.userId !== userId) {
      throw new UnauthorizedException(
        'You can only view files for your own requests',
      );
    }

    return this.bookFileRepo.findByRequestId(requestId);
  }
}
