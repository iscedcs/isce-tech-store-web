"use client";

interface ColorSelectorProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const CARD_COLORS = [
  "Arctic White",
  "Midnight Black",
  "Deep Blue",
  "Gold",
  "Silver",
];

export default function ColorSelector({
  selectedColor,
  onColorChange,
}: ColorSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-primary-light mb-3">
        Card Color
      </label>
      <div className="relative">
        <select
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-full px-4 py-3 bg-gradient-secondary border border-secondary-gray rounded-lg text-primary-light focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue appearance-none cursor-pointer">
          {CARD_COLORS.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-secondary-foreground">
          ▼
        </div>
      </div>
    </div>
  );
}
