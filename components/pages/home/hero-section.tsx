"use client";

export default function HeroSection() {
  return (
    <section className="bg-secondary-dark-2 py-12 sm:py-16 md:py-20 px-4 sm:px-6 text-center text-primary-light">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 sm:mb-4 text-balance">
          Smart Tech
        </h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6 sm:mb-8 text-balance">
          For Smart Living
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-primary-light font-medium max-w-2xl mx-auto">
          Discover cutting edge gadgets and smart product(s) that enhance your
          connect lifestyle
        </p>
      </div>
    </section>
  );
}
