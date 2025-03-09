import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  IBookRepository,
  IReadingProgressRepository,
  ReadingProgress,
} from '@read-n-feed/domain';
import { v4 as uuidv4 } from 'uuid';

export class SaveReadingProgressDto {
  bookId: string;
  progress: number; // 0-100 percentage
  pageNumber?: number;
  totalPages?: number;
  deviceId?: string;
  position?: string; // For formats like EPUB where position might be a CFI
}

export class ReadingProgressResponseDto {
  id: string;
  userId: string;
  bookId: string;
  progress: number;
  pageNumber?: number;
  totalPages?: number;
  deviceId?: string;
  position?: string;
  updatedAt: Date;
}

@Injectable()
export class ReadingProgressUseCase {
  private readonly logger = new Logger(ReadingProgressUseCase.name);

  constructor(
    @Inject('IReadingProgressRepository')
    private readonly progressRepo: IReadingProgressRepository,

    @Inject('IBookRepository')
    private readonly bookRepo: IBookRepository,
  ) {}

  async saveProgress(
    userId: string,
    dto: SaveReadingProgressDto,
  ): Promise<ReadingProgressResponseDto> {
    try {
      // Validate book exists
      const book = await this.bookRepo.findById(dto.bookId);
      if (!book) {
        throw new NotFoundException(`Book with id=${dto.bookId} not found`);
      }

      // Validate progress value
      if (dto.progress < 0 || dto.progress > 100) {
        throw new BadRequestException('Progress must be between 0 and 100');
      }

      // Check if progress entry already exists
      const existingProgress = await this.progressRepo.find(
        userId,
        dto.bookId,
        dto.deviceId,
      );

      let progressEntity: ReadingProgress;

      if (existingProgress) {
        // Update existing progress
        existingProgress.updateProgress(dto.progress);

        // Update additional fields if provided
        const metadata: Record<string, any> = {};

        if (dto.pageNumber !== undefined) {
          metadata['pageNumber'] = dto.pageNumber;
        }

        if (dto.totalPages !== undefined) {
          metadata['totalPages'] = dto.totalPages;
        }

        if (dto.position !== undefined) {
          metadata['position'] = dto.position;
        }

        existingProgress.updateMetadata(metadata);

        await this.progressRepo.upsert(existingProgress);
        progressEntity = existingProgress;
      } else {
        // Create new progress entry
        const metadata: Record<string, any> = {};

        if (dto.pageNumber !== undefined) {
          metadata['pageNumber'] = dto.pageNumber;
        }

        if (dto.totalPages !== undefined) {
          metadata['totalPages'] = dto.totalPages;
        }

        if (dto.position !== undefined) {
          metadata['position'] = dto.position;
        }

        progressEntity = new ReadingProgress({
          id: uuidv4(),
          userId,
          bookId: dto.bookId,
          progress: dto.progress,
          deviceId: dto.deviceId || null,
          updatedAt: new Date(),
          metadata,
        });

        await this.progressRepo.upsert(progressEntity);
      }

      const response = this.toResponseDto(progressEntity);
      this.logger.log(
        `Saved reading progress for user ${userId}, book ${dto.bookId}`,
      );

      return response;
    } catch (error) {
      // Re-throw known exceptions
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Log and wrap other errors
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error saving reading progress: ${errorMessage}`);
      throw new BadRequestException(
        `Failed to save reading progress: ${errorMessage}`,
      );
    }
  }

  /**
   * Get the latest reading progress for a book
   */
  async getProgress(
    userId: string,
    bookId: string,
    deviceId?: string,
  ): Promise<ReadingProgressResponseDto | null> {
    try {
      // Validate book exists
      const book = await this.bookRepo.findById(bookId);
      if (!book) {
        throw new NotFoundException(`Book with id=${bookId} not found`);
      }

      const progress = await this.progressRepo.find(userId, bookId, deviceId);

      if (!progress) {
        return null;
      }

      return this.toResponseDto(progress);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting reading progress: ${errorMessage}`);
      throw new BadRequestException(
        `Failed to get reading progress: ${errorMessage}`,
      );
    }
  }

  /**
   * Get reading progress for all devices for a book
   */
  async getAllProgress(
    userId: string,
    bookId: string,
  ): Promise<ReadingProgressResponseDto[]> {
    try {
      // Validate book exists
      const book = await this.bookRepo.findById(bookId);
      if (!book) {
        throw new NotFoundException(`Book with id=${bookId} not found`);
      }

      const progressEntries = await this.progressRepo.findAllForBook(
        userId,
        bookId,
      );

      return progressEntries.map((entry) => this.toResponseDto(entry));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting all reading progress: ${errorMessage}`);
      throw new BadRequestException(
        `Failed to get reading progress: ${errorMessage}`,
      );
    }
  }

  /**
   * Get all books the user has started reading
   */
  async getInProgressBooks(userId: string): Promise<string[]> {
    try {
      return this.progressRepo.findAllBooksByUser(userId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting in-progress books: ${errorMessage}`);
      throw new BadRequestException(
        `Failed to get in-progress books: ${errorMessage}`,
      );
    }
  }

  private toResponseDto(entity: ReadingProgress): ReadingProgressResponseDto {
    const props = entity.toPrimitives();
    const metadata = props['metadata'] || {};

    return {
      id: props.id,
      userId: props.userId,
      bookId: props.bookId,
      progress: props.progress,
      pageNumber: metadata['pageNumber'],
      totalPages: metadata['totalPages'],
      position: metadata['position'],
      deviceId: props.deviceId || undefined,
      updatedAt: props.updatedAt,
    };
  }
}
