"use client";
import { useState } from "react";
import FileUploader from "./Components/FileUploader";
import PDFViewer from "./Components/PDFViewer";
import Navbar from "./Components/Navbar";
export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8 mt-14">
        <h1 className="text-4xl font-bold text-center">
          PDF Annotator & Signature Tool
        </h1>
        <p className="text-gray-600 text-center mb-6 text-xl">
          Upload a PDF file to get started with annotating and signing your
          documents
        </p>

        {/* Upload Section */}
        <FileUploader onFileUpload={setFile} />

        {/* Annotation Section */}
        {file && (
          <div className="mt-8">
            <PDFViewer file={file} />
          </div>
        )}
      </div>
    </>
  );
}
