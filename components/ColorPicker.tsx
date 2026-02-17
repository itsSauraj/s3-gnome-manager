"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  "#e74c3c", // Red
  "#e67e22", // Orange
  "#f39c12", // Yellow
  "#2ecc71", // Green
  "#3498db", // Blue
  "#9b59b6", // Purple
  "#1abc9c", // Teal
  "#34495e", // Dark Gray
  "#e91e63", // Pink
  "#00bcd4", // Cyan
  "#ff9800", // Amber
  "#795548", // Brown
];

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value || "#3498db");

  return (
    <div className="space-y-3">
      {/* Preset Colors */}
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="w-8 h-8 rounded border-2 border-[var(--gnome-border)] hover:scale-110 transition-transform flex items-center justify-center"
            style={{ backgroundColor: color }}
            title={color}
          >
            {value === color && <Check size={16} className="text-white drop-shadow" />}
          </button>
        ))}
      </div>

      {/* Custom Color */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            onChange(e.target.value);
          }}
          className="w-12 h-8 rounded border border-[var(--gnome-border)] cursor-pointer"
        />
        <span className="text-xs text-[var(--gnome-text-secondary)]">Custom color</span>
      </div>
    </div>
  );
}
