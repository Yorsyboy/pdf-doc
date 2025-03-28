"use client";
import { useState } from "react";
import FileUploader from "./Components/FileUploader";
import PDFViewer from "./Components/PDFViewer";
export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        PDF Annotator & Signature Tool
      </h1>

      {/* Upload Section */}
      <FileUploader onFileUpload={setFile} />

      {/* Annotation Section */}
      <div className="mt-8">
        <PDFViewer file={file} />
      </div>
    </div>
  );
}
