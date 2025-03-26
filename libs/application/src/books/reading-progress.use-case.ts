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

import { handleUseCaseError } from '../common';
import {
  ReadingProgressResponseDto,
  SaveReadingProgressDto,
} from './dto/reading-progress.dto';

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
      return handleUseCaseError(error, 'saving reading progress', this.logger);
    }
  }

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
      return handleUseCaseError(error, 'getting reading progress', this.logger);
    }
  }

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
      return handleUseCaseError(
        error,
        'getting all reading progress',
        this.logger,
      );
    }
  }

  async getInProgressBooks(userId: string): Promise<string[]> {
    try {
      return this.progressRepo.findAllBooksByUser(userId);
    } catch (error) {
      return handleUseCaseError(
        error,
        'getting in-progress books',
        this.logger,
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
