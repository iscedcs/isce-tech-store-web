"use client";

import {
  Upload,
  Loader2,
  CheckCircle,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import Image from "next/image";

interface DesignUploadAreaProps {
  label: string;
  onFileSelect: (file: File) => void;
  onUploadComplete?: (url: string) => void;
  onClear?: () => void;
}

export default function DesignUploadArea({
  label,
  onFileSelect,
  onUploadComplete,
  onClear,
}: DesignUploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);
    onFileSelect(file);

    // Create local preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    // Upload to server
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Upload failed");
        setIsUploading(false);
        return;
      }

      setUploadedUrl(result.url);
      onUploadComplete?.(result.url);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      inputRef.current?.click();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedUrl(null);
    setPreview(null);
    setFileName(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onClear?.();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-primary-light mb-3">
        {label}
      </label>
      <div
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
          uploadedUrl
            ? "border-green-500 bg-green-500/10"
            : error
              ? "border-red-500 bg-red-500/10"
              : "border-secondary-gray bg-secondary-dark-3 hover:border-accent-blue hover:bg-opacity-80"
        }`}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
          id={`upload-${label}`}
          disabled={isUploading}
        />

        {/* Clear Button */}
        {(uploadedUrl || preview) && !isUploading && (
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-secondary-dark rounded-full hover:bg-red-500/20 transition-colors z-10">
            <X className="w-4 h-4 text-secondary-foreground hover:text-red-500" />
          </button>
        )}

        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 text-accent-blue mx-auto mb-3 animate-spin" />
            <p className="text-secondary-foreground text-sm">Uploading...</p>
          </>
        ) : uploadedUrl ? (
          <>
            {preview ? (
              <div className="relative w-20 h-20 mx-auto mb-3 rounded overflow-hidden">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
            )}
            <p className="text-green-500 text-sm font-medium">Uploaded!</p>
            <p className="text-secondary-gray text-xs mt-1 truncate px-2">
              {fileName}
            </p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-accent-blue mx-auto mb-3" />
            <p className="text-secondary-foreground text-sm">{label}</p>
            <p className="text-secondary-gray text-xs mt-2">
              PNG, JPG, or PDF (Max 10MB)
            </p>
          </>
        )}

        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
      </div>
    </div>
  );
}
