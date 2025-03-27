"use client";

import { useEffect, useState } from "react";

type PDFViewerProps = {
  file: File | null;
  className?: string;
  onClose?: () => void;
};

export default function PDFViewer({ 
  file, 
  className = "", 
  onClose 
}: PDFViewerProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setObjectUrl(null);
    }
  }, [file]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    setObjectUrl(null);
  };

  return (
    <div className={`relative border rounded-lg overflow-hidden ${className}`}>
      {objectUrl ? (
        <>
          <iframe
            src={objectUrl}
            width="100%"
            height="600px"
            className="border-0"
            title="PDF Viewer"
          />
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg"
            aria-label="Close PDF viewer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </>
      ) : (
        <div className="p-8 text-center text-gray-500">
          No PDF loaded
        </div>
      )}
    </div>
  );
}