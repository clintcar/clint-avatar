import "@/styles/globals.css";
import { Metadata } from "next";
import { Fira_Code as FontMono, Inter as FontSans, Open_Sans as FontOpenSans } from "next/font/google";

import NavBar from "@/components/NavBar";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontOpenSans = FontOpenSans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Meet Judy - Live AI Avatar | Author: Clint Carlson",
    template: `%s - Meet Judy - Live AI Avatar`,
  },
  icons: {
    icon: "/heygen-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} ${fontOpenSans.variable} font-sans`}
      lang="en"
    >
      <head />
      <body className="min-h-screen bg-white text-black">
        <main className="relative flex flex-col gap-6 h-screen w-screen">
          <NavBar />
          {children}
        </main>
      </body>
    </html>
  );
}
