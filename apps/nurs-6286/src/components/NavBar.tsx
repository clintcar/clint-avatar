"use client";

import React from "react";

export default function NavBar() {
  return (
    <header className="w-full text-white">
      <div className="bg-black">
        <div className="mx-auto flex min-h-11 w-full max-w-[1200px] items-center justify-between gap-4 px-5 py-2 sm:px-8">
          <a
            href="https://www.cuanschutz.edu/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm transition-opacity hover:opacity-80"
          >
            <span className="font-black tracking-tight text-[#CFB87C]">CU</span>
            <span>
              University of Colorado{" "}
              <strong className="font-bold">Anschutz</strong>
            </span>
          </a>
          <div className="hidden items-center gap-5 text-xs sm:flex">
            <span>NURS 6286</span>
            <span className="text-[#CFB87C]">•</span>
            <a
              href="https://www.linkedin.com/in/clintcarlson/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#CFB87C]"
            >
              Contact
            </a>
          </div>
        </div>
      </div>

      <div className="border-b border-black bg-[#222222]">
        <div className="mx-auto flex min-h-20 w-full max-w-[1200px] items-center px-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#CFB87C]">
              CU Anschutz
            </p>
            <p className="text-2xl font-black tracking-tight sm:text-3xl">
              College of Nursing
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
