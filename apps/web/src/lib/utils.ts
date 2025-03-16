import { isDefined } from 'class-validator';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clearObject(obj: Record<string, string> | object) {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, v]) => isDefined(v) && v !== '' && v.length > 0,
    ),
  );
}
