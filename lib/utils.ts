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

// Warehouses/Distribution Centers
export const warehouses = [
  {
    id: 1,
    name: "YUMARIB Warehouse",
    address: "34 Oguntolu St, Somolu, Lagos 102216, Lagos, Nigeria",
    city: "Lagos",
    state: "Lagos",
    latitude: 6.5368,
    longitude: 3.3713,
  },
  {
    id: 2,
    name: "Chicken Republic Distribution Center",
    address: "22 Road, Festac Town, Lagos, Nigeria",
    city: "Lagos",
    state: "Lagos",
    latitude: 6.4651,
    longitude: 3.2851,
    isDefault: true,
  },
  {
    id: 3,
    name: "Maruwa Warehouse",
    address: "Maruwa Bus Stop, Remi Olowude Street, Lekki, Nigeria",
    city: "Lekki",
    state: "Lagos",
    latitude: 6.4298,
    longitude: 3.4679,
  },
];

export const defaultWarehouse =
  warehouses.find((w) => w.isDefault) || warehouses[1];

// Pickup station fee (in Naira)
export const PICKUP_STATION_FEE = 750;

// Delivery options with Lagos locations
export const deliveryOptions = [
  {
    id: "pickup",
    name: "Store Pickup",
    description: "Pick up your order at one of our store locations",
    price: PICKUP_STATION_FEE,
    locations: [
      {
        id: "lagos-lekki",
        name: "Lagos - Lekki Store",
        address:
          "Plot 1, Polyster Building, Maruwa Bus Stop, 128 Remi Olowude St, Lekki Phase 1, Lagos",
      },
      {
        id: "lagos-festac",
        name: "Lagos - Festac Store",
        address: "22rd Festac Tower, AMG Workspace, Festac Town, Lagos",
      },
    ],
  },
  {
    id: "home-delivery",
    name: "Home Delivery",
    description: "Delivery across Nigeria via GIG Logistics",
    price: 0, // Actual price comes from GIG API
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
