import "./globals.css";
import { Metadata } from "next";
import NavBar from "../src/components/NavBar";

export const metadata: Metadata = {
  title: {
    default:
      "Live Avatars - Centers for Health, Work & Environment Conversations | Author: Clint Carlson",
    template: `%s - Live Avatars - Centers for Health, Work & Environment Conversations`,
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
          <div className="flex flex-col items-center flex-1 w-full py-4">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
