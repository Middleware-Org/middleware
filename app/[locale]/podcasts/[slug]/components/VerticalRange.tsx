"use client";

/* **************************************************
 * Imports
 **************************************************/
import { useRef, useState, useCallback } from "react";
import { MonoTextLight } from "@/components/atoms/typography";
import { cn } from "@/lib/utils/classes";

/* **************************************************
 * Types
 **************************************************/
type VerticalRangeProps = {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  formatValue?: (value: number) => string;
  className?: string;
};

/* **************************************************
 * VerticalRange
 * Custom vertical range input component
 **************************************************/
export default function VerticalRange({
  min,
  max,
  step,
  value,
  onChange,
  label,
  formatValue,
  className,
}: VerticalRangeProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // Use input value when dragging, prop value when not dragging
  const displayValue = isDragging ? inputValue : value;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      setInputValue(newValue);
      onChange(newValue);
    },
    [onChange],
  );

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setInputValue(newValue);
  }, []);

  const handleMouseDown = useCallback(() => {
    setInputValue(value);
    setIsDragging(true);
  }, [value]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(() => {
    setInputValue(value);
    setIsDragging(true);
  }, [value]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const percentage = ((displayValue - min) / (max - min)) * 100;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <MonoTextLight className="text-xs md:text-sm text-secondary/80 whitespace-nowrap">
        {formatValue ? formatValue(displayValue) : displayValue}
      </MonoTextLight>
      <div className="relative w-1 md:w-1.5 h-20 md:h-24 bg-secondary/20">
        <div
          className="absolute bottom-0 left-0 right-0 bg-tertiary"
          style={{ height: `${percentage}%` }}
        />
        <input
          ref={inputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onChange={handleChange}
          onInput={handleInput}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={cn(
            "absolute inset-0 w-full h-full",
            "appearance-none cursor-pointer",
            "bg-transparent",
            "focus:outline-none focus:ring-0",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3",
            "[&::-webkit-slider-thumb]:md:w-4 [&::-webkit-slider-thumb]:md:h-4",
            "[&::-webkit-slider-thumb]:bg-secondary",
            "[&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-webkit-slider-thumb]:border-0",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3",
            "[&::-moz-range-thumb]:md:w-4 [&::-moz-range-thumb]:md:h-4",
            "[&::-moz-range-thumb]:bg-secondary",
            "[&::-moz-range-thumb]:cursor-pointer",
            "[&::-moz-range-thumb]:border-0",
            "[&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:appearance-none",
            // Rotate to make it vertical
            "origin-center",
            "[&::-webkit-slider-thumb]:origin-center",
            "[&::-moz-range-thumb]:origin-center",
          )}
          style={{
            writingMode: "vertical-lr",
            direction: "rtl",
          }}
          aria-label={label}
        />
      </div>
    </div>
  );
}
