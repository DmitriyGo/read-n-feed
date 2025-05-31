import { isDefined } from '@read-n-feed/shared';

import { FileFormats } from '@/constants';

export type FileValidationOptions = {
  maxSizeInMB?: number;
  acceptedFormats?: string[];
};

export function validateFile(
  file: File,
  options: FileValidationOptions = {},
): { valid: boolean; error?: string } {
  const maxSizeInMB = options.maxSizeInMB || 10;
  const acceptedFormats = options.acceptedFormats || FileFormats;

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  const fileSizeInMB = file.size / (1024 * 1024);

  if (fileSizeInMB > maxSizeInMB) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeInMB}MB (${fileSizeInMB.toFixed(2)}MB)`,
    };
  }

  const fileFormat = file.name.split('.').pop()?.toUpperCase();

  if (!isDefined(fileFormat) || !acceptedFormats.includes(fileFormat)) {
    return {
      valid: false,
      error: `Invalid file format. Accepted formats: ${acceptedFormats.join(', ')}`,
    };
  }

  return { valid: true };
}

export function getFileExtension(file: File): string {
  const fileName = file.name.split('.').pop()?.toUpperCase();

  if (!isDefined(fileName)) {
    throw new Error('File name is not defined');
  }

  return fileName;
}
