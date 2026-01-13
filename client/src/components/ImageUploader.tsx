import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesChange, maxFiles = 5 }) => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    setFiles(newFiles);
    onFilesChange(newFiles);
  }, [files, maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.webp'],
    },
    maxFiles: maxFiles - files.length,
  });

  const removeFile = (fileToRemove: File) => {
    const newFiles = files.filter(file => file !== fileToRemove);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-8 rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-sm text-foreground">
          {isDragActive ? "أفلت الملفات هنا..." : "اسحب وأفلت الصور هنا، أو انقر للاختيار"}
        </p>
        <button
          type="button"
          className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          إضافة صور
        </button>
        <p className="mt-1 text-xs text-muted-foreground">
          (بحد أقصى {maxFiles} صور، المتبقي: {maxFiles - files.length})
        </p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={`صورة ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={() => removeFile(file)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
