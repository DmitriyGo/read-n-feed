import { BookRequestStatus } from '@read-n-feed/domain';

export type SupportedLanguage = 'ua' | 'en';
export const SupportedLanguages = [
  'ua',
  'en',
] as const satisfies SupportedLanguage[];

export type FileFormat = 'PDF' | 'EPUB' | 'MOBI';
export const FileFormats = [
  'PDF',
  'EPUB',
  'MOBI',
] as const satisfies FileFormat[];

export const AcceptedStatuses = [
  'APPROVED',
  'PENDING',
  'REJECTED',
] as const satisfies BookRequestStatus[];
export type AcceptedStatus = (typeof AcceptedStatuses)[number];
