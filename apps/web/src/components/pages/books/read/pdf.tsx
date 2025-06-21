import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Document, Page, pdfjs } from 'react-pdf';

import { useResizeObserver } from '@/hooks';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PDFReader = ({
  downloadUrl,
  filename,
}: {
  downloadUrl: string;
  filename: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState<number>(
    +(localStorage.getItem('scale2') ?? 1),
  );
  const [width, setWidth] = useState(700);

  const { t } = useTranslation(['translation', 'validation', 'badges']);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  useResizeObserver(ref, (entries) => {
    setWidth(entries[0].contentRect.width);
  });

  useEffect(() => {
    localStorage.setItem('scale2', String(scale));
  }, [scale]);

  return (
    <div ref={ref} className="select-none">
      <input
        type="range"
        min="0.5"
        max="1"
        step="0.1"
        value={scale}
        onChange={(e) => setScale(parseFloat(e.target.value))}
      />
      <p>
        {t('scale')}: {scale}
        <span className="text-gray-400"> (0.5 - 1.0)</span>
      </p>

      <p className="text-center text-lg font-bold">{filename}</p>
      <Document
        className="w-fit max-w-full mx-auto"
        file={downloadUrl}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {Array(numPages)
          .fill(0)
          .map((_, pageNum) => (
            <Page
              width={width}
              scale={scale}
              key={pageNum}
              pageNumber={pageNum + 1}
            />
          ))}
      </Document>
    </div>
  );
};
