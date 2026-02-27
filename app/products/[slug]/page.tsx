import ProductDetailWrapper from "@/components/products/product-detail-wrapper";
import { PRODUCTS } from "@/lib/const";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = PRODUCTS[params.slug];

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-light mb-4">
            Product Not Found
          </h1>
          <p className="text-secondary-foreground mb-8">
            The product you're looking for doesn't exist.
          </p>
          <a
            href="/"
            className="inline-block bg-accent-blue text-primary-dark font-semibold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
