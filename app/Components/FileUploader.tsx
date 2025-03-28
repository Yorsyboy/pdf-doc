import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";

type FileUploaderProps = {
  onFileUpload: (file: File) => void;
};

export default function FileUploader({ onFileUpload }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      // Handle rejected files (wrong type, etc.)
      const rejection = fileRejections[0];
      if (rejection.errors[0].code === "file-invalid-type") {
        toast.error("Please upload a PDF file only", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Error uploading file", {
          position: "top-right",
          autoClose: 3000,
        });
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      try {
        onFileUpload(acceptedFiles[0]);
        toast.success("PDF uploaded successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error) {
        toast.error("Failed to process PDF", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  return (
    <>
      <div
        {...getRootProps()}
        className="border-2 border-dashed p-6 rounded-lg text-center cursor-pointer bg-gray-100 hover:bg-gray-50 transition-colors"
      >
        <input {...getInputProps()} />
        <p className="text-gray-700">
          Drag & Drop a PDF here, or click to select a PDF file
        </p>
      </div>
      
    </>
  );
}