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
        className="w-full text-white text-sm bg-zinc-700 py-2 px-6 rounded-lg cursor-pointer flex items-center justify-between h-fit disabled:opacity-50 min-h-[36px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`${props.value ? "text-white" : "text-zinc-400"}`}>
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
          <div className="absolute z-50 w-full max-h-[300px] overflow-y-auto mt-1 rounded-lg border border-zinc-600 bg-zinc-700 shadow-lg py-1">
            {props.options.map((option, index) => {
              const isSelected = props.isSelected(option);

              return (
                <div
                  key={index}
                  className={`py-2 px-4 cursor-pointer hover:bg-zinc-600 outline-none text-sm ${
                    isSelected ? "text-white bg-zinc-500" : "text-zinc-400"
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
