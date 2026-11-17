import Script from "next/script";
import "./globals.css";
import { Metadata } from "next";
import NavBar from "../src/components/NavBar";
import SiteFooter from "../src/components/SiteFooter";

export const metadata: Metadata = {
  title: {
    default:
      "AME Feedback Practice | CU Anschutz",
    template: `%s | CU Anschutz Academy of Medical Educators`,
  },
  description:
    "Practice faculty feedback with four simulated medical learners and a nine-criterion AME rubric.",
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

        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XH3R6KN28W" strategy="afterInteractive" />
        <Script id="xr-google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XH3R6KN28W', { project_id: 'ame' });`}
        </Script>
</body>
    </html>
  );
}
