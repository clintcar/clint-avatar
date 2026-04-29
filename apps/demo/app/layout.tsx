import "./globals.css";
import { Metadata } from "next";
import NavBar from "../src/components/NavBar";

export const metadata: Metadata = {
  title: {
    default:
      "Judy - Live AI Avatar for Patient Simulation | Author: Clint Carlson",
    template: `%s - Judy - Live AI Avatar for Patient Simulation`,
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
