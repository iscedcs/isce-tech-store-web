"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import ColorSelector from "./color-selector";
import DesignUploadArea from "./design-upload-area";
import CustomDesignToggle from "./custom-design-section";
import PriceBreakdown from "./price-breakdown";
import { useCartStore } from "@/lib/store/cart-store";
import { useToastContext } from "../providers/toast-provider";

interface CustomizationSectionProps {
  productTitle: string;
  basePrice: number;
  quantity: number;
  availableColors: string[];
  onCancel: () => void;
}

export default function CustomizationSection({
  productTitle,
  basePrice,
  quantity,
  availableColors,
  onCancel,
}: CustomizationSectionProps) {
  const [selectedColor, setSelectedColor] = useState(availableColors[0]);
  const [frontDesign, setFrontDesign] = useState<File | null>(null);
  const [backDesign, setBackDesign] = useState<File | null>(null);
  const [customDesignEnabled, setCustomDesignEnabled] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { addItem } = useCartStore();
  const { toast } = useToastContext();

  const handleAddCustomizedToCart = async () => {
    setIsAdding(true);
    try {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      addItem({
        id: `${productTitle}-${Date.now()}`,
        slug: productTitle.toLowerCase().replace(/\s+/g, "-"),
        title: `${productTitle} (Customized)`,
        price: basePrice,
        quantity,
        selectedColor,
        customization: {
          frontDesign,
          backDesign,
          hasCustomDesign: customDesignEnabled,
        },
      });

      toast({
        title: "Customized card added to cart",
        description: `${quantity}x customized ${productTitle} added successfully`,
      });

      onCancel();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-secondary-dark-2 border border-secondary-gray rounded-lg p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-primary-light mb-2">
          Customize {productTitle}
        </h2>
        <p className="text-secondary-foreground text-sm">
          Design your unique card with custom colors and artwork
        </p>
      </div>

      {/* Alert Box */}
      <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-lg p-4 flex gap-3">
        <AlertCircle className="text-accent-blue shrink-0" size={20} />
        <p className="text-secondary-foreground text-sm">
          Customization changes may require additional processing time
        </p>
      </div>

      {/* Color Selector */}
      <div>
        <ColorSelector
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          colors={availableColors}
        />
      </div>

      {/* Design Upload Section */}
      <div className="space-y-4">
        <h3 className="text-primary-light font-semibold text-sm">
          Design Files
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DesignUploadArea
            label="Front Design"
            onFileSelect={setFrontDesign}
          />
          <DesignUploadArea label="Back Design" onFileSelect={setBackDesign} />
        </div>
        {(frontDesign || backDesign) && (
          <div className="bg-secondary-dark-3 border border-secondary-gray rounded-lg p-3">
            <p className="text-sm text-primary-light font-medium mb-2">
              Files Selected:
            </p>
            {frontDesign && (
              <p className="text-xs text-secondary-foreground">
                📄 Front: {frontDesign.name}
              </p>
            )}
            {backDesign && (
              <p className="text-xs text-secondary-foreground">
                📄 Back: {backDesign.name}
              </p>
            )}
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
