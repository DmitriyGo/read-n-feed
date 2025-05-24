import { isArray, isDefined } from 'class-validator';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clearObject(obj: Record<string, unknown> | object) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => {
      if (!isDefined(v)) {
        return false;
      }

      if (v === '') {
        return false;
      }

      if (isArray(v)) {
        return v.length > 0;
      }

      return true;
    }),
  );
}

export function formatDate(date?: Date | string | null) {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}
