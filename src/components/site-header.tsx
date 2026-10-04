"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#work", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader({ resumePath }: { resumePath: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-semibold tracking-tight">
          Zoha Amin
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-[var(--muted)] md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-[var(--fg)]">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {mounted ? (resolvedTheme === "dark" ? "Light" : "Dark") : "Theme"}
          </Button>
          <a href={resumePath} target="_blank" rel="noreferrer">
            <Button type="button" variant="secondary">
              Resume
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
