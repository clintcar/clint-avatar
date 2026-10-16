import React, { useState } from "react";
import { ChevronDownIcon } from "./Icons";

interface SelectProps<T> {
  options: T[];
  renderOption: (option: T) => React.ReactNode;
  onSelect: (option: T) => void;
  isSelected: (option: T) => boolean;
  value: string | null | undefined;
  placeholder?: string;
  disabled?: boolean;
}

export function Select<T>(props: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full">
      <button
        type="button"
        disabled={props.disabled}
        className="flex min-h-11 h-fit w-full cursor-pointer items-center justify-between border border-zinc-500 bg-white px-4 py-2 text-sm text-black transition-colors hover:border-[#CFB87C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CFB87C] disabled:opacity-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`${props.value ? "text-black" : "text-zinc-500"}`}>
          {props.value ? props.value : props.placeholder}
        </div>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-1 max-h-[300px] w-full overflow-y-auto border border-zinc-300 bg-white py-1 shadow-xl">
            {props.options.map((option, index) => {
              const isSelected = props.isSelected(option);

              return (
                <div
                  key={index}
                  className={`cursor-pointer px-4 py-2.5 text-sm outline-none hover:bg-[#f0eadb] ${
                    isSelected
                      ? "bg-[#CFB87C] font-bold text-black"
                      : "text-zinc-700"
                  }`}
                  onClick={() => {
                    props.onSelect(option);
                    setIsOpen(false);
                  }}
                >
                  {props.renderOption(option)}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
