import type { NavItem, Rendition } from 'epubjs';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactReader } from 'react-reader';

export const EpubReader = ({
  downloadUrl,
  filename,
}: {
  downloadUrl: string;
  filename: string;
}) => {
  const [page, setPage] = useState(0);
  const rendition = useRef<Rendition | undefined>(undefined);
  const toc = useRef<NavItem[]>([]);
  const [location, setLocation] = useState<string | number>(0);
  const { t } = useTranslation(['translation', 'validation', 'badges']);
  const [scale, setScale] = useState<number>(
    +(localStorage.getItem('scale') ?? 75),
  );

  useEffect(() => {
    localStorage.setItem('scale', String(scale));
  }, [scale]);

  return (
    <div className="select-none flex-col flex">
      <p className="text-center text-lg font-bold">
        {filename} - {page}
      </p>
      <div>
        <input
          type="range"
          min="50"
          max="100"
          step="5"
          value={scale}
          onChange={(e) => setScale(parseFloat(e.target.value))}
        />

        <p>
          {t('width')}: {scale}%
          <span className="text-gray-400"> (50 - 100)</span>
        </p>
      </div>

      <div style={{ height: '80vh', width: `${scale}%` }} className="mx-auto">
        <ReactReader
          url={downloadUrl}
          location={location}
          tocChanged={(_toc) => (toc.current = _toc)}
          epubOptions={{
            flow: 'scrolled',
            manager: 'continuous',
          }}
          getRendition={(_rendition: Rendition) => {
            rendition.current = _rendition;
          }}
          epubInitOptions={{
            openAs: 'epub',
          }}
          locationChanged={(loc: string) => {
            setLocation(loc);
            if (rendition.current && toc.current) {
              setPage(rendition.current.location.start.displayed.page);
            }
          }}
        />
      </div>
    </div>
  );
};
