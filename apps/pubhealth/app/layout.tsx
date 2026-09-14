import "./globals.css";
import { Metadata } from "next";
import NavBar from "../src/components/NavBar";
import SiteFooter from "../src/components/SiteFooter";

export const metadata: Metadata = {
  title: {
    default:
      "Live Avatar Conversations | Centers for Health, Work & Environment",
    template: `%s | Centers for Health, Work & Environment`,
  },
  description:
    "Practice live conversations with policymakers, journalists, and community members at the Centers for Health, Work & Environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-chwe-ink font-sans flex flex-col">
        <a className="skip-link" href="#main">
          Skip to conversation
        </a>
        <NavBar />
        <main id="main" className="flex-1 bg-white">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
