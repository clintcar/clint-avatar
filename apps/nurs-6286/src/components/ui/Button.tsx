import React from "react";

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, onClick, ...props }) => {
  return (
    <button
      className={`h-fit bg-[#CFB87C] px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#bda668] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CFB87C] disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
      onClick={props.disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
};
