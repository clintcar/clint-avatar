import "./globals.css";
import { Metadata } from "next";
import NavBar from "../src/components/NavBar";

export const metadata: Metadata = {
  title: {
    default: "NURS 6286 Clinical Communication Lab",
    template: `%s | NURS 6286`,
  },
  description:
    "Interactive clinical communication practice for CU Anschutz nursing learners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-[#f5f4f0] text-black">
        <main className="relative flex w-full flex-1 flex-col">
          <NavBar />
          {children}
        </main>
      </body>
    </html>
  );
}
