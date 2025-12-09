"use client";

import React from "react";

export default function NavBar() {
  return (
    <>
      <div className="flex flex-col w-[1000px] m-auto px-6 pt-6 pb-2">
        <div className="flex flex-row justify-center items-center">
          <p className="text-4xl font-semibold text-black">
            CU Anschutz School of Dental Medicine - Health Assessment Avatar
          </p>
        </div>
        <div className="flex flex-row justify-end items-center gap-4 mt-2">
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
    </>
  );
}
