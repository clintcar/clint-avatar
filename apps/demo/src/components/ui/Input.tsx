import React from "react";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  className,
  ...props
}) => {
  return (
    <input
      className={`w-full text-white text-sm bg-zinc-700 py-2 px-6 rounded-lg outline-none ${className || ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
};
