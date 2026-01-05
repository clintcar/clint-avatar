import "./globals.css";
import { Metadata } from "next";
import NavBar from "../src/components/NavBar";

export const metadata: Metadata = {
  title: {
    default: "NURS 6286 – Estrella Lopez | Director: Clint Carlson",
    template: `%s - NURS 6286 – Estrella Lopez`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white flex flex-col min-h-screen text-black">
        <main className="relative flex flex-col gap-2 w-full">
          <NavBar />
          <div className="flex flex-col items-center justify-center flex-1">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
