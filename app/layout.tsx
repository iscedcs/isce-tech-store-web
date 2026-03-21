import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import "./globals.css";
import TopBanner from "@/components/layout/top-banner";
import Navbar from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CtaSection } from "@/components/shared/cta-section";
import { ToastProvider } from "@/components/providers/toast-provider";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ISCE - Smart Tech for Smart Living",
  description:
    "Discover cutting edge gadgets and smart products that enhance your connect lifestyle",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={`${montserrat.variable} antialiased`}>
          <ToastProvider>
            <div className="sticky top-0 z-50">
              <TopBanner />
              <Navbar />
            </div>
            {children}
            <CtaSection />
            <Footer />
          </ToastProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
