import Script from "next/script";
import "./globals.css";
import { Metadata } from "next";
import NavBar from "../src/components/NavBar";

export const metadata: Metadata = {
  title: {
    default: "CU Anschutz School of Dental Medicine",
    template: `%s - CU Anschutz School of Dental Medicine`,
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

        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XH3R6KN28W" strategy="afterInteractive" />
        <Script id="xr-google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XH3R6KN28W', { project_id: 'sdm01' });`}
        </Script>
</body>
    </html>
  );
}
