import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | ISCE Store",
  description:
    "Complete your order securely. Enter your shipping information and payment details to finalize your purchase.",
  robots: {
    index: false,
    follow: false,
  },
};

// Force dynamic rendering for the checkout pages
export const dynamic = "force-dynamic";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
