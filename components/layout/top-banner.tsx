"use client";

import React from "react";
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
        <div className="px-4 py-2 sm:py-3 flex flex-col gap-2 sm:flex-row sm:justify-between text-primary items-center">
          {/* Email Section */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-center sm:text-left">
            <EmailIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="break-all sm:break-normal">support@isce.tech</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs sm:text-sm font-medium">Follow Us</span>
            <div className="flex gap-2 sm:gap-3">
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
