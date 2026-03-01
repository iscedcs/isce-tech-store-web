"use client";

interface CustomDesignToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function CustomDesignToggle({
  enabled,
  onToggle,
}: CustomDesignToggleProps) {
  return (
    <div className="bg-secondary-dark-3 border border-secondary-gray rounded-lg p-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-primary-light font-medium mb-1">
            Need a custom design?
          </h4>
          <p className="text-secondary-foreground text-sm">
            Our designers will create a professional card design for you
          </p>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            enabled ? "bg-accent-blue" : "bg-secondary-gray"
          }`}>
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-primary transition-transform ${
              enabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="mt-4 pt-4 border-t border-secondary-gray">
          <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-lg p-4">
            <p className="text-accent-blue font-medium text-sm mb-2">
              Custom design service: ₦3,000.00
            </p>
            <p className="text-secondary-foreground text-xs leading-relaxed">
              This is in addition to the ₦5,000.00 customization fee. Our design
              team will create a professional card design for you. You'll
              receive a draft for approval within 2 business days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
