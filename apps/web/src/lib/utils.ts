import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isEmpty(val: unknown) {
  return val === undefined || val === null;
}

export function isNotEmpty(val: unknown) {
  return val !== undefined && val !== null;
}
