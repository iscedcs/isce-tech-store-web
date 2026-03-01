"use client";

interface PriceBreakdownProps {
  basePrice: number;
  quantity: number;
  isCustomizing: boolean;
  hasCustomDesign: boolean;
}

export default function PriceBreakdown({
  basePrice,
  quantity,
  isCustomizing,
  hasCustomDesign,
}: PriceBreakdownProps) {
  const CUSTOMIZATION_FEE = 5000; // ₦
  const DESIGN_SERVICE_FEE = 3000; // ₦

  const baseCost = basePrice * quantity;
  const customizationCost = isCustomizing ? CUSTOMIZATION_FEE : 0;
  const designCost = isCustomizing && hasCustomDesign ? DESIGN_SERVICE_FEE : 0;
  const total = baseCost + customizationCost + designCost;

  return (
    <div className="bg-secondary-dark-3 border border-secondary-gray rounded-lg p-5 space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-secondary-foreground">
          Base Price (₦{basePrice.toLocaleString()} × {quantity})
        </span>
        <span className="text-primary-light font-medium">
          ₦{baseCost.toLocaleString()}
        </span>
      </div>

      {isCustomizing && (
        <>
          <div className="flex justify-between items-center text-sm border-t border-secondary-gray pt-3">
            <span className="text-secondary-foreground">Customization Fee</span>
            <span className="text-primary-light font-medium">
              ₦{customizationCost.toLocaleString()}
            </span>
          </div>

          {hasCustomDesign && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary-foreground">
                Design Service Fee
              </span>
              <span className="text-primary-light font-medium">
                ₦{designCost.toLocaleString()}
              </span>
            </div>
          )}
        </>
      )}

      <div className="flex justify-between items-center text-base font-semibold pt-3 border-t border-secondary-gray">
        <span className="text-primary-light">Total:</span>
        <span className="text-accent-blue">₦{total.toLocaleString()}</span>
      </div>

      {isCustomizing && customizationCost + designCost > 0 && (
        <p className="text-xs text-secondary-foreground italic pt-2">
          Includes ₦{(customizationCost + designCost).toLocaleString()} for
          customization
          {hasCustomDesign && " and design service"}
        </p>
      )}
    </div>
  );
}
