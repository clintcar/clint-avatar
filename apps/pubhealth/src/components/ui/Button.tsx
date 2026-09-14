import React from "react";

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, onClick, ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center min-h-[42px] px-[17px] py-2.5 rounded-[3px] bg-chwe-blue text-white text-[0.92rem] font-bold disabled:opacity-50 h-fit hover:bg-chwe-blue-dark focus:bg-chwe-blue-dark ${className || ""}`}
      onClick={props.disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </button>
  );
};
