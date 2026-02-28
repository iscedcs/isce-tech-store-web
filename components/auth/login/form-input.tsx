"use client";

import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import React from "react";

interface FormInputProps {
  label: string;
  type?: string;
  svg?: React.ReactNode;
  placeholder: string;
}

export const FormInput = ({
  label,
  type = "text",
  svg,
  placeholder,
}: FormInputProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-black">{label}</Label>

      <div className="relative">
        {/* SVG Icon */}
        {svg && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
            {svg}
          </div>
        )}

        {/* Input */}
        <Input
          type={type}
          placeholder={placeholder}
          className={`h-11 rounded-lg bg-[var(--inputcol)] border border-[var(--inputbor)] ${
            svg ? "pl-10" : "pl-4"
          }`}
        />
      </div>
    </div>
  );
};