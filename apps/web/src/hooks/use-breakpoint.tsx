import { useState, useEffect } from 'react';

const screens = {
  xs: '320px',
  sm: '480px',
  md: '768px',
  lg: '976px',
  xl: '1440px',
};

type BreakpointKey = keyof typeof screens;

export const useBreakpoint = (breakpointKey: BreakpointKey) => {
  const width = screens[breakpointKey];

  const [isBreakpoint, setIsBreakpoint] = useState(false);

  useEffect(() => {
    try {
      const mql = window.matchMedia(`(min-width: ${width})`);

      const setFromQuery = ({ matches }: { matches: boolean }) => {
        setIsBreakpoint(matches);
      };

      mql.addEventListener('change', setFromQuery);
      setFromQuery(mql);

      return () => {
        mql.removeEventListener('change', setFromQuery);
      };
    } catch {
      return;
    }
  }, [width]);

  return isBreakpoint;
};
