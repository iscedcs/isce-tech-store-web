import ProductDetailWrapper from "@/components/products/product-detail-wrapper";
import { PRODUCTS } from "@/lib/const";
import Link from "next/link";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = PRODUCTS[slug];

  if (!product) {
    return (
      <div className="min-h-screen bg-secondary-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-light mb-4">
            Product Not Found
          </h1>
          <p className="text-secondary-foreground mb-8">
            The product you're looking for doesn't exist.
          </p>
          <Link
            href="/"
            className="inline-block bg-accent-blue text-primary font-semibold py-3 px-8 rounded-lg hover:bg-accent-blue-light transition-colors">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-secondary-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-accent-blue hover:text-accent-blue-light transition-colors text-sm font-medium">
            ← Back to Store
          </Link>
        </div>

        <ProductDetailWrapper product={product} />
      </div>
    </main>
  );
}

export async function generateStaticParams() {
  return Object.keys(PRODUCTS).map((slug) => ({
    slug,
  }));
}
