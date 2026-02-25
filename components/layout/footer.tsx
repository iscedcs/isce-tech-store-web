"use client";

import React from "react";
import {
  Mail,
  Phone,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CONTACT_INFO, FOOTER_LINKS, SOCIAL_LINKS } from "@/lib/const";

const IconMap: Record<string, any> = {
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
};

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-primary text-foreground px-4 md:px-10 pb-12">
      <div className="max-w-6xl mx-auto bg-primary-foreground p-8 md:p-16 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16">
          <h3 className="text-2xl font-medium text-muted-foreground">
            Subscribe to our{" "}
            <span className="text-primary-light font-bold">Newsletter</span>
          </h3>
          <div className="flex w-full max-w-xl gap-3">
            <Input
              type="email"
              placeholder="Your email"
              className="flex-1 bg-[#2C2E33] border-none text-primary-light placeholder:text-secondary-gray focus:ring-0 rounded-xl py-6"
            />
            <Button className="bg-accent-blue hover:bg-accent-blue/90 text-primary-light px-8 py-6 rounded-xl font-semibold flex items-center gap-2">
              Subscribe <span className="text-lg">›</span>
            </Button>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-secondary-gray mb-16" />

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company */}
          <div>
            <h4 className="text-accent-blue font-semibold mb-6">Company</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.Company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary-light transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Address & Contact */}
          <div>
            <h4 className="text-accent-blue font-semibold mb-6">
              Address Business
            </h4>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              1st Floor, (Festac Tower) Chicken Republic Building, 22Rd ,Festac
              Town,
              <br />
              Lagos, Nigeria
            </p>

            <h4 className="text-accent-blue font-semibold mb-6">Contact Us</h4>
            <div className="space-y-4 text-sm text-muted-foreground">
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="block hover:text-primary-light transition-colors">
                {CONTACT_INFO.email}
              </a>
              <p>{CONTACT_INFO.phone}</p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-primary-light font-semibold mb-6">Services</h4>
            <ul className="space-y-4">
              {FOOTER_LINKS.Services.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary-light transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Link */}
          <div>
            <h4 className="text-primary-light font-semibold mb-6">
              Quick Link
            </h4>
            <ul className="space-y-4">
              {FOOTER_LINKS["Quick Link"].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary-light transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar with Scroll to Top */}
        <div className="relative pt-8 border-t border-secondary-gray flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-6 text-base font-medium text-secondary-gray">
            <a
              href="https://www.isce.tech/privacy"
              className="hover:text-primary-light transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary-light transition-colors">
              Terms and Condition
            </a>
            <a href="#" className="hover:text-primary-light transition-colors">
              Support
            </a>
          </div>

          {/* Scroll to Top Button (Centered in the border) */}
          <button
            onClick={scrollToTop}
            className="absolute left-1/2 -top-4 -translate-x-1/2 w-8 h-8 rounded-full bg-accent-blue border border-primary-light flex items-center justify-center text-primary shadow-lg hover:scale-110 transition-transform">
            <ChevronUp size={16} />
          </button>

          <div className="flex items-center gap-6">
            <span className="text-xs text-secondary-gray">Follow Us</span>
            <div className="w-8 h-px bg-muted-foreground" />
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((social) => {
                const Icon = IconMap[social.icon];
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-muted-foreground hover:text-primary-light transition-colors">
                    {Icon && <Icon size={16} />}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="text-center mt-8 text-xs text-secondary-gray">
        <p>Copyright © {new Date().getFullYear()} IISCE. All Right Reserved</p>
      </div>
    </footer>
  );
}
