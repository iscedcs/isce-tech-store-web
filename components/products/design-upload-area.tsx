"use client";

import { Upload } from "lucide-react";

interface DesignUploadAreaProps {
  label: string;
  onFileSelect: (file: File) => void;
}

export default function DesignUploadArea({
  label,
  onFileSelect,
}: DesignUploadAreaProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-primary-light mb-3">
        {label}
      </label>
      <div className="border-2 border-dashed border-secondary-gray rounded-lg p-8 text-center bg-gradient-secondary hover:bg-opacity-80 transition-all cursor-pointer">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
          id={`upload-${label}`}
        />
        <label htmlFor={`upload-${label}`} className="cursor-pointer block">
          <Upload className="w-8 h-8 text-accent-blue mx-auto mb-3" />
          <p className="text-secondary-foreground text-sm">{label}</p>
        </label>
      </div>
    </div>
  );
}
