"use client";

import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

interface FormInputProps {
  label: string;
  type?: string;
  placeholder: string;
}

export const FormInput = ({
  label,
  type = "text",
  placeholder,
}: FormInputProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm text-black">{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        className="h-11 rounded-lg"
      />
    </div>
  );
};