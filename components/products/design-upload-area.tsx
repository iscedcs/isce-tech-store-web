"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";

interface DesignUploadAreaProps {
  label: string;
  onFileSelect: (file: File) => void;
}

export default function DesignUploadArea({
  label,
  onFileSelect,
}: DesignUploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-primary-light mb-3">
        {label}
      </label>
      <div
        onClick={handleClick}
        className="border-2 border-dashed border-secondary-gray rounded-lg p-8 text-center bg-secondary-dark-3 hover:border-accent-blue hover:bg-opacity-80 transition-all cursor-pointer">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
          id={`upload-${label}`}
        />
        <Upload className="w-8 h-8 text-accent-blue mx-auto mb-3" />
        <p className="text-secondary-foreground text-sm">{label}</p>
        <p className="text-secondary-gray text-xs mt-2">
          PNG, JPG, or PDF (Max 10MB)
        </p>
      </div>
    </div>
  );
}
