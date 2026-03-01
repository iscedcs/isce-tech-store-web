"use client";

import Link from "next/link";

interface BackButtonProps {
  label1: string;
  label2: string;
  href: string;
}

export const BackButton = ({ label1, label2, href }: BackButtonProps) => {
  return (
    <p className="text-sm text-center text-muted-foreground">
      <Link href={href} className="text-blue-600 font-medium hover:underline">
        <span className="text-[var(--primary)]" >{label1}</span> <span className="text-[var(--backtext)]">{label2}</span>
      </Link>
    </p>
  );
};