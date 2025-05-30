import type { RefObject } from 'react';
import { useCallback, useLayoutEffect, useRef } from 'react';

export function useResizeObserver<T extends Element>(
  ref: RefObject<T | null>,
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions,
) {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const stableCallback = useCallback<ResizeObserverCallback>(
    (...args) => callbackRef.current(...args),
    [],
  );

  useLayoutEffect(() => {
    const element = ref?.current;

    if (!element) {
      return;
    }

    const resizeObserver = new ResizeObserver(stableCallback);

    try {
      resizeObserver.observe(element, options);
    } catch (error) {
      console.error('ResizeObserver error:', error);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref, stableCallback, options]);
}
