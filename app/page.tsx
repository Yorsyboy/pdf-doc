"use client";
import { useState } from "react";
import FileUploader from "./Components/FileUploader";
import PDFViewer from "./Components/PDFViewer";
import Navbar from "./Components/Navbar";
import { X } from "lucide-react";


export default function Home() {
  // State to hold the uploaded file
  const [file, setFile] = useState<File | null>(null);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8 mt-14">
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
          <div className="mt-8 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-end mb-4">
              <p className="text-gray-700 text-lg mr-4">{file.name}</p>
              <X
                className="text-red-500 cursor-pointer"
                onClick={() => setFile(null)}
                size={32}
              />
            </div>
            <PDFViewer file={file} />
          </div>
        )}
      </div>
    </>
  );
}
