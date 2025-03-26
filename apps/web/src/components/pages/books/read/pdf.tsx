import { BookFileResponseDto } from '@read-n-feed/application';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PDFReader = ({ fileInfo }: { fileInfo: BookFileResponseDto }) => {
  const [numPages, setNumPages] = useState<number>();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className="select-none">
      <Document
        className="w-fit mx-auto"
        file={fileInfo.downloadUrl}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {Array(numPages)
          .fill(0)
          .map((_, pageNum) => (
            <Page pageNumber={pageNum + 1} />
          ))}
      </Document>
    </div>
  );
};
