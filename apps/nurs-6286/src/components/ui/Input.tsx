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
      className={`w-full border border-zinc-500 bg-white px-4 py-2.5 text-sm text-black outline-none transition-colors focus:border-[#CFB87C] focus:ring-2 focus:ring-[#CFB87C]/30 ${className || ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
};
