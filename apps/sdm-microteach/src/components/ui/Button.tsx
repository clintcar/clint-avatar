import React from "react";

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, onClick, ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center min-h-[42px] px-[17px] py-2.5 rounded-[6px] bg-sdm-black text-white text-[0.92rem] font-semibold disabled:opacity-50 h-fit hover:bg-[#333] focus:bg-[#333] ${className || ""}`}
      onClick={props.disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
};
