"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";
export default function App() {
  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="w-[900px] flex flex-col items-start justify-start gap-5 mx-auto pt-4 pb-20">
        <div className="w-full">
          <InteractiveAvatar />
        </div>
        <div className="w-full flex justify-start items-center gap-4">
          <a
            href="https://www.linkedin.com/in/clintcarlson/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:text-zinc-600 text-sm font-medium transition-colors"
          >
            Author: Clint Carlson
          </a>
          <span className="text-black text-sm">|</span>
          <a
            href="https://www.linkedin.com/in/clintcarlson/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:text-zinc-600 text-sm font-medium transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}
