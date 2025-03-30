import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';

export function handleUseCaseError(
  error: unknown,
  operation: string,
  logger: Logger,
): never {
  if (
    error instanceof NotFoundException ||
    error instanceof BadRequestException
  ) {
    throw error;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  logger.error(`Error ${operation}: ${errorMessage}`);

  if (error instanceof Error && error.stack) {
    logger.debug(error.stack);
  }

  throw new BadRequestException(`Failed to ${operation}: ${errorMessage}`);
}
