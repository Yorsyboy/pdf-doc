"use client";
import { Document, Page, pdfjs } from "react-pdf";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  X,
  Highlighter,
  Underline,
  MessageSquare,
  Pen,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument, rgb } from "pdf-lib";
import { toast } from "react-toastify";
import Image from "next/image";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

type Annotation = {
  id: string;
  page: number;
  type: "highlight" | "underline" | "comment" | "freehand";
  color?: string;
  text?: string;
  positions?: { x: number; y: number }[];
  position?: { x: number; y: number };
  width?: number;
  height?: number;
};

type Signature = {
  id: string;
  page: number;
  imageData: string;
  position: { x: number; y: number };
  width: number;
  height: number;
};

export default function PDFViewer({ file }: { file: File | null }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [selectedColor, setSelectedColor] = useState("#ffff00");
  const [comment, setComment] = useState("");
  const [activeTool, setActiveTool] = useState<
    "highlight" | "underline" | "comment" | "freehand" | "signature" | null
  >(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>(
    []
  );
  const [selection, setSelection] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(800);

  // Set the default width of the container to 800px
  useEffect(() => {
    const updateWidth = () => {
      const newWidth = Math.min(window.innerWidth - 40, 800);
      setContainerWidth(newWidth);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Create a stable URL for the PDF file
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
    },
    []
  );

  const handleMouseDown = (event: React.MouseEvent) => {
    if (!activeTool || !pdfContainerRef.current) return;

    // Prevent comment creation if input is empty
    if (activeTool === "comment" && comment.trim() === "") {
      setActiveTool(null);
      return;
    }

    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (activeTool === "freehand") {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
    } else if (activeTool === "highlight" || activeTool === "underline") {
      setSelection({ start: { x, y }, end: { x, y } });
    } else if (activeTool === "comment") {
      const newAnnotation: Annotation = {
        id: uuidv4(),
        page: currentPage,
        type: "comment",
        text: comment,
        position: { x, y },
      };
      setAnnotations((prev) => [...prev, newAnnotation]);
      setComment("");
    }
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    if (!activeTool || !pdfContainerRef.current) return;

    const touch = event.touches[0];
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (activeTool === "freehand") {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
    } else if (activeTool === "highlight" || activeTool === "underline") {
      setSelection({ start: { x, y }, end: { x, y } });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!activeTool || !pdfContainerRef.current) return;

    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isDrawing && activeTool === "freehand") {
      setCurrentPath((prev) => [...prev, { x, y }]);
    } else if (
      selection &&
      (activeTool === "highlight" || activeTool === "underline")
    ) {
      setSelection((prev) => (prev ? { ...prev, end: { x, y } } : null));
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!activeTool || !pdfContainerRef.current || !isDrawing) return;

    const touch = event.touches[0];
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (isDrawing && activeTool === "freehand") {
      setCurrentPath((prev) => [...prev, { x, y }]);
    } else if (
      selection &&
      (activeTool === "highlight" || activeTool === "underline")
    ) {
      setSelection((prev) => (prev ? { ...prev, end: { x, y } } : null));
    }
  };

  const handleMouseUp = () => {
    if (!activeTool) return;

    if (activeTool === "freehand" && isDrawing && currentPath.length > 1) {
      const newAnnotation: Annotation = {
        id: uuidv4(),
        page: currentPage,
        type: "freehand",
        color: selectedColor,
        positions: [...currentPath],
      };
      setAnnotations((prev) => [...prev, newAnnotation]);
    } else if (
      (activeTool === "highlight" || activeTool === "underline") &&
      selection
    ) {
      // Calculate width and height properly
      const width = Math.abs(selection.end.x - selection.start.x);
      // Fixed height for highlight/underline
      const height = activeTool === "highlight" ? 20 : 2;

      // Calculate position considering drag direction
      const x = Math.min(selection.start.x, selection.end.x);
      const y = Math.min(selection.start.y, selection.end.y);

      const newAnnotation: Annotation = {
        id: uuidv4(),
        page: currentPage,
        type: activeTool,
        color: selectedColor,
        position: { x, y },
        width,
        height,
      };
      setAnnotations((prev) => [...prev, newAnnotation]);
    }

    setIsDrawing(false);
    setCurrentPath([]);
    setSelection(null);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };

  const removeSignature = (id: string) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
  };

  const renderAnnotations = () => {
    return annotations
      .filter((ann) => ann.page === currentPage)
      .map((annotation) => {
        if (annotation.type === "comment" && annotation.position) {
          return (
            <div
              key={annotation.id}
              className="absolute bg-yellow-100 p-2 border border-yellow-300 rounded shadow"
              style={{
                left: `${annotation.position.x}px`,
                top: `${annotation.position.y}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end mb-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAnnotation(annotation.id);
                  }}
                  className="text-red-500 hover:bg-red-100 rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm">{annotation.text}</p>
            </div>
          );
        } else if (
          annotation.type === "highlight" &&
          annotation.position &&
          annotation.width &&
          annotation.height
        ) {
          return (
            <div
              key={annotation.id}
              className="absolute opacity-50"
              style={{
                left: `${annotation.position.x}px`,
                top: `${annotation.position.y}px`,
                width: `${annotation.width}px`,
                height: `${annotation.height}px`,
                backgroundColor: annotation.color,
                pointerEvents: "none",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAnnotation(annotation.id);
                }}
                className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1"
                style={{ pointerEvents: "auto" }}
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          );
        } else if (
          annotation.type === "underline" &&
          annotation.position &&
          annotation.width &&
          annotation.height
        ) {
          return (
            <div
              key={annotation.id}
              className="absolute border-b-2"
              style={{
                left: `${annotation.position.x}px`,
                top: `${annotation.position.y}px`,
                width: `${annotation.width}px`,
                height: `${annotation.height}px`,
                borderBottomColor: annotation.color,
                pointerEvents: "none",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAnnotation(annotation.id);
                }}
                className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1"
                style={{ pointerEvents: "auto" }}
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          );
        } else if (annotation.type === "freehand" && annotation.positions) {
          return (
            <svg
              key={annotation.id}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            >
              <polyline
                points={annotation.positions
                  .map((p) => `${p.x},${p.y}`)
                  .join(" ")}
                fill="none"
                stroke={annotation.color || "#0000ff"}
                strokeWidth="2"
              />
            </svg>
          );
        }
        return null;
      });
  };

  const renderSignatures = () => {
    return signatures
      .filter((sig) => sig.page === currentPage)
      .map((signature) => (
        <div
          key={signature.id}
          className="absolute"
          style={{
            left: `${signature.position.x}px`,
            top: `${signature.position.y}px`,
            width: `${signature.width}px`,
            height: `${signature.height}px`,
          }}
        >
          <Image
            src={signature.imageData}
            alt="signature"
            width={signature.width}
            height={signature.height}
            className="w-full h-full object-contain"
          />
          <button
            onClick={() => removeSignature(signature.id)}
            className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1"
          >
            <X size={12} className="text-white" />
          </button>
        </div>
      ));
  };

  const renderSelection = () => {
    if (
      !selection ||
      !(activeTool === "highlight" || activeTool === "underline")
    )
      return null;

    const width = Math.abs(selection.end.x - selection.start.x);
    const height = activeTool === "highlight" ? 20 : 2;
    const x = Math.min(selection.start.x, selection.end.x);
    const y = Math.min(selection.start.y, selection.end.y);

    return (
      <div
        className={`absolute ${
          activeTool === "highlight"
            ? "bg-yellow-300 opacity-50"
            : "border-b-2 border-red-500"
        }`}
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
    );
  };

  // function to handle PDF export
  const exportPDF = async () => {
    if (!file || !pdfUrl || !pdfContainerRef.current) {
      console.error("Missing required elements for export");
      return;
    }

    try {
      // Load the original PDF
      const pdfBytes = await fetch(pdfUrl).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      const pdfPageWidth = pages[0].getWidth();
      const scaleFactor = pdfPageWidth / containerWidth;

      // Coordinate conversion function
      const toPDFCoords = (x: number, y: number, pageHeight: number) => ({
        x: x * scaleFactor,
        y: pageHeight - y * scaleFactor,
      });

      // Process all annotations
      for (const annotation of annotations) {
        const page = pages[annotation.page - 1];
        const pageHeight = page.getHeight();

        switch (annotation.type) {
          case "highlight":
            if (annotation.position && annotation.width && annotation.height) {
              const { x, y } = toPDFCoords(
                annotation.position.x,
                annotation.position.y + annotation.height,
                pageHeight
              );
              page.drawRectangle({
                x,
                y,
                width: annotation.width * scaleFactor,
                height: annotation.height * scaleFactor,
                color: annotation.color
                  ? rgb(
                      parseInt(annotation.color.substring(1, 3), 16) / 255,
                      parseInt(annotation.color.substring(3, 5), 16) / 255,
                      parseInt(annotation.color.substring(5, 7), 16) / 255
                    )
                  : rgb(1, 1, 0), // Default color
                opacity: 0.4,
              });
            }
            break;

          case "underline":
            if (annotation.position && annotation.width) {
              const { x, y } = toPDFCoords(
                annotation.position.x,
                annotation.position.y,
                pageHeight
              );
              page.drawRectangle({
                x,
                y: y - 2,
                width: annotation.width * scaleFactor,
                height: 2,
                color: annotation.color
                  ? rgb(
                      parseInt(annotation.color.substring(1, 3), 16) / 255,
                      parseInt(annotation.color.substring(3, 5), 16) / 255,
                      parseInt(annotation.color.substring(5, 7), 16) / 255
                    )
                  : rgb(1, 0, 0), // Default color
                opacity: 0.8,
              });
            }
            break;

          case "comment":
            if (annotation.position && annotation.text) {
              const { x, y } = toPDFCoords(
                annotation.position.x,
                annotation.position.y,
                pageHeight
              );
              page.drawRectangle({
                x,
                y: y - 15,
                width: Math.max(annotation.text.length * 6, 100),
                height: 20,
                color: rgb(1, 1, 0.8),
                opacity: 0.8,
              });
              page.drawText(annotation.text, {
                x: x + 2,
                y: y - 12,
                size: 12,
                color: rgb(0, 0, 0),
              });
            }
            break;

          case "freehand":
            if (annotation.positions && annotation.positions.length >= 2) {
              for (let i = 1; i < annotation.positions.length; i++) {
                const start = toPDFCoords(
                  annotation.positions[i - 1].x,
                  annotation.positions[i - 1].y,
                  pageHeight
                );
                const end = toPDFCoords(
                  annotation.positions[i].x,
                  annotation.positions[i].y,
                  pageHeight
                );

                page.drawLine({
                  start,
                  end,
                  thickness: 2,
                  color: annotation.color
                    ? rgb(
                        parseInt(annotation.color.substring(1, 3), 16) / 255,
                        parseInt(annotation.color.substring(3, 5), 16) / 255,
                        parseInt(annotation.color.substring(5, 7), 16) / 255
                      )
                    : rgb(0, 0, 1), // Default color
                  opacity: 1,
                });
              }
            }
            break;
        }
      }

      // Process all signatures
      for (const signature of signatures) {
        const page = pages[signature.page - 1];
        const pageHeight = page.getHeight();

        try {
          const base64Data =
            signature.imageData.split(",")[1] || signature.imageData;
          const imageBytes = Uint8Array.from(atob(base64Data), (c) =>
            c.charCodeAt(0)
          );
          const signatureImage = await pdfDoc.embedPng(imageBytes);

          const { x, y } = toPDFCoords(
            signature.position.x,
            signature.position.y + signature.height,
            pageHeight
          );

          page.drawImage(signatureImage, {
            x,
            y,
            width: signature.width * scaleFactor,
            height: signature.height * scaleFactor,
          });
        } catch (error) {
          console.error("Error embedding signature:", error);
        }
      }

      // Save and download
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `annotated_${file.name || "document.pdf"}`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      toast.success("PDF exported successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Failed to export PDF. Please check console for details.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="border rounded-lg p-4 mx-auto w-full max-w-4xl overflow-x-auto">
      <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
        <button
          onClick={() =>
            setActiveTool(activeTool === "highlight" ? null : "highlight")
          }
          className={`px-3 py-1 rounded flex items-center gap-2 ${
            activeTool === "highlight" ? "bg-yellow-300" : "bg-gray-200"
          }`}
        >
          <Highlighter size={16} />
          Highlight
        </button>
        <button
          onClick={() =>
            setActiveTool(activeTool === "underline" ? null : "underline")
          }
          className={`px-3 py-1 rounded flex items-center gap-2 ${
            activeTool === "underline" ? "bg-red-300" : "bg-gray-200"
          }`}
        >
          <Underline size={16} />
          Underline
        </button>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <button
            onClick={() =>
              setActiveTool(activeTool === "comment" ? null : "comment")
            }
            className={`px-3 py-1 rounded flex items-center gap-2 ${
              activeTool === "comment"
                ? "bg-blue-300"
                : comment.trim() === ""
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-gray-200"
            }`}
            disabled={comment.trim() === ""}
          >
            <MessageSquare size={16} />
            Comment
          </button>
        </div>
        <button
          onClick={() =>
            setActiveTool(activeTool === "freehand" ? null : "freehand")
          }
          className={`px-3 py-1 rounded flex items-center gap-2 ${
            activeTool === "freehand" ? "bg-purple-300" : "bg-gray-200"
          }`}
        >
          <Pen size={16} />
          Draw
        </button>
        <div className="flex items-center gap-2 ml-2">
          <span>Color:</span>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-8 h-8"
          />
        </div>
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={() => setScale((prev) => Math.min(prev + 0.1, 2))}
            className="p-1 rounded bg-gray-200"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))}
            className="p-1 rounded bg-gray-200"
          >
            <ZoomOut size={16} />
          </button>
        </div>
      </div>

      {pdfUrl ? (
        <div
          className="relative"
          ref={pdfContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin" />
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              width={containerWidth * scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="animate-spin" />
                </div>
              }
            />
          </Document>

          {/* Render annotations */}
          {renderAnnotations()}

          {/* Render signatures */}
          {renderSignatures()}

          {/* Render current selection */}
          {renderSelection()}

          {/* Freehand drawing preview */}

          {isDrawing && currentPath.length > 1 && (
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <polyline
                points={currentPath.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke={selectedColor}
                strokeWidth="2"
              />
            </svg>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-8">No PDF loaded</p>
      )}

      <div className="flex justify-between mt-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 disabled:opacity-50"
          >
            <ChevronLeft />
          </button>
          <span className="flex items-center">
            Page {currentPage} of {numPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage(Math.min(numPages || 1, currentPage + 1))
            }
            disabled={currentPage === numPages}
            className="p-2 disabled:opacity-50"
          >
            <ChevronRight />
          </button>
        </div>
        <button
          onClick={exportPDF}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Download size={18} />
          Export Annotated PDF
        </button>
      </div>
    </div>
  );
}
