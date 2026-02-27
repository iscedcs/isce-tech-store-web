"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import ColorSelector from "./color-selector";
import DesignUploadArea from "./design-upload-area";
import CustomDesignToggle from "./custom-design-section";
import PriceBreakdown from "./price-breakdown";

interface CustomizationSectionProps {
  basePrice: number;
  quantity: number;
  onCancel: () => void;
}

export default function CustomizationSection({
  basePrice,
  quantity,
  onCancel,
}: CustomizationSectionProps) {
  const [selectedColor, setSelectedColor] = useState("Arctic White");
  const [previewTab, setPreviewTab] = useState<"upload" | "preview">("upload");
  const [frontDesign, setFrontDesign] = useState<File | null>(null);
  const [backDesign, setBackDesign] = useState<File | null>(null);
  const [customDesignEnabled, setCustomDesignEnabled] = useState(false);

  return (
    <div className="bg-gradient-secondary border border-secondary-gray rounded-lg p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary-light mb-2">
          Card Customization
        </h2>
        <p className="text-secondary-foreground">
          Personalize your NFC card with your own design or let us create one
          for you
        </p>
      </div>

      {/* Alert Box */}
      <div className="bg-primary-light bg-opacity-10 border border-secondary-foreground rounded-lg p-4 flex gap-3">
        <AlertCircle className="text-accent-blue shrink-0" size={20} />
        <p className="text-secondary-foreground text-sm">
          Note: Only one revision is allowed for custom card designs
        </p>
      </div>

      {/* Color Selector */}
      <div>
        <ColorSelector
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
        />
      </div>

      {/* Design Upload Section */}
      <div className="space-y-4">
        <div className="flex border-b border-secondary-gray">
          <button
            onClick={() => setPreviewTab("upload")}
            className={`px-4 py-3 font-medium transition-colors ${
              previewTab === "upload"
                ? "text-accent-blue border-b-2 border-accent-blue -mb-0.5"
                : "text-secondary-foreground hover:text-primary-light"
            }`}>
            Upload Your Design
          </button>
          <button
            onClick={() => setPreviewTab("preview")}
            className={`px-4 py-3 font-medium transition-colors ml-auto ${
              previewTab === "preview"
                ? "text-accent-blue border-b-2 border-accent-blue -mb-0.5"
                : "text-secondary-foreground hover:text-primary-light"
            }`}>
            Preview Design
          </button>
        </div>

        {previewTab === "upload" && (
          <div className="space-y-6 mt-6">
            {/* Front Design */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-primary-light font-semibold">
                  Front Card Design
                </h4>
                <button className="text-accent-blue hover:text-blue-400 text-sm font-medium">
                  ℹ️
                </button>
              </div>
              <DesignUploadArea
                label="Upload Front Design"
                onFileSelect={setFrontDesign}
              />
              {frontDesign && (
                <p className="text-xs text-accent-blue">
                  ✓ {frontDesign.name} uploaded
                </p>
              )}
            </div>

            {/* Back Design */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-primary-light font-semibold">
                  Back Card Design
                </h4>
                <button className="text-accent-blue hover:text-blue-400 text-sm font-medium">
                  ℹ️
                </button>
              </div>
              <DesignUploadArea
                label="Upload Back Design"
                onFileSelect={setBackDesign}
              />
              {backDesign && (
                <p className="text-xs text-accent-blue">
                  ✓ {backDesign.name} uploaded
                </p>
              )}
            </div>
          </div>
        )}

        {previewTab === "preview" && (
          <div className="mt-6 p-8 bg-linear-to-br from-secondary-gradient-1 to-secondary-gradient-3 rounded-lg text-center">
            <p className="text-secondary-foreground">
              Design preview will appear here after upload
            </p>
          </div>
        )}
      </div>

      {/* Custom Design Toggle */}
      <div>
        <CustomDesignToggle
          enabled={customDesignEnabled}
          onToggle={setCustomDesignEnabled}
        />
      </div>

      {/* Price Breakdown */}
      <div>
        <PriceBreakdown
          basePrice={basePrice}
          quantity={quantity}
          isCustomizing={true}
          hasCustomDesign={customDesignEnabled}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 bg-gradient-secondary border border-secondary-gray text-primary-light hover:border-secondary-foreground font-semibold py-3 px-6 rounded-lg transition-colors">
          Cancel Customization
        </button>
        <button className="flex-1 bg-accent-blue hover:bg-blue-600 text-primary-dark font-semibold py-3 px-6 rounded-lg transition-colors">
          Apply Customization
        </button>
      </div>
    </div>
  );
}
