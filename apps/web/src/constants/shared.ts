import { BookRequestStatus } from '@read-n-feed/domain';

export type SupportedLanguage = 'ua' | 'en';
export const SupportedLanguages = [
  'ua',
  'en',
] as const satisfies SupportedLanguage[];
export const SupportedLanguagesMap: Record<SupportedLanguage, string> = {
  ua: 'Українська',
  en: 'English',
};

export type FileFormat = 'PDF' | 'EPUB' | 'MOBI';
export const FileFormats = [
  'PDF',
  'EPUB',
  'MOBI',
] as const satisfies FileFormat[];

export type ImageFormat = 'JPG' | 'JPEG' | 'PNG' | 'WEBP' | 'GIF';
export const ImageFormats = [
  'JPG',
  'JPEG',
  'PNG',
  'WEBP',
  'GIF',
] as const satisfies ImageFormat[];

export const AcceptedStatuses = [
  'APPROVED',
  'PENDING',
  'REJECTED',
] as const satisfies BookRequestStatus[];
export type AcceptedStatus = (typeof AcceptedStatuses)[number];
