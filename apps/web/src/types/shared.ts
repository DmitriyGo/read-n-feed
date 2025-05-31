import { ReactNode } from 'react';

export type BaseComponentProps<Props = object> = {
  children?: ReactNode;
  className?: string;
} & Props;

export type Leaves<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never ? '' : `.${Leaves<T[K]>}`}`;
    }[keyof T]
  : never;

export type StringRecord<T> = Record<string, T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteFunction = (...args: any[]) => string;

export type RouteValue =
  | StringRecord<string | RouteFunction | StringRecord<string | RouteFunction>>
  | string;
