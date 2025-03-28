import { useCallback } from "react";
import { useDropzone, FileRejection} from "react-dropzone";
import { toast } from "react-toastify";

type FileUploaderProps = {
  onFileUpload: (file: File) => void;
};

export default function FileUploader({ onFileUpload }: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        // Handle rejected files
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
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Failed to process PDF";
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  return (
    <>
      <div
        {...getRootProps()}
        className="border-2 border-dashed p-6 rounded-lg text-center cursor-pointer bg-gray-200 hover:bg-gray-50 transition-colors max-w-4xl mx-auto"
      >
        <input {...getInputProps()} />
        <p className="text-gray-700">
          Drag & Drop a PDF here, or click to select a PDF file
        </p>
      </div>
    </>
  );
}
