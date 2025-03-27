import { useState } from "react";
import FileUploader from "./Components/FileUploader";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [signature, setSignature] = useState<string | null>(null);


  return (
     <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6">PDF Annotator & Signature Tool</h1>

      {/* Upload Section */}
      <FileUploader onFileUpload={setFile} />
    </div>
  );
}
