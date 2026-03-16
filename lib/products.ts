import { PRODUCTS } from "./const";

export type DeviceType = "CARD" | "WRISTBAND" | "STICKER" | "KEYCHAIN";

export interface Product {
  id?: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  deviceType: DeviceType;
  images: string[];
  features: string[];
  stock: number;
  isCustomizable?: boolean;
  color?: string;
}

// Map products from const.tsx to database format
export const products: Product[] = Object.entries(PRODUCTS).map(
  ([slug, product]) => ({
    slug,
    name: product.title,
    description: `${product.description} ${product.longDescription || ""}`.trim(),
    price: product.price,
    deviceType: "CARD" as DeviceType, // All current products are cards
    images: [product.imageSrc],
    features: product.features || [],
    stock: 100,
    isCustomizable: true,
    color: product.colors?.[0] || null,
  })
);

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find((product) => product.slug === slug);
};

export const getProductsByDeviceType = (deviceType: DeviceType): Product[] => {
  return products.filter((product) => product.deviceType === deviceType);
};

export const getAllProducts = (): Product[] => {
  return products;
};
