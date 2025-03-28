import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type FileUploaderProps = {
  onFileUpload: (file: File) => void;
};

export default function FileUploader({ onFileUpload }: FileUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  return (
    <div {...getRootProps()} className="border-2 border-dashed p-6 rounded-lg text-center cursor-pointer bg-gray-100">
      <input {...getInputProps()} />
      <p className="text-gray-700">Drag & Drop a PDF here, or click to select a PDF file</p>
    </div>
  );
}
