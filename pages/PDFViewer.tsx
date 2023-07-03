// // "use client";

// import React from "react";
// import { pdfjs, Document, Page } from "react-pdf";

// // pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
// // pdfjs.GlobalWorkerOptions.workerSrc = "../public/pdf.worker.min.js";
// // pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// console.log(pdfjs.version);
// interface Props {
//   file: File;
//   numPages: null | number;
//   setNumPages: (numPages: number) => void;
//   pageNumber: number;
//   setPageNumber: (pageNumber: number) => void;
// }

// export function PDFViewer({
//   file,
//   numPages,
//   setNumPages,
//   pageNumber,
//   setPageNumber,
// }: Props) {
//   function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
//     setNumPages(numPages);
//   }

//   return (
//     <div>
//       <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
//         <Page pageNumber={pageNumber} />
//       </Document>
//       <p>
//         Page {pageNumber} of {numPages}
//       </p>
//     </div>
//   );
// }
