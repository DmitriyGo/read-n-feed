import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Document, Page, pdfjs } from 'react-pdf';
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
  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState<number>(1);

  const { t } = useTranslation();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className="select-none">
      <input
        type="range"
        min="0.8"
        max="1.5"
        step="0.1"
        value={scale}
        onChange={(e) => setScale(parseFloat(e.target.value))}
      />
      <p>
        {t('scale')}: {scale}
        <span className="text-gray-400"> (0.8 - 1.5)</span>
      </p>

      <p className="text-center text-lg font-bold">{filename}</p>
      <Document
        className="w-fit mx-auto"
        file={downloadUrl}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {Array(numPages)
          .fill(0)
          .map((_, pageNum) => (
            <Page
              width={700}
              scale={scale}
              key={pageNum}
              pageNumber={pageNum + 1}
            />
          ))}
      </Document>
    </div>
  );
};
