import { BookFileResponseDto } from '@read-n-feed/application';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PDFReader = ({ fileInfo }: { fileInfo: BookFileResponseDto }) => {
  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState<number>(1);

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
      <Document
        className="w-fit mx-auto"
        file={fileInfo.downloadUrl}
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
