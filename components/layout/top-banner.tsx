"use client";

import React from "react";
import { Mail, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";
import {
  EmailIcon,
  FacebookIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/lib/icons";
import MaxWidthWrapper from "../shared/max-width-wrapper";

export default function TopBanner() {
  return (
    <div className="bg-primary-light text-primary-light">
      <MaxWidthWrapper>
        <div className=" px-4 py-3 flex justify-between text-primary items-center">
          {/* Email Section */}
          <div className="flex items-center gap-2 text-sm">
            <EmailIcon className="w-5 h-5" />
            <span>support@isce.tech</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium  ">Follow Us</span>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-blue transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-blue transition-colors">
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-blue transition-colors">
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent-blue transition-colors">
                <YoutubeIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
