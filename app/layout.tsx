import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import "./globals.css";
import TopBanner from "@/components/layout/top-banner";
import Navbar from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CtaSection } from "@/components/shared/cta-section";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ISCE - Smart Tech for Smart Living",
  description:
    "Discover cutting edge gadgets and NFC products that enhance your connect lifestyle",
  // icons: {
  //   icon: [
  //     {
  //       url: "/icon-light-32x32.png",
  //       media: "(prefers-color-scheme: light)",
  //     },
  //     {
  //       url: "/icon-dark-32x32.png",
  //       media: "(prefers-color-scheme: dark)",
  //     },
  //     {
  //       url: "/icon.svg",
  //       type: "image/svg+xml",
  //     },
  //   ],
  //   apple: "/apple-icon.png",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} antialiased`}>
        <TopBanner />
        <Navbar />
        {children}
        <CtaSection />
        <Footer />
      </body>
    </html>
  );
}
