"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { fadeInUp, staggerContainer } from "@/lib/animation";

export function CtaSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="cta"
      ref={ref}
      className="relative py-24 md:py-32 px-6 bg-primary overflow-hidden">
      <div className="max-w-5xl mx-auto relative">
        {/* Large Decorative Arrow Icon (Matches UI image) */}
        <div className="hidden md:block absolute -top-4 -right-4 md:-top-10 md:-right-10 opacity-20 pointer-events-none">
          <ArrowUpRight
            size={180}
            className="text-secondary-gray stroke-[0.5]"
          />
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="relative z-10 text-center">
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-5xl font-medium tracking-tight text-primary-light mb-6">
            Be Part of Something <span className="font-bold">Exclusive</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-sm md:text-base text-secondary-gray max-w-2xl mx-auto mb-10">
            Join the Ecosystem of the Future and Live the Future, Now.
          </motion.p>

          <motion.div variants={fadeInUp}>
            <a className="inline-flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-primary-light px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-300">
              Free Consultation
              <ArrowRight size={16} />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
