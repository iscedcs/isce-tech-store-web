import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Delivery options with Lagos locations
export const deliveryOptions = [
  {
    id: "pickup",
    name: "Store Pickup",
    description: "Pick up your order at one of our store locations",
    price: 0,
    locations: [
      {
        id: "lagos-ikeja",
        name: "Lagos - Ikeja Store",
        address: "23 Allen Avenue, Ikeja, Lagos",
      },
      {
        id: "lagos-lekki",
        name: "Lagos - Lekki Store",
        address: "12B Admiralty Way, Lekki Phase 1, Lagos",
      },
      {
        id: "lagos-vi",
        name: "Lagos - Victoria Island",
        address: "Plot 1415 Adeola Hopewell Street, Victoria Island, Lagos",
      },
      {
        id: "lagos-festac",
        name: "Lagos - Festac Store",
        address: "AMG Workspace, Festac Town, Lagos",
      },
    ],
  },
  {
    id: "lagos-delivery",
    name: "Lagos Delivery",
    description: "Delivery within Lagos (1-2 business days)",
    price: 4000,
  },
  {
    id: "nationwide-delivery",
    name: "Nationwide Delivery",
    description: "Delivery to other states in Nigeria (3-5 business days)",
    price: 10000,
  },
];

export const paymentMethods = [
  {
    id: "paystack",
    name: "Paystack",
    description: "Pay securely with Paystack",
  },
];

// VAT calculation (7.5% in Nigeria)
export const calculateVAT = (amount: number): number => {
  return Math.round(amount * 0.075);
};
